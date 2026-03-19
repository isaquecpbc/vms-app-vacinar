<?php
namespace App\Task\Control;

use App\Task\Library\Assistant;
use App\Task\Model\AddAtendimento;
use App\Task\Model\GetAtendimento;
use App\Task\Model\ListarAgendamento;
use App\Task\Model\ListarElegivel;
use App\Task\Model\Participante;
use DateTimeImmutable;
use App\Library\Cryptor;
use App\Task\Model\AddAgendamento;
use App\Task\Model\Conveniada;
use Phalcon\Logger\Adapter\File as FileAdapter;

class SesiTaskControl {
    private $em;
    public $campanhaId = 244; // 181 - Campanha SESI 2023
    private $idEmpresaSESI = 108; // ID da empresa SESI
    private $campanhasSESI = [];
    private $logFile;
    private $aCNPJError = [];
    private $logger = null;
    private $file_report = null;

    public function __construct($em, $logFile = null, $filelogname = null) {
        $this->em = $em;
        $this->logFile = $logFile;
        $this->campanhaId = (int)(getenv('SESI_CAMPANHA_ID') ?: $this->campanhaId);
        $this->idEmpresaSESI = (int)(getenv('SESI_EMPRESA_ID') ?: $this->idEmpresaSESI);

        // Cria path de log de forma robusta para execucao via cron/container.
        $pathLogBase = dirname(__DIR__, 3) . '/data/logs';
        $pathLog = $pathLogBase . '/sesi';

        if (file_exists($pathLog) && !is_dir($pathLog)) {
            $pathLog = $pathLogBase . '/sesi_logs';
        }

        if (!is_dir($pathLog) && !@mkdir($pathLog, 0777, true) && !is_dir($pathLog)) {
            throw new \RuntimeException("Nao foi possivel criar o diretorio de logs SESI: {$pathLog}");
        }

        $logFilePath = $pathLog . '/' . ($filelogname ?: date('Ymd')) . '.log';
        $reportFilePath = $pathLog . '/' . ($filelogname ?: date('YmdHi')) . '.csv';

        $this->logger = new FileAdapter($logFilePath);
        $this->file_report = @fopen($reportFilePath, 'a');

        if ($this->file_report === false) {
            $this->file_report = null;
            error_log("Nao foi possivel abrir arquivo de relatorio SESI: {$reportFilePath}");
        }
    }

    /**
     * Método funciona obtendo as campanhas do ano corrente
     */
    public function getAllCampanhas() {
        // $this->campanhasSESI = [24,25,26,27];
        $sesiApi = new SesiTaskApi;
        // return $this->campanhasSESI;

        $this->writeLog('Iniciando consulta de campanhas SESI');

        $apiResult = $sesiApi->getCampanhas();
        if ($apiResult && $apiResult->Item && !empty($apiResult->Item)) {
            foreach($apiResult->Item as $campanha) {
                if (isset($campanha->Codigo)) {
                    $this->campanhasSESI[] = $campanha->Codigo;
                }
            }

            $this->campanhasSESI = array_values(array_unique($this->campanhasSESI));

            $this->writeLog('Campanhas encontradas para o ano corrente: ' . implode(',', $this->campanhasSESI));
        } else {
            $mensagem = ($apiResult && isset($apiResult->Mensagem)) ? $apiResult->Mensagem : 'SEM_MENSAGEM';
            $this->writeLog('Nenhuma campanha retornada pela API SESI. Mensagem: ' . $mensagem, 'warning');
        }

        return $this->campanhasSESI;
    }

    public function syncAplicacoesNaoElegivelSgcToSesi($participanteEmpresaId) {
        $campanhas = $this->getAllCampanhas();
        $sesiApi = new SesiTaskApi;
        #$participanteEmpresaId = 1262;
        $filters = [
            'campanhaId' => $this->campanhaId,
            // 'participanteCodigoExterno'=> '43852774861',
            'aplicados' => 'yes',
            'temEmpresaId' => 'no',
            'descricaoVazia' => 'yes',
        ];

        if($participanteEmpresaId) {
            $filters['participanteEmpresaId'] = $participanteEmpresaId;
        }

        $oAplicacao = $this->em->getRepository('\App\Entity\Aplicacao')
            ->fetchCollection(null, $filters, [], 1, 10000);
        $path = __DIR__.'/../../../data/logs';
        $fileLog = realpath($path) . '/log_sync_aplicacoes_nao_elegivel_'.$participanteEmpresaId.'.log';
        $fPointer = fopen($fileLog, 'a');
        $count = 0;
        foreach ($oAplicacao as $aplicacao) {
            $count++;
            echo "$count => {$aplicacao['participanteCodigoExterno']}\n";

            if(!empty($aplicacao['participanteContatoDescricao'])) {
                echo "=> JA SINCRONIZADO|{$aplicacao['participanteContatoDescricao']}\n\n";
                continue;
            }

            $mensagemErro = '';

        }
    }

    public function paginateElegiveis(Conveniada $conveniada, $statusAtendimento = false, $cpf = null) {
        $sesiApi = new SesiTaskApi;
        $count = 0;

        $em = clone $this->em;
        $filters = [
            'empresaId' => $conveniada->Id,
            'campanhaId' => $this->campanhaId
        ];
        $oParticipantes = $em->getRepository('\App\Entity\CampanhaParticipante')
            ->fetchCollection(null, $filters, [], 1, 100000);

        for( $i = 1; $i <= 1000; $i++ ) {
            $filtro = new ListarElegivel;
            $filtro->CNPJ = Assistant::formatCNPJ($conveniada->CNPJ);
            $filtro->Atendido = $statusAtendimento;
            if ($cpf) {
                $filtro->CPF = Assistant::formatCPF($cpf);
            }
            $elegiveis = $sesiApi->getElegivel($filtro, $i); // NOVO

            if (empty($elegiveis->Item)) {
                // Somente gera erro se não houver participante na primeira pagina
                if ($i == 1) {
                    $this->writeLog("Nenhum elegivel encontrado para a planta $conveniada->CodigoSESI ($conveniada->CNPJ) Pagina: [{$i}]", 'warning');
                }
                break;
            }

            if (!$conveniada->Id) {
                $objConveniada = $this->checkConveniadaByCnpj($conveniada);
            }
            else {
                $objConveniada = [
                    'id' => $conveniada->Id,
                    'cnpj' => $conveniada->CNPJ
                ];
            }

            foreach ($elegiveis->Item as $elegivel) {
                try {
                    $count++;
                    if (!$elegivel->CPF) {
                        $this->writeLog("SEM CPF: CODIGO ELEGIVEL: ($elegivel->Codigo) => CNPJ: ({$conveniada->CNPJ})", 'error');
                        continue;
                    }

                    $Ano = (new DateTimeImmutable($elegivel->DataAlteracao))->format('Y');
                    if ($Ano !== date('Y')) {
                        $this->writeLog("DATA ATUALIZAÇÃO DIFERENTE DO ANO CORRENTE: ($elegivel->Codigo) => CNPJ: ({$conveniada->CNPJ})", 'warning');
                        continue;
                    }

                    $participante = new Participante(
                        $elegivel->CPF,
                        $objConveniada['cnpj'],
                        $elegivel->Nome,
                        $elegivel->DataNascimento,
                        null,
                        $objConveniada['id']
                    );
                    $this->writeLog("Participante {$participante->Nome} ({$participante->CPF}) => TOTAL: {$count}");

                    $participanteCadastrado = false;
                    foreach($oParticipantes as $participanteDB) {
                        $cpfDecode = Cryptor::cryptoJsAesDecrypt('123456',$participanteDB['cpf']);
                        if(Assistant::formatCPF($elegivel->CPF) == Assistant::formatCPF($cpfDecode)) {
                            $participanteCadastrado = true;
                            break;
                        }
                    }

                    if($participanteCadastrado) {
                        $this->writeLog("Participante {$participante->Nome} JA CADASTRADO");
                        continue;
                    }

                    if($elegivel->CPFFuncionarioResponsavel) {
                        $participante->setCPFParticipantePrincipal($elegivel->CPFFuncionarioResponsavel);
                    }

                    $obj = $this->checkParticipante($participante);
                    $participante->CodigoSGC = $obj['id'];
                    $obj = $this->checkAplicacao($participante);
                }
                catch (\Exception $e) {
                    $this->writeLog("paginateElegiveis: (cnpj: {$conveniada->CNPJ}) {$e->getMessage()}", 'error');
                }
            }
        }
    }

    public function syncAplicacoesSgcToSesiByFile() {
        $campanhas = $this->getAllCampanhas();
        $sesiApi = new SesiTaskApi;

        $count = 0;
        $path = __DIR__.'/../../../data/logs';
        $fileLog = realpath($path) . '/log_participantes_reciflex_nova_vacinar.log';
        $fPointer = fopen($fileLog, 'a');
        $file = $path.'/../RECIFLEX_NOVA_VACINAR.csv';
        // $file = $path.'/../HITACHI_API.csv';
        $cnpjErro = [];
        // $file = $path.'/../sesi_participantes_erro.csv';
        if (($handle = fopen(realpath($file), 'r')) !== FALSE) {
            while (($data = fgetcsv($handle, 1000, ";")) !== FALSE) {
                $count++;

                // list($cnpj,$codigoExterno,$nome,$dtNascimento,,,,,$dtAplicacao) = array_map('trim', array_map('utf8_encode', $data));
                list($cnpj,$codigoExterno,$nome,$dtNascimento) = array_map('trim', array_map('utf8_encode', $data));
                // 61074829001103	2762901863	Jose Roberto de Paiva	03/04/1956
                $participante = new Participante(
                    $codigoExterno,
                    $cnpj,
                    $nome,
                    $dtNascimento
                );

                echo "$count => {$codigoExterno}\n";

                // var_dump($cnpj,$codigoExterno,$nome,$dtNascimento,$dtAplicacao);
                $mensagemErro = 'ERRO!';
                if(!in_array($participante->CNPJ, $cnpjErro)) {
                    foreach ($campanhas as $campanha) {
                        echo "{$participante->CNPJ} => $campanha\n";
                        $agendamentos = $sesiApi->getAgendamento($participante->CNPJ, $campanha);
                        //var_dump($agendamentos);
                        if($agendamentos && $agendamentos->Item) {
                            echo "TEM " . count($agendamentos->Item) . " ANGENDAMENTOS.\n";
                            // var_dump($agendamentos->Item);
                            break;
                        }
                    }
                }
// die("PASSOU");
                try {
                    if($agendamentos && $agendamentos->Item) {
                        echo "ENTROU\n";
                        $list = new GetAtendimento;
                        $list->CNPJ = $participante->CNPJ;
                        $list->CPF = $participante->CPF;
                        $atendimentos = $sesiApi->getAtendimento($list, true);
    // var_dump(['$list' => $list, '$atendimento'=>$atendimentos]);
                        $tem_atendimento = false;
                        if ($atendimentos && count($agendamentos->Item)) {
                            foreach($atendimentos->Item as $atendimento) {
                                echo "ATENDIMENTO -> {$atendimento->DataAtendimento}\n";
                                $date = new DateTimeImmutable($atendimento->DataAtendimento);
                                $tem_atendimento = $date->format('Y') == date('Y');
                                if ($tem_atendimento) {
                                    break;
                                }
                            }
                        }

                        if(!$tem_atendimento) {
                            $data = new AddAtendimento;
                            $data->Tipo = "Funcionario";
                            $data->CPF = $participante->CPF;
                            $data->Sexo = 1;
                            $data->DataNascimento = $participante->DataNascimento;
                            $data->Nome = $participante->Nome;
                            $data->InformacoesAdicionais = null;
/// Aqui agendamento
                            $this->registerAtendimentoSesi($data, $agendamentos->Item);
                        }
                        else {
                            echo "\nTEM ATENDIMENTO\n";
                            $mensagemErro = 'TEM ATENDIMENTO';
                            // $this->em->getRepository('\App\Entity\CampanhaParticipante')->update($aplicacao['participanteId'], ['descricao' => 'SYNC:'.date('Y-m-d H:i:s')]);
                        }
                    }
                    else {
                        $cnpjErro[] = $cnpj;
                        $mensagemErro = 'EMPRESA SEM AGENDAMENTO!';
                    }
                }
                catch (\Exception $e) {
                    $mensagemErro = $e->getMessage();
                    echo "ERRO: {$mensagemErro}\n";

                    // if (strpos($e->getMessage(), 'SQLSTATE[23000]') !== false) {
                    //     echo "Parando por 4 minutos para ver se o servidor retorna\n";
                    //     sleep(240);
                    // }
                }

                $data = [$cnpj,$codigoExterno,$nome,$dtNascimento,$mensagemErro];
                fputcsv($fPointer, $data);
            }
        }
    }

    public function sendAplicacoesSgcToSesi($cnpj, $cpf, $partial = null) {
        $campanhas = $this->getAllCampanhas();
        $sesiApi = new SesiTaskApi;
        $filters = [
            'campanhaId' => $this->campanhaId,
            // 'participanteCodigoExterno'=> '201999374',
            'aplicados' => 'yes',
            'descricaoVazia' => 'yes',
            // 'conveniadaRazao' => 'IBEMA'
        ];

        if ($cpf) {
            $filters['participanteCodigoExterno'] = $cpf;
        }

        $count = 1;
        $aCNPJSemAgendamento = [];
        $agendamentosValidados = [];
        $oAplicacoes = $this->em->getRepository('\App\Entity\Aplicacao')
            ->fetchCollection(null, $filters, [], $count, 1000);

        while (count($oAplicacoes)) {
            $rowReport = [];
            echo "PAGINA: {$count}\n";
            foreach($oAplicacoes as $aplicacao) {
                // execução parcial para rodar 3 scripts de uma vez
                if($partial !== null && ($aplicacao['id'] % 3)+1 !== ($partial*1)) {
                    continue;
                }

                if (!$this->em->isOpen()) {
                    $this->em = $this->em->create(
                        $this->em->getConnection(),
                        $this->em->getConfiguration()
                    );
                }

                if ($partial !== null) {
                    echo "Partial: {$partial} => {$aplicacao['id']}\n";
                }

                $filtro = new ListarElegivel;
                $filtro->CNPJ = Assistant::formatCNPJ($aplicacao['participanteUnidadeCnpj']);
                $filtro->CPF = Assistant::formatCPF(Cryptor::cryptoJsAesDecrypt('123456',$aplicacao['participanteCpf']));

                if(empty($filtro->CPF*1)) {
                    $filtro->CPF = $aplicacao['participanteCodigoExterno'];
                }

                $atendimento = new AddAtendimento;
                $atendimento->Tipo = "Funcionario";
                $atendimento->Nome = Cryptor::cryptoJsAesDecrypt('123456', $aplicacao['participanteNome']);
                $atendimento->CPF = $filtro->CPF;
                $atendimento->Sexo = 1;
                $atendimento->DataNascimento = $aplicacao['participanteDtNascimento'];
                $atendimento->InformacoesAdicionais = null;

                // Verifica se ja foi contatado que não há agendamento
                if(in_array($filtro->CNPJ, $aCNPJSemAgendamento)) {
                    $this->writeReport($atendimento, $filtro->CNPJ, "CNPJ SEM AGENDAMENTO");
                    continue;
                }

                foreach ($campanhas as $campanha) {
                    echo "{$filtro->CNPJ} => $campanha\n";
                    $agendamentos = $sesiApi->getAgendamento($filtro->CNPJ, $campanha);
                    if($agendamentos && $agendamentos->Item) {
                        break;
                    }
                }

                if(!($agendamentos && $agendamentos->Item)) {
                    // TODO: Nao encontrou agendamento
                    $this->writeLog("NAO ENCONTROU AGENDAMENTO: {$filtro->CNPJ}", 'error');
                    $this->writeReport($atendimento, $filtro->CNPJ, "CNPJ SEM AGENDAMENTO");
                    // Armazena para não ter que verificar novamente o agendamento
                    $aCNPJSemAgendamento[] = $filtro->CNPJ;
                    continue;
                }

                $resPlantas = $sesiApi->getPlantas($agendamentos->Item[0]->CodigoCampanha, $agendamentos->Item[0]->CNPJ);

                if (!($resPlantas && isset($resPlantas->Item) && is_array($resPlantas->Item))) {
                    $this->writeLog("NAO ENCONTROU PLANTAS PARA VALIDAR AGENDAMENTO: {$filtro->CNPJ}", 'error');
                    $this->writeReport($atendimento, $filtro->CNPJ, "PLANTA NAO ENCONTRADA");
                    continue;
                }

                $temErro = false;
                foreach($agendamentos->Item as $agendamento) {
                    $status = false;
                    foreach($resPlantas->Item as $planta) {
                        if ($agendamento->QuantidadeAtendimentos == $planta->QuantidadeAtendimentos) {
                            $status = true;
                            break;
                        }
                    }
                    if(!$status) {
                        $this->writeLog("AGENDAMENTO NAO BATE (TEM ERRO): {$agendamento->CNPJ} / {$agendamento->Codigo}", 'error');
                        $temErro = true;
                    }
                    $agendamentosValidados[$agendamento->Codigo] = $status;
                }

                if($temErro) {
                    $this->writeReport($atendimento, $filtro->CNPJ, "AGENDAMENTO DIVERGENTE");
                    continue;
                }

                $filtroAtendimento = new GetAtendimento;
                $filtroAtendimento->CNPJ = $filtro->CNPJ;
                $filtroAtendimento->CPF = $filtro->CPF;
                $atendimentos = $sesiApi->getAtendimento($filtroAtendimento, true);

                $tem_atendimento = false;
                if ($atendimentos && count($agendamentos->Item)) {
                    foreach($atendimentos->Item as $atend) {
                        // $this->writeLog("ATENDIMENTO -> {$filtroAtendimento->CPF} / {$atend->DataAtendimento}");
                        $date = new DateTimeImmutable($atend->DataAtendimento);
                        $tem_atendimento = $date->format('Y') == date('Y');
                        if ($tem_atendimento) {
                            break;
                        }
                    }
                }

                if($tem_atendimento) {
                    try {
                        $this->writeReport($atendimento, $filtro->CNPJ, "ATENDIMENTO EXISTENTE");
                        $this->em->getRepository('\App\Entity\CampanhaParticipante')->update($aplicacao['participanteId'], ['descricao' => 'SYNC:'.date('Y-m-d H:i:s')]);
                    }
                    catch (\Exception $e) {
                        $this->writeLog("ERRO REGISTRA-ATENDIMENTO-SGC {$filtroAtendimento->CPF}|{$e->getMessage()}", 'error');
                        if (!$this->em->isOpen()) {
                            $this->em = $this->em->create(
                                $this->em->getConnection(),
                                $this->em->getConfiguration()
                            );
                        }
                    }
                    $this->writeLog("TEM ATENDIMENTO -> {$filtroAtendimento->CPF}");
                    continue;
                }

                $this->writeLog("NOVO ATENDIMENTO -> {$filtroAtendimento->CPF} / {$filtroAtendimento->CNPJ}");

                try {
                    $msg = $this->registerAtendimentoSesi($atendimento, $agendamentos->Item, $aplicacao['participanteId']);
                    $this->writeReport($atendimento, $filtro->CNPJ, $msg);
                    if($msg !== 'SUCESSO!'
                        && $msg !== 'SUCESSO-DEPENDENTE!'
                        && !str_contains($msg, "Data de Nascimento")
                        && !str_contains($msg, "CPF")) {
                        $this->writeLog("ERRO -> {$filtroAtendimento->CPF} / {$filtroAtendimento->CNPJ} => {$msg}", 'error');
                    }
                }
                catch (\Exception $e) {
                    $this->writeLog("ERRO REGISTERATENDIMENTOSESI {$filtroAtendimento->CPF}|{$e->getMessage()}", 'error');
                    $this->writeReport($atendimento, $filtro->CNPJ, $e->getMessage());
                    if (!$this->em->isOpen()) {
                        $this->em = $this->em->create(
                            $this->em->getConnection(),
                            $this->em->getConfiguration()
                        );
                    }
                }
            }

            try {
                // Proxima paginação
                $oAplicacoes = $this->em->getRepository('\App\Entity\Aplicacao')
                    ->fetchCollection(null, $filters, [], $count++, 1000);
            }
            catch (\Exception $e) {
                $this->writeLog("ERRO PROXIMA PAGINACAO count: {$count}|{$e->getMessage()}", 'error');
                if (!$this->em->isOpen()) {
                    $this->em = $this->em->create(
                        $this->em->getConnection(),
                        $this->em->getConfiguration()
                    );
                }
            }
        }
    }

    private function registerAtendimentoSesi(AddAtendimento $atendimento, array $agendamentos, $participanteId = null) {
        $aErroBreak = [
            'Erro: Data de Nascimento Inválida.',
            'Erro: CPF Inválido!'
        ];
        $sesiApi = new SesiTaskApi;
        $limiteAgendamentoErro = [];
        foreach($agendamentos as $agendamento) {
            if(in_array($agendamento->Codigo, $limiteAgendamentoErro)) {
                $mensagemErro = 'A Quantidade de Atendimentos ultrapassa o limite do Agendamento!';
                $this->writeLog("Erro Agendamento (Codigo: {$agendamento->Codigo}) limite alcançado", 'error');
                continue;
            }

            $em = clone $this->em;
            $atendimento->CodigoAgendamento = $agendamento->Codigo;
            $result = $sesiApi->setAtendimentoElegivel($atendimento);
            // echo "================= RESULT =================\n";
            // var_dump($result);
            // echo "================= RESULT/FIM =================\n";
            if ($result->Mensagem !== 'Sucesso!') {
                # Atendimento já efetuado! (Agendamento:2698)
                if (preg_match('/\(Agendamento\:/', $result->Mensagem) || preg_match('/Essa pessoa já foi atendida/', $result->Mensagem)) {
                    $mensagemErro = 'SUCESSO!';
                    if($participanteId) {
                        try {
                            $em->getRepository('\App\Entity\CampanhaParticipante')->update($participanteId, ['descricao' => 'SYNC:'.date('Y-m-d H:i:s')]);
                        }
                        catch (\Exception $e) {
                            $this->writeLog("ERRO UPDATE PARTICIPANTE 01 - {$atendimento->CPF}|{$e->getMessage()}", 'error');
                            if (!$em->isOpen()) {
                                $em = $em->create(
                                    $em->getConnection(),
                                    $em->getConfiguration()
                                );
                            }
                        }

                    }
                    break;
                }
                elseif (preg_match('/A Quantidade de Atendimentos ultrapassa o limite do Agendamento/', $result->Mensagem)) {
                    // var_dump('$data->CodigoAgendamento',$data->CodigoAgendamento);
                    $limiteAgendamentoErro[] = $atendimento->CodigoAgendamento;
                    continue;
                }
                elseif (preg_match('/Elegível não Encontrado/', $result->Mensagem)) {
                    $atendimento->Tipo = "Dependente";
                    $result = $sesiApi->setAtendimentoElegivel($atendimento);
                    if ($result->Mensagem == 'Sucesso!') {
                        $mensagemErro = 'SUCESSO-DEPENDENTE!';
                        $this->writeLog("SUCESSO DEPENDENTE {$atendimento->CPF}", 'info');
                        if($participanteId) {
                            $em->getRepository('\App\Entity\CampanhaParticipante')->update($participanteId, ['descricao' => 'SYNC:'.date('Y-m-d H:i:s')]);
                        }
                        // $em->getRepository('\App\Entity\CampanhaParticipante')->update($aplicacao['participanteId'], ['descricao' => 'SYNC:'.date('Y-m-d H:i:s')]);
                        break;
                    }
                    else {
                        //die("*** ERRO - DEPENDENTE *****");
                        $mensagemErro = "Erro ao cadastrar agendamento DEPENDENTE|{$atendimento->CPF}|{$result->Mensagem}";
                        $this->writeLog($mensagemErro, 'error');
                    }
                }
                else {
                    // var_dump($result);
                    echo("***** ERRO *****");
                    $mensagemErro = "Erro ao cadastrar agendamento|{$atendimento->CPF}|{$result->Mensagem}";
                    $this->writeLog($mensagemErro, 'error');
                    if(in_array($result->Mensagem, $aErroBreak)) {
                        if(str_contains($result->Mensagem, "Data de Nascimento")) {
                            $filtro = new ListarElegivel;
                            $filtro->CPF = $atendimento->CPF;
                            $filtro->CNPJ = Assistant::formatCNPJ($agendamento->CNPJ);
                            $elegivel = $sesiApi->getElegivel($filtro);
                            if($elegivel->Item) {
                                $em->getRepository('\App\Entity\CampanhaParticipante')->update($participanteId, ['dtNascimento' => $elegivel->Item[0]->DataNascimento]);
                            }
                        }
                        echo("***** PARANDO TENTATIVAS MATCH MSG ERRO *****");
                        $this->writeLog("PARANDO TENTATIVAS MATCH MSG ERRO {$atendimento->CPF}", 'error');
                        break;
                    }
                }
            }
            else {
                $mensagemErro = 'SUCESSO!';
                if($participanteId) {
                    $em->getRepository('\App\Entity\CampanhaParticipante')->update($participanteId, ['descricao' => 'SYNC:'.date('Y-m-d H:i:s')]);
                }
                // $em->getRepository('\App\Entity\CampanhaParticipante')->update($aplicacao['participanteId'], ['descricao' => 'SYNC:'.date('Y-m-d H:i:s')]);
                break;
            }
        }

        return $mensagemErro;
    }

    public function syncAplicacoesSgcToSesi($participanteEmpresaId) {
        $campanhas = $this->getAllCampanhas();
        $sesiApi = new SesiTaskApi;
        $participanteEmpresaId = 3360;
        $filters = [
            'campanhaId' => $this->campanhaId,
            // 'participanteCodigoExterno'=> '201999374',
            'aplicados' => 'yes',
            // 'descricaoVazia' => 'yes',
            // 'conveniadaRazao' => 'IBEMA'
        ];

        if(0 && $participanteEmpresaId) {
            $filters['participanteEmpresaId'] = $participanteEmpresaId;
        }

        $path = __DIR__.'/../../../data/logs';
        $file = $path.'/../participantes_sesi_2023.csv';
//         if (($handle = fopen(realpath($file), 'r')) !== FALSE) {
//             while (($data = fgetcsv($handle, 1000, ";")) !== FALSE) {
//                 var_dump($data);
//                 list($cnpj,$codigoExterno,$nome,$dtNascimento,,,,,$dtAplicacao) = array_map('trim', array_map('utf8_encode', $data));
//                 var_dump($cnpj,$codigoExterno,$nome,$dtNascimento,,,,,$dtAplicacao);
//                 exit;
//             }
//         }
// die('passou');

        $oAplicacao = $this->em->getRepository('\App\Entity\Aplicacao')
            ->fetchCollection(null, $filters, [], 1, 5000);

        $path = __DIR__.'/../../../data/logs';
        $fileLog = realpath($path) . '/log_sync_aplicacoes_'.$participanteEmpresaId.'.log';
        $fPointer = fopen($fileLog, 'a');
        $count = 0;
        foreach ($oAplicacao as $aplicacao) {
            $count++;
            echo "$count => {$aplicacao['participanteCodigoExterno']}\n";
            if(empty($aplicacao['participanteEmpresaId'])) {
                echo "=> SEM EMPRESA-ID\n\n";
                continue;
            }

            // if(!empty($aplicacao['participanteContatoDescricao'])) {
            //     echo "=> JA SINCRONIZADO|{$aplicacao['participanteContatoDescricao']}\n\n";
            //     continue;
            // }
            // if(!empty($aplicacao['participanteContatoDescricao']) && preg_match('/SYNC\\:([0-9]{4}-[0-9]{2}-[0-9]{2})/', $aplicacao['participanteContatoDescricao'], $matches) && $matches[1]) {
            //     $date = new DateTimeImmutable($matches[1]);
            //     if ($date->format('Y-m-d') === '2023-08-30' || $date->format('Y-m-d') === '2023-08-31' || $date->format('Y-m-d') === '2023-09-01') {
            //         echo "=> JA SINCRONIZADO|{$aplicacao['participanteContatoDescricao']}\n\n";
            //         continue;
            //     }
            // }
            echo "\$count => $count\n";

            $mensagemErro = '';
            try {
                $oClinica = $this->em->getRepository('\App\Entity\Conveniada')
                    ->fetch($aplicacao['participanteEmpresaId']);

                if (empty($oClinica)) {
                    throw new \Exception("SEM CLINICA");
                }
// var_dump('$oClinica[\'cnpj\']', $oClinica['cnpj']);
                foreach ($campanhas as $campanha) {
                    echo "{$oClinica['cnpj']} => $campanha\n";
                    $agendamentos = $sesiApi->getAgendamento($oClinica['cnpj'], $campanha);
                    // var_dump($agendamentos);exit;
                    if($agendamentos && $agendamentos->Item) {
                        // var_dump($agendamentos);exit;
                        break;
                    }
                }

                if($agendamentos && $agendamentos->Item) {
                    echo "ENTROU\n";
                    $participante = new Participante(
                        $aplicacao['participanteCodigoExterno'],
                        $oClinica['cnpj'],
                        'NOME FAKE'
                    );
                    $list = new GetAtendimento;
                    $list->CNPJ = $oClinica['cnpj'];
                    $list->CPF = $participante->CPF;
                    $atendimentos = $sesiApi->getAtendimento($list, true);
// var_dump(['$list' => $list, '$atendimento'=>$atendimentos]);

                    $tem_atendimento = false;
                    if ($atendimentos && count($agendamentos->Item)) {
                        foreach($atendimentos->Item as $atendimento) {
                            echo "ATENDIMENTO -> {$atendimento->DataAtendimento}\n";
                            $date = new DateTimeImmutable($atendimento->DataAtendimento);
                            $tem_atendimento = $date->format('Y') == date('Y');
                            if ($tem_atendimento) {
                                break;
                            }
                        }
                    }

                    if(!$tem_atendimento) {
                        $data = new AddAtendimento;
                        $data->Tipo = "Funcionario";
                        $data->CPF = $aplicacao['participanteCodigoExterno'];
                        $data->Sexo = 1;
                        $data->DataNascimento = $aplicacao['participanteDtNascimento'];
                        $data->Nome = Cryptor::cryptoJsAesDecrypt('123456', $aplicacao['participanteNome']);
                        $data->InformacoesAdicionais = null;
                        $aErroBreak = [
                            'Erro: Data de Nascimento Inválida.',
                            'Erro: CPF Inválido!'
                        ];
                        foreach($agendamentos->Item as $agendamento) {
                            $em = clone $this->em;
                            $data->CodigoAgendamento = $agendamento->Codigo;
                            $result = $sesiApi->setAtendimentoElegivel($data);
                            echo "================= RESULT =================\n";
                            var_dump($result);
                            echo "================= RESULT/FIM =================\n";
                            if ($result->Mensagem !== 'Sucesso!') {
                                # Atendimento já efetuado! (Agendamento:2698)
                                if (preg_match('/\(Agendamento\:/', $result->Mensagem) || preg_match('/Essa pessoa já foi atendida/', $result->Mensagem)) {
                                    $em->getRepository('\App\Entity\CampanhaParticipante')->update($aplicacao['participanteId'], ['descricao' => 'SYNC:'.date('Y-m-d H:i:s')]);
                                    break;
                                }
                                elseif (preg_match('/Elegível não Encontrado/', $result->Mensagem)) {
                                    $data->Tipo = "Dependente";
                                    $result = $sesiApi->setAtendimentoElegivel($data);
                                    if ($result->Mensagem == 'Sucesso!') {
                                        echo "ENTROU DEPENDENTE\n";
                                        $em->getRepository('\App\Entity\CampanhaParticipante')->update($aplicacao['participanteId'], ['descricao' => 'SYNC:'.date('Y-m-d H:i:s')]);
                                        break;
                                    }
                                    else {
                                        die("*** ERRO - DEPENDENTE *****");
                                        throw new \Exception("Erro ao cadastrar agendamento DEPENDENTE|{$result->Mensagem}");
                                    }
                                }
                                else {
                                    // var_dump($result);
                                    echo("***** ERRO *****");
                                    $mensagemErro = "Erro ao cadastrar agendamento|{$result->Mensagem}";
                                    echo "$mensagemErro\n";
                                    if(in_array($result->Mensagem, $aErroBreak)) {
                                        echo("***** PARANDO TENTATIVAS MATCH MSG ERRO *****");
                                        break;
                                    }
                                }
                            }
                            else {
                                $em->getRepository('\App\Entity\CampanhaParticipante')->update($aplicacao['participanteId'], ['descricao' => 'SYNC:'.date('Y-m-d H:i:s')]);
                                break;
                            }
                        }
                    }
                    else {
                        echo "\nTEM ATENDIMENTO\n";
                        $this->em->getRepository('\App\Entity\CampanhaParticipante')->update($aplicacao['participanteId'], ['descricao' => 'SYNC:'.date('Y-m-d H:i:s')]);
                    }
                }
                else {
                    throw new \Exception("SEM AGENDAMENTO SESI");
                }
            }
            catch (\Exception $e) {
                $mensagemErro = $e->getMessage();
                echo "ERRO: {$mensagemErro}\n";

                // if (strpos($e->getMessage(), 'SQLSTATE[23000]') !== false) {
                //     echo "Parando por 4 minutos para ver se o servidor retorna\n";
                //     sleep(240);
                // }
            }

            $data = [$aplicacao['participanteCodigoExterno'], $oClinica['cnpj'], $mensagemErro];
            fputcsv($fPointer, $data);
        }

        echo "\$count => $count\n";
    }

    public function removeAplicacoesSesi($participanteEmpresaId) {
        $campanhas = $this->getAllCampanhas();
        $sesiApi = new SesiTaskApi;
        #$participanteEmpresaId = 1262;
        $filters = [
            'campanhaId' => $this->campanhaId,
            //'participanteCodigoExterno'=> '00013845381',
            // 'descricaoVazia' => 'yes',
        ];

        if($participanteEmpresaId) {
            $filters['participanteEmpresaId'] = $participanteEmpresaId;
        }

        $oAplicacao = $this->em->getRepository('\App\Entity\Aplicacao')
            ->fetchCollection(null, $filters, [], 1, 100000);
        $path = __DIR__.'/../../../data/logs';
        $fileLog = realpath($path) . '/log_sesi_remove_aplicacoes_'.$participanteEmpresaId.'.log';
        $fPointer = fopen($fileLog, 'a');
        $count = 0;
        foreach ($oAplicacao as $aplicacao) {
            $count++;
            echo "$count => {$aplicacao['participanteCodigoExterno']}\n";
            if(empty($aplicacao['participanteEmpresaId'])) {
                echo "=> SEM EMPRESA-ID\n\n";
                continue;
            }

            if(!empty($aplicacao['participanteContatoDescricao']) && empty($aplicacao['dtAplicacao'])) {
                echo "=> JA SINCRONIZADO|{$aplicacao['participanteContatoDescricao']}\n\n";
                die('entrou!');
            }

            // $data = [$aplicacao['participanteCodigoExterno'], $oClinica['cnpj'], $mensagemErro];
            fputcsv($fPointer, $data);
        }

        echo "\$count => $count\n";
    }

    private function writeReport(AddAtendimento $atendimento, string $cnpj, string $msg) {
        echo "$msg\n";
        $row = [
            $atendimento->Tipo,
            $atendimento->CPF,
            $atendimento->Nome,
            $atendimento->DataNascimento,
            $atendimento->CPFResponsavel,
            $cnpj,
            $msg
        ];
        if (is_resource($this->file_report)) {
            fputcsv($this->file_report, $row);
        }
    }

    private function writeLog($msg, $type = 'info') {
        echo "$msg\n";
        if($this->logFile) {
            fwrite($this->logFile, "$msg\n");
        }
        if (!$this->logger) {
            return;
        }
        switch ($type) {
            case 'error': $this->logger->error($msg); break;
            case 'critical': $this->logger->critical($msg); break;
            case 'warning': $this->logger->warning($msg); break;
            default: $this->logger->info($msg);
        }
    }

    public function syncParticipantes($cnpj = null, $cpf = null) {
        $em = clone $this->em;
        $filters = ['empresaIdPai' => $this->idEmpresaSESI];
        if($cnpj) {
            $filters['cnpjFilha'] = $cnpj;
        }
        $oEmpresaAssociada = $em->getRepository('\App\Entity\EmpresaEmpresa')
            ->fetchCollection(null, $filters);

        foreach ($oEmpresaAssociada['associadas'] as $oConveniada) {
            // dd($oConveniada);
            $conveniada = new Conveniada;
            $conveniada->CNPJ = $oConveniada['cnpj'];
            $conveniada->Id = $oConveniada['id'];
            $conveniada->Endereco = $oConveniada['rua'];
            $this->paginateElegiveis($conveniada, false, $cpf);
        }
    }

    public function getPlantas($cnpj = null) {
        $this->getAllCampanhas();
        $sesiApi = new SesiTaskApi;

        $campanhas = $this->campanhasSESI;
        foreach ($campanhas as $c) {
            $this->writeLog("CAMPANHA_ID: {$c}");

            $plantas = $sesiApi->getPlantas($c, $cnpj);
            $total = $plantas->Item ? count($plantas->Item) : 0;
            $this->writeLog("Total de plantas: {$total}");

            if (!$plantas->Item) {
                $this->writeLog("====>>>  SEM PLANTAS PARA A CAMPANHA: {$c} <<<====", 'warning');
                continue;
            }

            foreach ( $plantas->Item as $idx => $val ) {
                $oEndereco = Assistant::getPlantaEndereco($val->Endereco);

                // echo("\n$idx;$val->Codigo;$val->CNPJ;$val->RazaoSocial;$val->Endereco");
                $cnpjFormatted = preg_replace('/^0+/', '', $val->CNPJ);

                $data = [
                    'razao' => $val->RazaoSocial,
                    'cnpj' => $cnpjFormatted,
                    'rua' => $oEndereco->Endereco,
                    'cidade' => $oEndereco->Cidade,
                    'bairro' => $oEndereco->Bairro,
                    'cep' => $oEndereco->CEP,
                    'estado' => 'SP',
                    'quantidadeAtendimentos' => $val->QuantidadeAtendimentos,
                ];
                $this->writeLog('"' . implode('","', $data) . '"');
            }
        }
    }

    public function syncPlantasAndClinicas($cnpj = null) {
        $this->getAllCampanhas();
        $sesiApi = new SesiTaskApi;

        $campanhas = $this->campanhasSESI;
        foreach ($campanhas as $c) {
            $this->writeLog("CAMPANHA_ID: {$c}");

            $plantas = $sesiApi->getPlantas($c, $cnpj);
            $total = $plantas->Item ? count($plantas->Item) : 0;
            $this->writeLog("Total de plantas: {$total}");

            if (!$plantas->Item) {
                $this->writeLog("====>>>  SEM PLANTAS PARA A CAMPANHA: {$c} <<<====", 'warning');
                continue;
            }

            foreach ( $plantas->Item as $idx => $val ) {
                $oEndereco = Assistant::getPlantaEndereco($val->Endereco);

                echo("\n$idx;$val->Codigo;$val->CNPJ;$val->RazaoSocial;$val->Endereco");
                $cnpjFormatted = preg_replace('/^0+/', '', $val->CNPJ);
                $em = clone $this->em;
                $oClinicas = $em->getRepository('\App\Entity\Empresa')
                    ->fetchCollection(null, ['cnpj' => $cnpjFormatted, 'cep' => $oEndereco->CEP]);

                if ($oClinicas) {
                    $idClinica = $oClinicas[0]['id'];
                    $this->writeLog("Encontrou $val->CNPJ");
                    if (empty($oClinicas[0]['descricao'])) {
                        $this->writeLog("Atualizando Complemento $val->CNPJ");

                        try {
                            $em->getRepository('\App\Entity\Empresa')->update($oClinicas[0]['id'], ['descricao' => $val->Codigo, 'complemento' => $val->QuantidadeAtendimentos]);
                        } catch (\Exception $e) {
                            $this->writeLog("Erro UPDATE Empresa: {$e->getMessage()}", 'error');
                            continue;
                        }
                    }

                    $oClinica = current($oClinicas);
                } else {
                    $this->writeLog("Inserindo nova clinica $val->CNPJ");
                    $data = [
                        'razao' => $val->RazaoSocial,
                        'cnpj' => $cnpjFormatted,
                        'descricao' => $val->Codigo,
                        'rua' => $oEndereco->Endereco,
                        'cidade' => $oEndereco->Cidade,
                        'bairro' => $oEndereco->Bairro,
                        'cep' => $oEndereco->CEP,
                        'estado' => 'SP',
                    ];

                    try {
                        $oClinica = $em->getRepository('\App\Entity\Empresa')
                            ->create($data);
                    } catch (\Exception $e) {
                        $this->writeLog("Erro INSERT Empresa: {$e->getMessage()}", 'error');
                        continue;
                    }
                    $idClinica = $oClinica['id'];
                }

                $oEmpresaAssociada = $em->getRepository('\App\Entity\EmpresaEmpresa')
                    ->fetchCollection(null, ['empresaIdPai' => $this->idEmpresaSESI, 'empresaIdFilha' => $idClinica]);

                if (!$oEmpresaAssociada) {
                    $this->writeLog("Associando a empresa $val->CNPJ");
                    $data = [
                        'empresaIdPai' => $this->idEmpresaSESI,
                        'empresaIdFilha' => $idClinica,
                    ];

                    try {
                        $oCampanhaClinica = $em->getRepository('\App\Entity\EmpresaEmpresa')
                            ->create($data);
                    } catch (\Exception $e) { }
                }
                else {
                    $this->writeLog("Empresa já associada $val->CNPJ ($idClinica)");
                }
            }
        }

        if($cnpj) {
            return $oClinica;
        }
    }

    public function addParticipantesSesiSgc(Participante $participante) {
        $sesiApi = new SesiTaskApi;

        echo "\n====>>>  CPF: {$participante->CPF} <<<====\n";
        if (in_array($participante->CNPJ, $this->aCNPJError)) {
            throw new \Exception("O CNPJ '{$participante->CNPJ}' apresentou algum problema anteriormente", 404);
        }

        $filtro = new GetAtendimento;
        $filtro->CPF = $participante->CPF;
        $resultAtendimento = $this->getSearchAtendimentoByCampanha($filtro);

        // Tem atendimento registrado
        if ($resultAtendimento) {
            throw new \Exception('TEM ATENDIMENTO', 410);
        }

        $filtro = new ListarAgendamento;
        $filtro->CNPJ = Assistant::formatCNPJ($participante->CNPJ);
        $agendamentos = $this->getSearchAgendamentosByCampanha($filtro);

        $filtro = new ListarElegivel;
        $filtro->CPF = $participante->CPF;
        $filtro->CNPJ = Assistant::formatCNPJ($participante->CNPJ);
        $elegivel = $sesiApi->getElegivel($filtro);

        // Deve cadastrar participante NãoElegivel
        if ($elegivel && $elegivel->Mensagem == 'Erro: A consulta retornou vazio!') {
            echo ("Nao elegivel!!!");
            $data = new AddAtendimento;
            $data->CPF = $participante->CPF;
            $data->DataNascimento = $participante->DataNascimento;
            $data->Nome = $participante->Nome;
            $data->Sexo = 1;
            $data->Tipo = 'Funcionario';
            $data->InformacoesAdicionais = null;
        }
        elseif ($elegivel) {
            echo ("Elegivel!!!");
            $data = new AddAtendimento;
            $data->Tipo = "Funcionario";
            $data->CPF = $participante->CPF;
            $data->Nome = $participante->Nome;
            $data->DataNascimento = $participante->DataNascimento;
            $data->Sexo = 1;
            $data->InformacoesAdicionais = null;
            $data->Tipo = $elegivel->Item[0]->Tipo;
        }
        else {
            throw new \Exception("Não foi possivel montar o objeto Participante '{$elegivel->Mensagem}'", 404);
        }

        if (empty($agendamentos->Item)) {
            $this->aCNPJError[] = $participante->CNPJ;
            throw new \Exception("Nao existe agendamento cadastrado para o CNPJ '{$participante->CNPJ}'", 404);
        }

        $arrSuccessMessage = [];
        foreach ($agendamentos->Item as $agendamento) {
            $data->CodigoAgendamento = $agendamento->Codigo;
            $ret = $sesiApi->setAtendimentoElegivel($data);
            if ($ret->Mensagem === 'Erro: A Quantidade de Atendimentos ultrapassa o limite do Agendamento!') {
                echo "Trocando o codigo do atendimento {$agendamento->Codigo}\n";
                continue;
            }

            // if (!empty($ret->Mensagem)) {
            //     fwrite($this->logFile, ";{$ret->Mensagem}");
            // }
            // $content = "Atendimento registrado ($participante->CPF)";
            // fwrite($this->logFile, ";{$content}");
            // echo $content;
            throw new \Exception($ret->Mensagem, 410);
        }
    }

    public function checkConveniadaByCnpj (Conveniada $conveniada) {
        $oConveniadas = $this->em->getRepository('\App\Entity\Empresa')
            ->fetchCollection(null, [
                'cnpj' => $conveniada->CNPJ,
            ]);

        if (empty($oConveniadas)) {
            $oConveniada = $this->syncPlantasAndClinicas($conveniada->CNPJ);
            $this->writeLog("NOVA CONVENIADA -> checkConveniadaByCnpj");
        }
        else {
            $oConveniada = current($oConveniadas);
        }

        return $oConveniada;
    }

    public function adicionarAgendamento($emsce) {
        $sesiApi = new SesiTaskApi;
        $agendamento = new AddAgendamento;
        $filePlantaAgendamento = fopen(__DIR__ . '/../../../data/logs/plantas_sesi_agendamento.csv', 'a');
        fputcsv($filePlantaAgendamento, [
            'cnpj', 'razao', 'endereco', 'cep', 'bairro', 'cidade', 'quantidadeAtendimentoSESI',
            'cepSCE', 'qtdSCE', 'dataAgendamento', 'horario'
        ]);
// '01123340000172'
        $results = $emsce->getRepository('\App\Entity\Sce\CampanhasAgenda')
            ->getAgendamentosFromEmpresa();


        $campanhas = $this->getAllCampanhas();
        foreach($results as $item) {
            $qtd = $item['doses_enviadas'];
            $cnpj = Assistant::formatCNPJ($item['cnpj']);
            $horario = implode(' - ', [$item['horario_inicial'],$item['horario_final']]);
            $cep = str_replace('-', '', $item['cep']);
            $date = \DateTime::createFromFormat("d/m/Y", $item['data']);
            if(!$date) {
                $this->writeLog("DATA INVALIDA => ".implode(',',$item), 'error');
                continue;
            }

            $encontrou = false;
            $cepPlantas = [];
            $oPlantaSesi = null;
            foreach ($campanhas as $campanha) {
                $plantas = $sesiApi->getPlantas($campanha, $cnpj);
                if($plantas && $plantas->Item && count($plantas->Item)) {
                    foreach($plantas->Item as $planta) {
                        $oPlantaSesi = $planta;
                        $oEndereco = Assistant::getPlantaEndereco($planta->Endereco);
                        $cepPlantas[] = $oEndereco->CEP;
                        if($oEndereco->CEP == $cep) {
                            $encontrou = true;
                            break 2;
                        }
                    }
                    break;
                }
            }
            // dd($plantas);
            // var_dump($encontrou);
            if(!$encontrou) {
                // Gera um arquivo com as info necessarias para corrreçoes no sce
                if ($plantas->Item) {
                    foreach($plantas->Item as $planta) {
                        $oEndereco = Assistant::getPlantaEndereco($planta->Endereco);
                        fputcsv($filePlantaAgendamento, [
                            $planta->CNPJ,$planta->RazaoSocial,$oEndereco->Endereco,
                            $oEndereco->CEP,$oEndereco->Bairro,$oEndereco->Cidade,$planta->QuantidadeAtendimentos,
                            $cep, $qtd, $item['data'], $horario
                        ]);
                    }
                    $mensagemErro = "NAO ENCONTROU PLANTA => ".implode(',',$item).',('.implode('|',$cepPlantas).')';
                }
                else {
                    $mensagemErro = "PLANTA NÃO CADASTRADA NO SESI => ".implode(',',$item);
                }

                $this->writeLog($mensagemErro, 'error');
                continue;
            }

            // Validar se ja existe agendamento para essa empresa
            $agendamentos = $sesiApi->getAgendamento($cnpj, $campanha);
            // dd($agendamentos);
            if($agendamentos && $agendamentos->Item && count($agendamentos->Item)) {
                $encontrou = false;
                foreach ($agendamentos->Item as $objAgendamento) {
                    if($date->format('Y-m-d') === (new \DateTime($objAgendamento->Data))->format('Y-m-d')
                        && $objAgendamento->Horario === $horario
                        && $objAgendamento->QuantidadeAtendimentos == $qtd
                    ) {
                        $encontrou = true;
                        break;
                    }

                    // $msgErr = [];
                    // if($objAgendamento->Horario === $horario) {
                    //     $msgErr[] = 'Diferença Horário';
                    // }

                    // if(($objAgendamento->QuantidadeAtendimentos != $qtd)
                    //     || ($objAgendamento->QuantidadeAtendimentos != $qtd)
                    //     || ($oPlantaSesi->QuantidadeAtendimentos != $objAgendamento->QuantidadeAtendimentos)) {
                    //     $msgErr[] = 'Diferença qtde doses';
                    // }

                    // if($date->format('Y-m-d') === (new \DateTime($objAgendamento->Data))->format('Y-m-d')) {
                    //     $msgErr[] = 'Diferença horario agendamento';
                    // }

                    // if(empty($msgErr)) {
                    //     $encontrou = true;
                    //     break;
                    // }
                    // else {
                    //     fputcsv($filePlantaAgendamento, [
                    //         $oPlantaSesi->CNPJ,$oPlantaSesi->RazaoSocial,$oEndereco->Endereco,
                    //         $oEndereco->CEP,$oEndereco->Bairro,$oEndereco->Cidade,$oPlantaSesi->QuantidadeAtendimentos,
                    //         $cep, $qtd, $item['data'], $horario, implode('/',$msgErr)
                    //     ]);
                    // }
                }

                if($encontrou) {
                    $this->writeLog("Agendamento já cadastrado => {$cnpj}|{$campanha}", 'info');
                    continue;
                }
                else {
                    $this->writeLog("Agendamento precisa ser excluido => {$cnpj}|{$campanha} => {$date->format('Y-m-d')} === {$objAgendamento->Data} / {$objAgendamento->Horario} === {$horario} / {$objAgendamento->QuantidadeAtendimentos} == {$qtd}", 'error');
                }
            }

            foreach($plantas->Item as $planta) {
                $oEndereco = Assistant::getPlantaEndereco($planta->Endereco);

                $agendamento->Data = $date->format('Y-m-d');
                $agendamento->Horario = $horario;
                $agendamento->CodigoPlanta = $planta->Codigo;
                $agendamento->QuantidadeAtendimentos = $qtd;
                $agendamento->TipoAgendamento = "Padrão";
                $agendamento->StatusAtivo = true;
                $agendamento->InformacoesAdicionais = null;

                $retorno = $sesiApi->addAgendamento($agendamento);
                if($retorno->Mensagem === 'Sucesso!') {
                    $this->writeLog("SUCESSO AGENDAMENTO {$oEndereco->CEP} => ".implode(',',$item), 'info');
                    break;
                }
                else {
                    $this->writeLog("ERRO AO CADASTRAR O AGENDAMENTO {$oEndereco->CEP} => ".implode(',',$item) . " <= {$retorno->Mensagem}", 'error');
                }
            }
        }

    }

    /**
     * Se houver participante no SGC e nao houver no SESI, será removido
     * Se não houver aplicação
     */
    public function syncParticipantesSGCtoSESI () {
        $sesiApi = new SesiTaskApi;

        $campanhas = $this->getAllCampanhas();

        $count = 1;
        $aParticipantes = $this->em->getRepository('\App\Entity\CampanhaParticipante')
            ->fetchCollection(null, [
                'campanhaId' => $this->campanhaId,
            ], [], $count, 5000);

        while (count($aParticipantes)) {
            echo "PAGINA: {$count}\n";
            foreach($aParticipantes as $participante) {
                $filtro = new ListarElegivel;
                $filtro->CNPJ = Assistant::formatCNPJ($participante['empresaCnpj']);
                $filtro->CPF = Assistant::formatCPF(Cryptor::cryptoJsAesDecrypt('123456',$participante['cpf']));
                $encontrou = false;
                foreach($campanhas as $campanha) {
                    $filtro->CodigoCampanha = $campanha;
                    $elegiveis = $sesiApi->getElegivel($filtro); // NOVO
                    if (!empty($elegiveis->Item)) {
                        // $this->writeLog("Removido sem aplicação", 'info');
                        $encontrou = true;
                        break;
                    }
                }

                if($encontrou) {
                    $this->writeLog("ENCONTROU PARTICIPANTE => CNPJ: {$filtro->CNPJ} CPF: {$filtro->CPF}", 'info');
                }
                else {
                    try {
                        $em = clone $this->em;

                        $aAplicacoes = $this->em->getRepository('\App\Entity\Aplicacao')
                            ->fetchCollection(null, [
                                'campanhaId' => $this->campanhaId,
                                'aplicados' => 'yes',
                                'participanteCpf' => $participante['cpf']
                            ]);

                        $this->writeLog("Não encontrou na API do SESI => CNPJ: {$filtro->CNPJ} CPF: {$filtro->CPF}", 'warning');
                        if(empty($aAplicacoes)) {
                            $this->writeLog("Removido sem aplicação", 'info');
                            $em->getRepository('\App\Entity\CampanhaParticipante')->deleteLogic($participante['id']);
                            $em->flush();
                            $em->clear(); // Detaches all objects from Doctrine!
                        }
                        else {
                            $this->writeLog("Possui aplicação, não removido", 'info');
                        }
                    }
                    catch (\Exception $e) {
                        $this->writeLog("syncParticipantesSGCtoSESI: (cpf: {$filtro->CPF}) {$e->getMessage()}", 'error');
                    }
                }
            }

            $aParticipantes = $this->em->getRepository('\App\Entity\CampanhaParticipante')
                ->fetchCollection(null, [
                    'campanhaId' => $this->campanhaId,
                ], [], $count++, 5000);
        }
    }

    public function checkParticipante (Participante $participante) {
        $oParticipante = $this->em->getRepository('\App\Entity\CampanhaParticipante')
            ->fetchCollection(null, [
                'campanhaId' => $this->campanhaId,
                'cpf' => $participante->CPF
            ]);

        try {
            if (empty($oParticipante)) {
                $data = [
                    'campanhaId' => $this->campanhaId,
                    'codigoExterno' => $participante->CPF,
                    'cpf' => $participante->CPF,
                    'dtAceite' => date('Y-m-d H:i', strtotime('now')),
                    'nome' => $participante->Nome,
                    'dtNascimento' => $participante->DataNascimento,
                    'empresaId' => $participante->CodigoSGCEmpresa,
                ];

                if($participante->CPFParticipantePrincipal) {
                    $data['participantePrincipalCodigo'] = $participante->CPFParticipantePrincipal;
                }

                $oParticipante = $this->em->getRepository('\App\Entity\CampanhaParticipante')
                    ->create($data);

                $this->writeLog("(cpf: {$participante->CPF}) NOVO");

                $this->em->flush();
                $this->em->clear(); // Detaches all objects from Doctrine!
            }
            else {
                $oParticipante = current($oParticipante);
                if (empty($oParticipante['empresaId'])) {
                    $this->writeLog("Atualizando empresaId $participante->CNPJ ($participante->CodigoSGCEmpresa)");
                    $this->em->getRepository('\App\Entity\CampanhaParticipante')->update($oParticipante['id'], ['empresaId' => $participante->CodigoSGCEmpresa]);
                }

                if (empty($oParticipante['participantePrincipalId']) && !empty($participante->CPFParticipantePrincipal)) {
                    $this->writeLog("Atualizando Codigo Participante Principal $participante->CNPJ ($participante->CodigoSGCEmpresa)");
                    $this->em->getRepository('\App\Entity\CampanhaParticipante')->update($oParticipante['id'], ['participantePrincipalCodigo' => $participante->CPFParticipantePrincipal]);
                }
            }
        }
        catch (\Exception $e) {
            $this->writeLog("checkParticipante: (cpf: {$participante->CPF}) {$e->getMessage()}", 'error');
            if (!$this->em->isOpen()) {
                $this->em = $this->em->create(
                    $this->em->getConnection(),
                    $this->em->getConfiguration()
                );
            }
        }

        return $oParticipante;
    }

    public function checkAplicacao (Participante $participante) {
        $oAplicacao = $this->em->getRepository('\App\Entity\Aplicacao')
            ->fetchCollection(null, [
                'campanhaId' => $this->campanhaId,
                'participanteCpf' => $participante->CPF
            ]);

        try {
            if (empty($oAplicacao)) {
                $data = [
                    'participanteId' => $participante->CodigoSGC,
                    'vacinaId' => 57,
                    'usuarioId' => 1,
                    'status' => 1,
                    'dose' => 1,
                    // 'conveniadaId' => $oConveniada[0]['id'],
                    'campanhaId' => $this->campanhaId,
                    'dtAplicacao' => $participante->DataAplicacao
                ];

                $oAplicacao = $this->em->getRepository('\App\Entity\Aplicacao')
                    ->create($data);

                echo "NOVA APLICACAO\n";

                $this->em->flush();
                $this->em->clear(); // Detaches all objects from Doctrine!
            }
            else {
                $oAplicacao = current($oAplicacao);
            }
        }
        catch (\Exception $e) {
            $this->writeLog("checkAplicacao: (cpf: {$participante->CPF}) {$e->getMessage()}", 'error');
            if (!$this->em->isOpen()) {
                $this->em = $this->em->create(
                    $this->em->getConnection(),
                    $this->em->getConfiguration()
                );
            }
        }

        return $oAplicacao;
    }

    private function getSearchAtendimentoByCampanha(GetAtendimento $filtro) {
        $sesiApi = new SesiTaskApi;

        $encontrou = false;
        foreach ($this->campanhasSESI as $campanha) {
            $filtro->CodigoCampanha = $campanha;
            var_dump($filtro);
            $result = $sesiApi->getAtendimento($filtro);
            if ($result && $result->Mensagem !== 'Erro: A consulta retornou vazio!') {
                $encontrou = true;
                break;
            }
        }

        return $encontrou ? $result : null;
    }

    public function getSearchAgendamentosByCampanha(ListarAgendamento $filtro) {
        $sesiApi = new SesiTaskApi;

        $cacheLocal = [];
        $agendamentos = [];
        foreach ($this->campanhasSESI as $campanha) {
            $key = "{$filtro->CNPJ}:{$campanha}";
            if ($cacheLocal[$key]) {
                $agendamentos = $cacheLocal[$key];
                break;
            }
            else {
                $filtro->CodigoCampanha = $campanha;
                $agendamentos = $sesiApi->execListarAgendamento($filtro);
                if ($agendamentos && count($agendamentos->Item)) {
                    $cacheLocal[$key] = $agendamentos;
                    break;
                }
                $cacheLocal[$key] = null;
            }
        }

        return $agendamentos;
    }
}
