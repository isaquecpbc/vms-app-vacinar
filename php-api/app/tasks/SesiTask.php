<?php
/**
 * @see https://docs.phalcon.io/3.4/en/application-cli
 */

use App\Task\Control\SesiTaskApi;
use Phalcon\Cli\Task;
use Phalcon\Logger\Adapter\File as FileAdapter;

use \App\Task\Control\SesiTaskControl;
use App\Task\Library\Assistant;
use App\Task\Model\ListarAgendamento;
use App\Task\Model\ListarElegivel;
use \App\Task\Model\Participante;
use App\Library\Cryptor;
use App\Task\Model\Conveniada;

ini_set("memory_limit", "-1");
set_time_limit(0);

// Print do swegger do atendimento
class SesiTask extends Task
{
    public $logger;
    public $urlAPI;
    public $usuarioAPI;
    public $campanhaId;
    public $campanhasSESI = [];
    public $agendamentoSesiFile;
    public $logErroFile;

    public function onConstruct()
    {
        $this->urlAPI = getenv('SESI_API_URL') ?: 'https://apiexterna.sesisenaisp.org.br';
        $this->usuarioAPI = getenv('SESI_API_USER') ?: 'CAON_01913857000165';
        $this->campanhaId = (int)(getenv('SESI_CAMPANHA_ID') ?: 244);

        $campanhasEnv = getenv('SESI_CAMPANHAS_SESI');
        if ($campanhasEnv) {
            $this->campanhasSESI = array_map('intval', array_filter(array_map('trim', explode(',', $campanhasEnv))));
        }

        $agendamentoPath = getenv('SESI_AGENDAMENTO_SESI_FILE') ?: 'data/logs/Agendamento_Vacinar_SESI.csv';
        $logErroPath = getenv('SESI_LOG_ERRO_FILE') ?: 'data/logs/Erro_Vacinar_SESI.log';

        $this->agendamentoSesiFile = __DIR__ . '/../../' . $agendamentoPath;
        $this->logErroFile = __DIR__ . '/../../' . $logErroPath;
    }

    public function sesiAction()
    {
        echo 'This is the default task and the default action' . PHP_EOL;
    }

    # New 2024
    # php app/cli.php sesi matchCampanhas
    public function matchCampanhasAction(array $params) {
        $fileNameLog = 'sesi_campanhas_'.date('Ymd');
        echo "$fileNameLog\n";

        $sesiClass = new SesiTaskControl($this->di['em'], null, $fileNameLog);
        $campanhas = $sesiClass->getAllCampanhas();
        echo 'Campanhas carregadas: ' . count($campanhas) . "\n";
        echo 'IDs: ' . implode(',', $campanhas) . "\n";

        echo date('Y-m-d H:i') . "\n";
        echo "LOG RESULT: {$fileNameLog}\n";
        echo "Finalizado!!!\n";
    }

    # New UPDATE 2024
    # Carregas as plantas do SESI para o SGC
    # php app/cli.php sesi loadPlantas cnpj=61033155000119
    public function loadPlantasAction(array $params) {
        $filter = Assistant::getParams($params);
        $cnpj = ($filter['cnpj']) ?: null;

        $fileNameLog = 'sesi_plantas_'.date('Ymd') . ($cnpj ? '_'.$cnpj : '');
        echo "$fileNameLog\n";
        $sesiClass = new SesiTaskControl($this->di['em'], null, $fileNameLog);
        $sesiClass->syncPlantasAndClinicas($cnpj);

        echo date('Y-m-d H:i') . "\n";
        echo "LOG RESULT: {$fileNameLog}\n";
        echo "Finalizado!!!\n";
    }

    # New UPDATE 2024
    # Obtem as plantas com total de doses agendadas
    # php app/cli.php sesi getFilePlantas
    public function getFilePlantasAction(array $params) {
        $fileNameLog = 'sesi_getfile_plantas_'.date('Ymd');
        echo "$fileNameLog\n";
        $sesiClass = new SesiTaskControl($this->di['em'], null, $fileNameLog);
        $sesiClass->getPlantas();

        echo date('Y-m-d H:i') . "\n";
        echo "LOG RESULT: {$fileNameLog}\n";
        echo "Finalizado!!!\n";
    }

    # New 2024
    # Precisa ter carregado as plantas anteriormente
    # php app/cli.php sesi equalizeParticipantesDatabase
    public function equalizeParticipantesDatabaseAction(array $params) {
        echo "\e[0;31m" . str_repeat('*', 80) . "\e[0m\n";
        echo "\e[0;31m*********   Esse procedimento vai remover participantes que estão na   *********\e[0m\n";
        echo "\e[0;31m*********           base do SGC e não estão na base do SESI            *********\e[0m\n";
        echo "\e[0;31m" . str_repeat('*', 80) . "\e[0m\n";
        $line = readline("Deseja continuar S/N: ");

        if(!(strtoupper($line) === 'S' || strtoupper($line) === 'SIM')) {
            echo "\nBOA ESCOLHA!\n";
            return false;
        }

        $fileNameLog = 'sesi_equalize_participantes_sgc_'.date('Ymd');
        echo "$fileNameLog\n";
        $sesiClass = new SesiTaskControl($this->di['em'], null, $fileNameLog);
        $sesiClass->syncParticipantesSGCtoSESI();

        echo date('Y-m-d H:i') . "\n";
        echo "LOG RESULT: {$fileNameLog}\n";
        echo "Finalizado!!!\n";
    }

    # New 2024
    # Precisa ter carregado as plantas anteriormente
    # php app/cli.php sesi sendAplicacoes partial=1 cnpj=7175725002618 cpf=50387939830
    # parametro partial={1,2,3} => usado para particionar a execução do script
    public function sendAplicacoesAction(array $params) {
        $filter = Assistant::getParams($params);

        $cnpj = ($filter['cnpj']) ?: null;
        $cpf = ($filter['cpf']) ?: null;
        $partial = ($filter['partial']) ?: null;

        $fileNameLog = 'sesi_enviar_aplicacao_'.date('Ymd') . ($cnpj ? '_'.$cnpj : '') . ($cpf ? '_'.$cpf : '') . ($partial ? '_partial'.$partial : '');
        echo "$fileNameLog\n";
        $sesiClass = new SesiTaskControl($this->di['em'], null, $fileNameLog);
        $sesiClass->sendAplicacoesSgcToSesi($cnpj, $cpf, $partial);

        echo date('Y-m-d H:i') . "\n";
        echo "LOG RESULT: {$fileNameLog}\n";
        echo "Finalizado!!!\n";
    }

    # New 2024
    # Envia os agendamentos cadastrados no SCE para o sistema do SESI
    # php app/cli.php sesi sendAgendamentos
    public function sendAgendamentosAction(array $params) {
        $filter = Assistant::getParams($params);

        $fileNameLog = 'sesi_enviar_agendamento_'.date('Ymd');
        echo "$fileNameLog\n";
        $sesiClass = new SesiTaskControl($this->di['em'], null, $fileNameLog);
        $sesiClass->adicionarAgendamento($this->di['emsce']);

        echo date('Y-m-d H:i') . "\n";
        echo "LOG RESULT: {$fileNameLog}\n";
        echo "Finalizado!!!\n";
    }

    # New 2024
    # Precisa ter carregado as plantas anteriormente
    # php app/cli.php sesi loadParticipantes cnpj=7175725002618 cpf=50387939830
    public function loadParticipantesAction(array $params) {
        $filter = Assistant::getParams($params);

        $cnpj = ($filter['cnpj']) ?: null;
        $cpf = ($filter['cpf']) ?: null;

        $fileNameLog = 'sesi_participantes_'.date('Ymd') . ($cnpj ? '_'.$cnpj : '');
        echo "$fileNameLog\n";
        $sesiClass = new SesiTaskControl($this->di['em'], null, $fileNameLog);
        $sesiClass->syncParticipantes($cnpj, $cpf);

        echo date('Y-m-d H:i') . "\n";
        echo "LOG RESULT: {$fileNameLog}\n";
        echo "Finalizado!!!\n";
    }

    # New
    # php app/cli.php sesi matchElegiveisComElegiveis cnpj=93211084000606
    public function matchElegiveisComElegiveisAction(array $params) {
        $filter = Assistant::getParams($params);

        $cnpj = ($filter['cnpj']) ?: null;
        // var_dump($filter, $cnpj); exit;
        $this->logger = new FileAdapter(__DIR__ . '/../../data/logs/sesi_'. date('Ymd') . '.log');

        $fileNameLog = __DIR__ . '/../../data/logs/sesi_plantas_'.date('YmdHi').'_'.$params[0].'.log';
        $sesiLog = fopen($fileNameLog, 'a');
        echo "$fileNameLog\n";
        // $sesiClass = new SesiTaskControl($this->di['em'], $sesiLog);
        $sesiClass = new SesiTaskControl($this->di['em'], $sesiLog);
        $sesiApi = new SesiTaskApi;
        $campanhas = [23,22,21,19,18];
        foreach ($campanhas as $c) {
            echo "AQUI\n\n\n";
            $plantas = $sesiApi->getPlantas($c, $cnpj);
            if (!$plantas->Item) {
                continue;
            }
            // var_dump($plantas->Item);exit;
            foreach ( $plantas->Item as $val ) {
                $conveniada = new Conveniada;
                $conveniada->CNPJ = $val->CNPJ;
                $conveniada->CodigoSESI = $val->Codigo;
                $conveniada->RazaoSocial = $val->RazaoSocial;
                $sesiClass->paginateElegiveis($conveniada);
            }

            break;
        }
    }

    # New
    # php app/cli.php sesi matchAplicacoes
    public function matchAplicacoesAction(array $params) {
        $fileNameLog = __DIR__ . '/../../data/logs/sesi_aplicacoes_'.date('YmdHi').'.log';
        $sesiLog = fopen($fileNameLog, 'a');
        echo "$fileNameLog\n";
        $sesiClass = new SesiTaskControl($this->di['em'], $sesiLog);
        $sesiClass->syncAplicacoesSgcToSesiByFile(!empty($params) ? $params[0] : null);

        echo "Finalizado!!!\n";
    }

    # New
    # php app/cli.php sesi matchAplicacoesNaoElegivel
    public function matchAplicacoesNaoElegivelAction(array $params) {
        $fileNameLog = __DIR__ . '/../../data/logs/sesi_aplicacoes_'.date('YmdHi').'.log';
        $sesiLog = fopen($fileNameLog, 'a');
        echo "$fileNameLog\n";
        $sesiClass = new SesiTaskControl($this->di['em'], $sesiLog);
        $sesiClass->syncAplicacoesNaoElegivelSgcToSesi(!empty($params) ? $params[0] : null);

        echo "Finalizado!!!\n";
    }

    # New
    # php app/cli.php sesi removeAplicacoes
    public function removeAplicacoesAction(array $params) {
        $fileNameLog = __DIR__ . '/../../data/logs/sesi_aplicacoes_'.date('YmdHi').'.log';
        $sesiLog = fopen($fileNameLog, 'a');
        echo "$fileNameLog\n";
        $sesiClass = new SesiTaskControl($this->di['em'], $sesiLog);
        $sesiClass->removeAplicacoesSesi(!empty($params) ? $params[0] : null);

        echo "Finalizado!!!\n";
    }

    # New
    # php app/cli.php sesi matchNomes
    public function matchNomesAction(array $params) {
        $path = realpath($fileNameLog = __DIR__ . '/../../data/logs/');
        $fileNameLog = $path.'/sesi_aplicacoes_nome_'.date('YmdHi').'.log';
        echo "FILELOG: $fileNameLog\n";
        $sesiLog = fopen($fileNameLog, 'a');
        echo "$fileNameLog\n";
        $sesiClass = new SesiTaskControl($this->di['em'], $sesiLog);

        $em = $this->di['em'];

        $oAplicacaoes = $em->getRepository('\App\Entity\Aplicacao')
            ->fetchCollection(null, [
                'campanhaId' => 181,
                'aplicados' => 'yes',
            ], [], 3, 11000);

        $total = count($oAplicacaoes);
        $current = 0;
        foreach($oAplicacaoes as $aplicacao) {
            $current++;
            try {
                $oClinica = $em->getRepository('\App\Entity\Conveniada')
                    ->fetch($aplicacao['participanteEmpresaId']);

                $participante = new Participante(
                    $aplicacao['participanteCodigoExterno'],
                    $oClinica['cnpj'],
                    Cryptor::cryptoJsAesDecrypt('123456', $aplicacao['participanteNome'])
                );

                $sesiApi = new SesiTaskApi;
                $filtro = new ListarElegivel;
                $filtro->CPF = $participante->CPF;
                $filtro->CNPJ = Assistant::formatCNPJ($participante->CNPJ);
                $elegivel = $sesiApi->getElegivel($filtro);

                if($elegivel->Item && count($elegivel->Item) && trim($participante->Nome) != trim($elegivel->Item[0]->Nome)) {
                    echo "Trocando: {$elegivel->Item[0]->Nome} => {$participante->Nome}\n";
                    $data = [
                        'id' => $aplicacao['participanteId'],
                        'nome' => trim($elegivel->Item[0]->Nome),
                        'cpf' => $participante->CPF,
                    ];
                    fputcsv($sesiLog, $data);
                    // $result = $emNew->getRepository('\App\Entity\CampanhaParticipante')
                    //     ->update($aplicacao['participanteId'], $data);
                    //     var_dump($result);

                    // $emNew->flush();
                    // $emNew->clear(); // Detaches all objects from Doctrine!
                }
            }
            catch (\Exception $e) {
                echo 'Error: '. $e->getMessage() . "\n";
            }

            echo "$current / $total\n";
        }

        echo "Finalizado!!!\n";
    }
}
