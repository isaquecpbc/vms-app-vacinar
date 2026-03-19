<?php
namespace App\Task\Control;

use App\Task\Model\AddAtendimento;
use App\Task\Model\GetAtendimento;
use App\Task\Model\ListarAgendamento;
use App\Task\Model\ListarElegivel;
use App\Task\Library\RedisCache;
use App\Task\Model\AddAgendamento;

class SesiTaskApi {
    private $urlAPI;
    private $usuarioAPI;

    public function __construct()
    {
        $this->urlAPI = getenv('SESI_API_URL') ?: 'https://apiexterna.sesisenaisp.org.br';
        $this->usuarioAPI = getenv('SESI_API_USER');
    }

    public function execListarAgendamento(ListarAgendamento $filtro) {
        $o = new \StdClass;
        $o->Usuario = $this->usuarioAPI;
        $o->Filtro = $filtro;

        $key = "CodigoPlanta:$filtro->CodigoPlanta;CNPJ:$filtro->CNPJ;Rota:/api/Prestador/ListarAgendamento";
        $result = RedisCache::getCache($key);
        if ($result && $result->Item) {
            echo "CACHE Planta\n";
            return $result;
        }

        $result = $this->execRequest($o, '/api/Prestador/ListarAgendamento');
        if (!$result->Item) {
            echo "\nAgendamento encontrado para a Planta: $filtro->CodigoPlanta - CNPJ:$filtro->CNPJ\n";
            // var_dump($result);
            echo "execListarAgendamento -> {$result->Mensagem}\n";
            return false;
        }

        RedisCache::setCache($key, $result);

        return $result;
    }

    public function setAtendimentoElegivel(AddAtendimento $data) {
        $o = new \StdClass;
        $o->Usuario = $this->usuarioAPI;
        $o->Registro = $data;

        $result = $this->execRequest($o, '/api/Prestador/AdicionarAtendimento', 'POST');
        if ($result->Mensagem !== 'Sucesso!') {
            echo "\nErro ao Adicionar Atendimento\n";
            var_dump(['Filtro' => $o, 'Result' => $result]);
            echo "setAtendimentoElegivel -> {$result->Mensagem}\n";
        }

        return $result;
    }

    public function removeAtendimento(AddAtendimento $data) {
        $o = new \StdClass;
        $o->Usuario = $this->usuarioAPI;
        $o->Registro = $data;

        $result = $this->execRequest($o, '/api/Prestador/ExcluirAtendimento', 'POST');
        if ($result->Mensagem !== 'Sucesso!') {
            echo "\nErro ao Excluir Atendimento\n";
            var_dump(['Filtro' => $o, 'Result' => $result]);
            echo "removeAtendimento -> {$result->Mensagem}\n";
        }

        return $result;
    }

    public function getCampanhas() {
        $o = new \StdClass;
        $o->Usuario = $this->usuarioAPI;
        $filtro = new \StdClass;
        $filtro->Codigo = null;
        $filtro->Nome = null;
        $filtro->StatusAtivo = true;
        $filtro->Ano = (int) date('Y');
        $o->Filtro = $filtro;

        $dt = date('Ymd');
        $key = "Rota:/api/Prestador/ListarCampanha;Usuario:{$this->usuarioAPI};StatusAtivo:true;Ano:{$filtro->Ano};DATE:$dt";
        $result = RedisCache::getCache($key);
        if ($result && $result->Item) {
            echo "CACHE Campanhas\n";
            return $result;
        }

        $result = $this->execRequest($o, '/api/Prestador/ListarCampanha');

        if (!$result || !$result->Item) {
            $content = "\nSem Campanhas disponiveis\n";
            echo $content;
            $mensagem = isset($result->Mensagem) ? $result->Mensagem : 'SEM_MENSAGEM';
            echo "getCampanhas -> {$mensagem}\n";
        }

        RedisCache::setCache($key, $result);

        return $result;
    }

    public function getPlantas($campanhaSesiId, $cnpj = null) {
        $o = new \StdClass;
        $o->Usuario = $this->usuarioAPI;

        $filtro = new \StdClass;
        $filtro->Codigo = null;
        $filtro->CodigoCampanha = $campanhaSesiId;
        $filtro->CodigoPrestador = null;
        $filtro->CNPJ = $cnpj;
        $filtro->UF = null;
        $filtro->CEP = null;
        $filtro->Localidade = null;

        $o->Filtro = $filtro;
        $key = "CampanhaSESI:{$campanhaSesiId};CNPJ:{$cnpj};Rota:/api/Prestador/ListarPlanta";
        $result = RedisCache::getCache($key);
        if ($result && $result->Item) {
            echo "CACHE Planta\n";
            return $result;
        }

        $result = $this->execRequest($o, '/api/Prestador/ListarPlanta');

        if (!$result->Item) {
            $content = "\nSem Plantas encontradas para a Campanha: $campanhaSesiId\n";
            echo $content;
            echo "ListarPlanta -> {$result->Mensagem}\n";
        }

        RedisCache::setCache($key, $result);

        return $result;
    }

    public function getElegivel(ListarElegivel $filtro, $pagina = 1) {
        $o = new \StdClass;
        $o->Usuario = $this->usuarioAPI;
        $o->pagina = $pagina;
        $o->tamanhoPagina = 1000;
        $o->Filtro = $filtro;

        $key = null;
        if ($filtro->CPF) {
            $key .= "CPF:{$filtro->CPF};";
        }
        if ($filtro->CNPJ) {
            $key .= "CNPJ:{$filtro->CNPJ};";
        }
        if ($filtro->CodigoPlanta) {
            $key .= "PlantaId:{$filtro->CodigoPlanta};";
        }
        if ($filtro->CodigoCampanha) {
            $key .= "CampanhaId:{$filtro->CodigoCampanha};";
        }
        $key .= "Rota:/api/Prestador/ListarElegivel;Pagina:$pagina";
        $result = RedisCache::getCache($key);
        if ($result && $result->Item) {
            echo "CACHE Elegiveis\n";
            return $result;
        }

        $result = $this->execRequest($o, '/api/Prestador/ListarElegivel');
        if (!$result->Item) {
            $content = "\nSem Participantes encontrados para esta Planta: {$filtro->CodigoPlanta}|{$filtro->CNPJ}\n";
            echo $content;
            echo "getElegiveis -> {$result->Mensagem}\n";
        }

        RedisCache::setCache($key, $result);

        return $result;
    }

    public function getAtendimento(GetAtendimento $data, $noCache = false) {
        $o = new \StdClass;
        $o->Usuario = $this->usuarioAPI;
        $o->Filtro = $data;

        if (!$noCache) {
            $key = "CPF:{$o->Filtro->CPF};Rota:/api/Prestador/ListarAtendimento";
            $result = RedisCache::getCache($key);
            if ($result && $result->Item) {
                echo "CACHE Atendimento\n";
                return $result;
            }
        }

        $result = $this->execRequest($o, '/api/Prestador/ListarAtendimento');
        if ($result->Mensagem === 'Erro: A consulta retornou vazio!') {
            echo "\nSem Atendimento {$o->Filtro->CPF}\n";
            echo "getAtendimento -> {$result->Mensagem}\n";
            return false;
        }

        RedisCache::setCache($key, $result);

        return $result;
    }

    public function getAgendamento($cnpj, $campanhaSesiId) {
        $o = new \StdClass;
        $o->Usuario = $this->usuarioAPI;
        $o->Filtro = new \StdClass;
        $o->Filtro->CNPJ = $cnpj;
        $o->Filtro->CodigoCampanha = $campanhaSesiId;

        $key = "CNPJ:{$cnpj};Campanha:{$campanhaSesiId};Rota:/api/Prestador/ListarAgendamento";
        $result = RedisCache::getCache($key);
        if ($result && $result->Item) {
            echo "CACHE Agendamento\n";
            return $result;
        }

        $result = $this->execRequest($o, '/api/Prestador/ListarAgendamento');
        if ($result->Mensagem === 'Erro: A consulta retornou vazio!') {
            echo "\nSem Agendamento {$cnpj}\n";
            echo "getAgendamento -> {$result->Mensagem}\n";
            return false;
        }

        RedisCache::setCache($key, $result);

        return $result;
    }

    public function addAgendamento(AddAgendamento $agendamento) {
        $o = new \StdClass;
        $o->Usuario = $this->usuarioAPI;
        $o->Registro = $agendamento;

        $result = $this->execRequest($o, '/api/Prestador/AdicionarAgendamento', 'POST');

        return $result;
    }

    private function execRequest($fields, $url, $method = 'GET', $retry = 0) {
        $curl = curl_init();

        // Em desenvolvimento, desabilita verificacao de SSL para evitar erro de certificado
        $appEnv   = getenv('APP_ENV') ?: 'production';
        $verifySsl = ($appEnv === 'production');

        // Garante que temos um token valido antes da chamada, semelhante ao fluxo do Postman
        $token = RedisCache::getCache('token-api-sesi');
        if (!$token) {
            $token = $this->updateToken();
            if (!$token) {
                $token = RedisCache::getCache('token-api-sesi');
            }
        }

        if (!$token) {
            $error = new \StdClass();
            $error->Mensagem = 'Erro: Não foi possível obter token da API SESI.';
            return $error;
        }

        curl_setopt_array($curl, array(
          CURLOPT_URL => $this->urlAPI . $url,
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_ENCODING => '',
          CURLOPT_MAXREDIRS => 10,
          CURLOPT_TIMEOUT => 0,
          CURLOPT_FOLLOWLOCATION => true,
          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
          CURLOPT_CUSTOMREQUEST => $method,
                    CURLOPT_POSTFIELDS =>  json_encode($fields),
                    CURLOPT_HTTPHEADER => array(
                        'Authorization: Bearer ' . $token,
                        'Content-Type: application/json'
                    ),
          CURLOPT_SSL_VERIFYPEER => $verifySsl,
          CURLOPT_SSL_VERIFYHOST => $verifySsl ? 2 : 0,
        ));

        $response = curl_exec($curl);

        if ($response === false) {
            // Em dev, exibe erro detalhado; em prod apenas falha silenciosamente
            if ($appEnv !== 'production') {
                $error = curl_error($curl);
                $info  = curl_getinfo($curl);
                var_dump([
                    'curl_error' => $error,
                    'curl_info'  => $info,
                ]);
            }
            curl_close($curl);
            return null;
        }

        curl_close($curl);

        $return = json_decode($response);
        if ($return === null && $response !== '' && $response !== false && $appEnv !== 'production') {
            // DEBUG apenas em dev: resposta nao-JSON da API
            var_dump([
                'raw_response' => $response,
            ]);
        }

        if ($return && isset($return->Message) && $return->Message === 'Authorization has been denied for this request.') {
            if ($retry < 1) {
                $this->updateToken();
                $return = $this->execRequest($fields, $url, $method, $retry + 1);
            }
        }

        return $return;
    }

        private function updateToken() {
				$curl = curl_init();

				$tokenUrl = getenv('SESI_API_TOKEN_URL') ?: ($this->urlAPI . '/token');
				$username = getenv('SESI_API_USER');
				$password = getenv('SESI_API_PASSWORD');
				$appEnv   = getenv('APP_ENV') ?: 'production';
				$verifySsl = ($appEnv === 'production');

				curl_setopt_array($curl, array(
						CURLOPT_URL => $tokenUrl,
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_ENCODING => '',
          CURLOPT_MAXREDIRS => 10,
          CURLOPT_TIMEOUT => 0,
          CURLOPT_FOLLOWLOCATION => true,
          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
          CURLOPT_CUSTOMREQUEST => 'POST',
          CURLOPT_POSTFIELDS => http_build_query([
              'username' => $username,
              'password' => $password,
              'grant_type' => 'password',
          ]),
          CURLOPT_HTTPHEADER => array(
            'Content-Type: application/x-www-form-urlencoded'
          ),
          CURLOPT_SSL_VERIFYPEER => $verifySsl,
          CURLOPT_SSL_VERIFYHOST => $verifySsl ? 2 : 0,
			));

		$response = curl_exec($curl);

		if ($response === false) {
		    if ($appEnv !== 'production') {
		        $error = curl_error($curl);
		        $info  = curl_getinfo($curl);
		        var_dump([
		            'curl_error' => $error,
		            'curl_info'  => $info,
		        ]);
		    }
		    curl_close($curl);
            return null;
		}

		curl_close($curl);
		$result = json_decode($response);
		if (!$result || !isset($result->access_token)) {
		    if ($appEnv !== 'production') {
		        var_dump([
		            'raw_token_response' => $response,
		        ]);
		    }
            return null;
		}

		RedisCache::setCache('token-api-sesi', $result->access_token);
        return $result->access_token;
    }
}