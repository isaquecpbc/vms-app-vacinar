# Resumo Task SESI

Data: 2026-03-19

## Objetivo
Consolidar os ajustes da integracao SESI para:
- autenticar corretamente na API externa
- sincronizar campanhas, plantas, elegiveis e atendimentos
- executar tarefas por cron com logs separados e melhor rastreabilidade

## Arquivos alterados

1. .env
- Ajustado host dos bancos para a rede Docker (mysql e postgres-sce)
- Adicionada variavel SESI_EMPRESA_ID=108

2. docker-ambiente-local/docker-compose.yml
- Incluidos servicos mysql e postgres-sce com volumes persistentes
- Expostas portas para acesso local (mysql em 3307 e postgres em 5432)
- Dependencias do sgc-app atualizadas para mysql/postgres-sce/memcached

3. app/tasks/control/SesiTaskApi.php
- Correcao do fluxo de token para funcionar mesmo sem extensao Memcached
- updateToken agora retorna token quando obtido com sucesso
- execRequest usa token retornado em memoria quando cache nao estiver disponivel
- retry de autorizacao limitado para evitar loop infinito
- removido debug verboso de getCampanhas

4. app/tasks/control/SesiTaskControl.php
- campanhaId e idEmpresaSESI agora lidos por variavel de ambiente
- removidas paradas forçadas (die) em fluxo de producao
- correcao de iteracao para usar colecoes Item no fluxo de sendAplicacoes
- validacao extra para resposta de plantas antes de comparar agendamentos
- logs adicionais no getAllCampanhas

5. app/tasks/SesiTask.php
- matchCampanhasAction agora imprime resumo objetivo:
  - quantidade de campanhas
  - lista de IDs retornados
- removido uso de var_dump nessa action

6. crontabfile
- Secao SESI reestruturada com fluxo completo e escalonado
- novos logs dedicados por etapa
- inclusao de rotina de matchCampanhas e matchNomes

7. dump/dump_bd_vacinar_sgc.sql
- Tabelas reordenadas por dependencia de FOREIGN KEY

8. dump/dump_db_sce_producao.sql
- Tabelas reordenadas por dependencia de FOREIGN KEY
- bloco auto-gerado com CREATE SEQUENCE IF NOT EXISTS para todas as sequencias usadas em nextval

## Cron SESI definido (referencia no repositorio)

- cascata a cada 6 horas (00, 06, 12, 18):
  - xx:00 matchCampanhas
  - xx:05 loadPlantas
  - xx:10 loadParticipantes
- sends (POST) a cada 30 minutos:
  - xx:20 e xx:50 sendAgendamentos
  - xx:25 e xx:55 sendAplicacoes
- matchNomes: segunda-feira 03:40

## Comandos uteis para operacao

### 1) Recriar app para aplicar .env

cd docker-ambiente-local

docker compose up -d --force-recreate sgc-app

docker compose ps sgc-app

### 2) Aplicar cron do arquivo no container (formato Alpine)

Observacao: no /etc/crontabs/root NAO usar o campo "root".

Comando para aplicar o crontabfile do repositorio no container e reiniciar o crond:

docker exec sgc_app sh -lc "sed 's/ root / /' /var/www/html/crontabfile > /etc/crontabs/root; pkill crond || true; sleep 1; crond -f -l 8 -L /var/www/html/data/logs/crond.log &"

### 3) Ver cron ativo no container

docker exec sgc_app sh -lc "cat /etc/crontabs/root"

docker exec sgc_app sh -lc "ps -ef | grep [c]rond"

### 4) Reiniciar cron manualmente

docker exec sgc_app sh -lc "pkill crond || true; sleep 1; crond -f -l 8 -L /var/www/html/data/logs/crond.log &"

### 5) Testes manuais das tasks SESI

docker exec sgc_app sh -lc "php /var/www/html/app/cli.php sesi matchCampanhas"

docker exec sgc_app sh -lc "php /var/www/html/app/cli.php sesi loadPlantas"

docker exec sgc_app sh -lc "php /var/www/html/app/cli.php sesi loadParticipantes"

docker exec sgc_app sh -lc "php /var/www/html/app/cli.php sesi sendAgendamentos"

docker exec sgc_app sh -lc "php /var/www/html/app/cli.php sesi sendAplicacoes"

### 6) Monitorar logs

docker exec -it sgc_app sh -lc "tail -f /var/www/html/data/logs/crond.log"

docker exec -it sgc_app sh -lc "tail -f /var/www/html/data/sesi_matchCampanhas.log /var/www/html/data/sesi_loadPlantas.log /var/www/html/data/sesi_loadParticipantes.log /var/www/html/data/sesi_sendAgendamentos.log /var/www/html/data/sesi_sendAplicacoes.log /var/www/html/data/sesi_matchNomes.log"

### 7) Ver logs especificos gerados por SesiTaskControl

docker exec sgc_app sh -lc "ls -lah /var/www/html/data/logs/sesi | tail -n 20"

docker exec sgc_app sh -lc "tail -n 100 /var/www/html/data/logs/sesi/sesi_campanhas_$(date +%Y%m%d).log"

## Observacoes finais

- O fluxo de elegiveis via ListarElegivel esta funcional e alimenta o SGC por loadParticipantes.
- O registro de atendimento no SESI passa por sendAplicacoes -> registerAtendimentoSesi.
- addParticipantesSesiSgc existe no control e no legado (SesiOldTask), mas nao e o caminho recomendado para cron recorrente sem arquivo de entrada controlado.
