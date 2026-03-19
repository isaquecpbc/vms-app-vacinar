-- Dump de estrutura (simplificada) do banco PostgreSQL: sce_producao
-- Gerado em: 2026-03-18 19:08:03

-- BEGIN AUTO-GENERATED SEQUENCES
-- Sequencias necessarias para defaults nextval(...::regclass)
CREATE SEQUENCE IF NOT EXISTS "public"."axx_alertas_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."axx_emails_enviar_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."axx_emails_notificacoes_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."axx_emails_template_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."axx_log_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."axx_modulos_grupo_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."axx_modulos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."axx_user_perfil_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."axx_user_x_modulos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."axx_usuarios_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."campanhas_agenda_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."campanhas_agenda_produtos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."campanhas_agenda_regiao_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."campanhas_agenda_status_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."campanhas_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."campanhas_status_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."clientes_cnpj_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."clientes_grupos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."clientes_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."clientes_propostas_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."clientes_propostas_produtos_id_clientes_propostas_produtos_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."clinicas_banco_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."clinicas_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."contatos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."danfes_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."documentos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."documentos_tipo_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."emails_notificacoes_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."empresas_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."faturamento_entradas_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."faturamento_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."fontes_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."fornecedores_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."lancamentos_agendamentos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."lancamentos_garantias_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."lancamentos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."lancamentos_produtos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."new_pagamento_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."new_pagamento_new2_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."new_pagamento_parametro_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."pagamentos_agendamentos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."pagamentos_formas_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."pagamentos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."pagamentos_tipos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."parceiros_comissoes_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."parceiros_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."pedidos_danfes_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."pedidos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."prestadores_de_servico_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."produtos_fabricante_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."produtos_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."profissionais_horario_id_profissional_horario_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."profissionais_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."profissionais_tipo_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."teste_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."unidades_encontradas_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."unidades_perdidas_id_seq";
CREATE SEQUENCE IF NOT EXISTS "public"."vacinados_id_seq";
-- END AUTO-GENERATED SEQUENCES

-- --------------------------------------------------
-- Tabela "aes_eletropaulo_2014"
-- --------------------------------------------------
CREATE TABLE "public"."aes_eletropaulo_2014" (
    "aes" text,
    "cnpj" text,
    "endereco" text,
    "cidade" text,
    "quantidade" text,
    "data" text,
    "horario" text
);

-- --------------------------------------------------
-- Tabela "axx_alertas"
-- --------------------------------------------------
CREATE TABLE "public"."axx_alertas" (
    "id" integer NOT NULL DEFAULT nextval('axx_alertas_id_seq'::regclass),
    "ativo" integer DEFAULT 1,
    "descricao" varchar(35),
    "mensagem_true" text,
    "mensagem_false" text,
    "query" text,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "axx_emails_enviar"
-- --------------------------------------------------
CREATE TABLE "public"."axx_emails_enviar" (
    "id" integer NOT NULL DEFAULT nextval('axx_emails_enviar_id_seq'::regclass),
    "prioridade" integer DEFAULT 2,
    "status" integer DEFAULT 0,
    "subject" varchar(255),
    "corpo_email" text,
    "destinatario" varchar(50),
    "email" varchar(255),
    "envio_data" timestamp,
    "envio_hora" varchar(8),
    "sessao_envio" varchar(14),
    "contato_id" integer,
    "remetente_email" varchar(80),
    "remetente_id" integer,
    "anexo" varchar(255),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "axx_emails_notificacoes"
-- --------------------------------------------------
CREATE TABLE "public"."axx_emails_notificacoes" (
    "id" integer NOT NULL DEFAULT nextval('axx_emails_notificacoes_id_seq'::regclass),
    "tipo" integer NOT NULL DEFAULT 1,
    "remetente" varchar(255),
    "destinatario" varchar(255),
    "data_envio" timestamp,
    "data_retorno" timestamp,
    "tipo_resposta" integer NOT NULL DEFAULT 0,
    "subtipo_resposta" integer NOT NULL DEFAULT 0,
    "mensagem" text,
    "id_email_enviado" integer,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "axx_emails_template"
-- --------------------------------------------------
CREATE TABLE "public"."axx_emails_template" (
    "id" integer NOT NULL DEFAULT nextval('axx_emails_template_id_seq'::regclass),
    "perfil" integer,
    "ativo" integer DEFAULT 1,
    "descricao" varchar(50),
    "subject" varchar(100),
    "corpo_email" text,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "axx_estados"
-- --------------------------------------------------
CREATE TABLE "public"."axx_estados" (
    "sigla" varchar(2) NOT NULL,
    "estado" varchar(20),
    PRIMARY KEY ("sigla")
);

-- --------------------------------------------------
-- Tabela "axx_log"
-- --------------------------------------------------
CREATE TABLE "public"."axx_log" (
    "id" integer NOT NULL DEFAULT nextval('axx_log_id_seq'::regclass),
    "usuario" integer,
    "data" date,
    "hora" varchar(8),
    "ip" varchar(15),
    "id_modulo" integer,
    "descricao" text,
    "detalhamento" text,
    "browser" varchar(75),
    "dados" text,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "axx_modulos"
-- --------------------------------------------------
CREATE TABLE "public"."axx_modulos" (
    "id" integer NOT NULL DEFAULT nextval('axx_modulos_id_seq'::regclass),
    "modulo" varchar(35),
    "descricao" varchar(255),
    "ativo" integer DEFAULT 1,
    "arquivo" varchar(50),
    "ordem" float8,
    "tipo" integer DEFAULT 0,
    "perfil" integer DEFAULT 1,
    "grupo" integer DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "axx_modulos_grupo"
-- --------------------------------------------------
CREATE TABLE "public"."axx_modulos_grupo" (
    "id" integer NOT NULL DEFAULT nextval('axx_modulos_grupo_id_seq'::regclass),
    "descricao" varchar(50),
    "ordem" integer,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "axx_user_perfil"
-- --------------------------------------------------
CREATE TABLE "public"."axx_user_perfil" (
    "id" integer NOT NULL DEFAULT nextval('axx_user_perfil_id_seq'::regclass),
    "descricao" varchar(15),
    "ativo" integer DEFAULT 1,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "axx_user_x_modulos"
-- --------------------------------------------------
CREATE TABLE "public"."axx_user_x_modulos" (
    "id" integer NOT NULL DEFAULT nextval('axx_user_x_modulos_id_seq'::regclass),
    "modulo" integer NOT NULL,
    "usuario" integer NOT NULL,
    "permissao" integer DEFAULT 1,
    PRIMARY KEY ("modulo", "usuario")
);

-- --------------------------------------------------
-- Tabela "axx_usuarios"
-- --------------------------------------------------
CREATE TABLE "public"."axx_usuarios" (
    "id" integer NOT NULL DEFAULT nextval('axx_usuarios_id_seq'::regclass),
    "tipo" integer,
    "ativo" integer,
    "usuario" varchar(50),
    "senha" varchar(32),
    "nome_user" varchar(35),
    "endereco" varchar(50),
    "cidade" varchar(35),
    "estado" varchar(2),
    "cep" varchar(9),
    "fone_1" varchar(25),
    "fone_2" varchar(25),
    "fax" varchar(25),
    "email" varchar(50),
    "ips_acesso" varchar(64) DEFAULT '192.168.0'::character varying,
    "fone_3" varchar(25),
    "endereco_num" varchar(10),
    "endereco_complemento" varchar(25),
    "bairro" varchar(70),
    "password" varchar(255),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "bancos"
-- --------------------------------------------------
CREATE TABLE "public"."bancos" (
    "compe" integer NOT NULL,
    "ispb" integer NOT NULL,
    "nome" varchar(255) NOT NULL,
    PRIMARY KEY ("compe")
);

-- --------------------------------------------------
-- Tabela "bancos_geral"
-- --------------------------------------------------
CREATE TABLE "public"."bancos_geral" (
    "cod" varchar(255),
    "id_campanha" varchar(255),
    "campanha" varchar(255),
    "id_matriz" text,
    "cnpj_matriz" varchar(255),
    "razao_social_matriz" varchar(255),
    "nome_fantasia_filial" varchar(255),
    "codigo_local" varchar(255),
    "nome_local" varchar(255),
    "tipo_local" varchar(255),
    "doses" varchar(255),
    "endereco" varchar(255),
    "bairro" varchar(255),
    "cidade" varchar(255),
    "equipe" varchar(255),
    "uf" varchar(255),
    "cep" varchar(255),
    "responsavel" varchar(255),
    "ddd1_filial" varchar(255),
    "telefone1_filial" varchar(255),
    "ddd2_filial" varchar(255),
    "telefone2_filial" varchar(255),
    "email" varchar(255),
    "vacina" varchar(255),
    "data" varchar(255),
    "hora_inicio" varchar(255),
    "hora_fim" varchar(255)
);

-- --------------------------------------------------
-- Tabela "bancos_geral_old"
-- --------------------------------------------------
CREATE TABLE "public"."bancos_geral_old" (
    "cod" varchar(255),
    "id_campanha" varchar(255),
    "campanha" varchar(255),
    "id_matriz" text,
    "cnpj_matriz" varchar(255),
    "razao_social_matriz" varchar(255),
    "nome_fantasia_filial" varchar(255),
    "codigo_local" varchar(255),
    "nome_local" varchar(255),
    "tipo_local" varchar(255),
    "doses" varchar(255),
    "endereco" varchar(255),
    "bairro" varchar(255),
    "cidade" varchar(255),
    "equipe" varchar(255),
    "uf" varchar(255),
    "cep" varchar(255),
    "responsavel" varchar(255),
    "ddd1_filial" varchar(255),
    "telefone1_filial" varchar(255),
    "ddd2_filial" varchar(255),
    "telefone2_filial" varchar(255),
    "email" varchar(255),
    "vacina" varchar(255),
    "data" varchar(255),
    "hora_inicio" varchar(255),
    "hora_fim" varchar(255)
);

-- --------------------------------------------------
-- Tabela "cad_bancos"
-- --------------------------------------------------
CREATE TABLE "public"."cad_bancos" (
    "codigo" integer NOT NULL,
    "descricao" varchar(50),
    PRIMARY KEY ("codigo")
);

-- --------------------------------------------------
-- Tabela "camp_ag_bkp"
-- --------------------------------------------------
CREATE TABLE "public"."camp_ag_bkp" (
    "id" integer,
    "data_inicio" date,
    "horario_inicial" varchar(5),
    "horario_final" varchar(5),
    "campanha" integer,
    "endereco" varchar(80),
    "bairro" varchar(35),
    "cidade" varchar(35),
    "estado" varchar(2),
    "cep" varchar(9),
    "ativo" integer,
    "doses_enviadas" integer,
    "doses_utilizadas" integer,
    "valor_dose" float8,
    "taxa_visita" float8,
    "venda_vacinas" integer,
    "venda_vac_data_sol" date,
    "venda_vac_data_ent" date,
    "venda_gesto" integer,
    "venda_clinica" integer,
    "venda_qtd_enf" integer,
    "venda_list_dep" integer,
    "venda_pgto_dep" integer,
    "venda_valor_dep" float8,
    "venda_obs" text,
    "regiao_atend" integer,
    "produto" integer,
    "data_final" date,
    "dose" integer,
    "motorista" integer,
    "agrupamento" integer,
    "status_agendamento" integer
);

-- --------------------------------------------------
-- Tabela "campanha_agenda_enf"
-- --------------------------------------------------
CREATE TABLE "public"."campanha_agenda_enf" (
    "agendamento" integer NOT NULL,
    "enfermeiro" integer NOT NULL,
    PRIMARY KEY ("agendamento", "enfermeiro")
);

-- --------------------------------------------------
-- Tabela "campanhas"
-- --------------------------------------------------
CREATE TABLE "public"."campanhas" (
    "id" integer NOT NULL DEFAULT nextval('campanhas_id_seq'::regclass),
    "empresa" integer,
    "data" date,
    "status" integer DEFAULT 60,
    "nome" varchar(35),
    "parceiro" integer DEFAULT 0,
    "tipo_campanha" integer DEFAULT 1,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "campanhas_agenda"
-- --------------------------------------------------
CREATE TABLE "public"."campanhas_agenda" (
    "id" integer NOT NULL DEFAULT nextval('campanhas_agenda_id_seq'::regclass),
    "data_inicio" timestamp,
    "horario_inicial" varchar(5),
    "horario_final" varchar(5),
    "campanha" integer,
    "endereco" varchar(80),
    "bairro" varchar(35),
    "cidade" varchar(35),
    "estado" varchar(2),
    "cep" varchar(9),
    "ativo" integer DEFAULT 1,
    "doses_enviadas" integer DEFAULT 0,
    "doses_utilizadas" integer DEFAULT 0,
    "valor_dose" float8 DEFAULT 0,
    "taxa_visita" float8 DEFAULT 0,
    "venda_vacinas" integer DEFAULT 0,
    "venda_vac_data_sol" date,
    "venda_vac_data_ent" date,
    "venda_gesto" integer DEFAULT 0,
    "venda_clinica" integer,
    "venda_qtd_enf" integer,
    "venda_list_dep" integer DEFAULT 0,
    "venda_pgto_dep" integer DEFAULT 0,
    "venda_valor_dep" float8 DEFAULT 0,
    "venda_obs" text,
    "regiao_atend" integer,
    "produto" integer,
    "data_final" date,
    "dose" integer DEFAULT 1,
    "motorista" integer,
    "agrupamento" integer DEFAULT 0,
    "status_agendamento" integer,
    "tipo_ag" integer DEFAULT 1,
    "tipo_entrega" integer DEFAULT 0,
    "valor_gesto" float8 DEFAULT 0,
    "empresa" integer,
    "valor_comissao" float8 DEFAULT 0,
    "status_comissao" integer DEFAULT 0,
    "parceiro_id" integer DEFAULT 0,
    "data_criacao" timestamp,
    "numero" varchar(10),
    "complemento" varchar(25),
    "sanofi" integer DEFAULT 0,
    "taxa_deslocamento" float8 DEFAULT 0,
    "cor" integer DEFAULT 0,
    "motorista_buscar" integer DEFAULT 0,
    "tipo_comissao" integer DEFAULT 0,
    "equipe" integer NOT NULL DEFAULT 0,
    "local_entrega" integer DEFAULT 0,
    "pagar" integer,
    "proposta" integer NOT NULL DEFAULT 0,
    "exigencias" varchar(200),
    "data_faturamento" date,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "campanhas_agenda_bkp"
-- --------------------------------------------------
CREATE TABLE "public"."campanhas_agenda_bkp" (
    "id" integer,
    "data_inicio" timestamp,
    "horario_inicial" varchar(5),
    "horario_final" varchar(5),
    "campanha" integer,
    "endereco" varchar(80),
    "bairro" varchar(35),
    "cidade" varchar(35),
    "estado" varchar(2),
    "cep" varchar(9),
    "ativo" integer,
    "doses_enviadas" integer,
    "doses_utilizadas" integer,
    "valor_dose" float8,
    "taxa_visita" float8,
    "venda_vacinas" integer,
    "venda_vac_data_sol" date,
    "venda_vac_data_ent" date,
    "venda_gesto" integer,
    "venda_clinica" integer,
    "venda_qtd_enf" integer,
    "venda_list_dep" integer,
    "venda_pgto_dep" integer,
    "venda_valor_dep" float8,
    "venda_obs" text,
    "regiao_atend" integer,
    "produto" integer,
    "data_final" date,
    "dose" integer,
    "motorista" integer,
    "agrupamento" integer,
    "status_agendamento" integer,
    "tipo_ag" integer,
    "tipo_entrega" integer,
    "valor_gesto" float8,
    "empresa" integer,
    "valor_comissao" float8,
    "status_comissao" integer,
    "parceiro_id" integer,
    "data_criacao" date,
    "numero" varchar(10),
    "complemento" varchar(25),
    "sanofi" integer,
    "taxa_deslocamento" float8,
    "cor" integer
);

-- --------------------------------------------------
-- Tabela "campanhas_agenda_produtos"
-- --------------------------------------------------
CREATE TABLE "public"."campanhas_agenda_produtos" (
    "id" integer NOT NULL DEFAULT nextval('campanhas_agenda_produtos_id_seq'::regclass),
    "agendamento_id" integer NOT NULL,
    "produto_id" integer,
    "doses_enviadas" integer,
    "doses_utilizadas" integer,
    "produto_dose" integer,
    "valor_dose" float8 DEFAULT 0,
    "doses_faturadas" integer,
    "envio_externo" numeric DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "campanhas_agenda_regiao"
-- --------------------------------------------------
CREATE TABLE "public"."campanhas_agenda_regiao" (
    "id" integer NOT NULL DEFAULT nextval('campanhas_agenda_regiao_id_seq'::regclass),
    "descricao" varchar(30),
    "ativo" integer DEFAULT 1,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "campanhas_agenda_status"
-- --------------------------------------------------
CREATE TABLE "public"."campanhas_agenda_status" (
    "id" integer NOT NULL DEFAULT nextval('campanhas_agenda_status_id_seq'::regclass),
    "descricao" varchar(20),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "campanhas_status"
-- --------------------------------------------------
CREATE TABLE "public"."campanhas_status" (
    "id" integer NOT NULL DEFAULT nextval('campanhas_status_id_seq'::regclass),
    "descricao" varchar(20),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "clientes"
-- --------------------------------------------------
CREATE TABLE "public"."clientes" (
    "id" integer NOT NULL DEFAULT nextval('clientes_id_seq'::regclass),
    "nome" varchar(156),
    "ativo" integer DEFAULT 1,
    "parceiro_padrao" integer DEFAULT 0,
    "tipo_campanha_padrao" integer DEFAULT 0,
    "obs" text,
    "logo" varchar,
    "grupo" integer NOT NULL DEFAULT 1,
    "sanofi_limite" float8,
    "cpf" varchar(11),
    "cnpj" varchar(14),
    "nome_social" varchar(80),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "clientes_cnpj"
-- --------------------------------------------------
CREATE TABLE "public"."clientes_cnpj" (
    "id" integer NOT NULL DEFAULT nextval('clientes_cnpj_id_seq'::regclass),
    "cnpj" float8,
    "ie" varchar(25),
    "im" varchar(25),
    "endereco" varchar(80),
    "bairro" varchar(35),
    "cidade" varchar(35),
    "estado" varchar(2),
    "cep" varchar(9),
    "cliente" integer,
    "email_xml" varchar(100),
    "razao_social" varchar(80),
    "cnpj_principal" integer,
    "sanofi_cadastro" smallint,
    "sanofi_data" date,
    "sanofi_limite" float8,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "clientes_grupos"
-- --------------------------------------------------
CREATE TABLE "public"."clientes_grupos" (
    "id" integer NOT NULL DEFAULT nextval('clientes_grupos_id_seq'::regclass),
    "nome" varchar(156),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "clientes_grupos_clientes"
-- --------------------------------------------------
CREATE TABLE "public"."clientes_grupos_clientes" (
    "cliente" integer NOT NULL,
    "grupo" integer NOT NULL,
    PRIMARY KEY ("cliente", "grupo")
);

-- --------------------------------------------------
-- Tabela "clientes_propostas"
-- --------------------------------------------------
CREATE TABLE "public"."clientes_propostas" (
    "id" integer NOT NULL DEFAULT nextval('clientes_propostas_id_seq'::regclass),
    "cliente" integer NOT NULL DEFAULT 0,
    "produto" integer NOT NULL DEFAULT 0,
    "valor" float8 NOT NULL DEFAULT 0,
    "data" timestamp,
    "validade" timestamp,
    "status" integer NOT NULL DEFAULT 1,
    "usuario" integer DEFAULT 0,
    "observacao" text,
    "ativo" integer NOT NULL DEFAULT 1,
    "quantidade" integer NOT NULL DEFAULT 0,
    "date_sync_sgc" timestamp,
    "unidade_id" integer,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "clientes_propostas_produtos"
-- --------------------------------------------------
CREATE TABLE "public"."clientes_propostas_produtos" (
    "id_clientes_propostas_produtos" integer NOT NULL DEFAULT nextval('clientes_propostas_produtos_id_clientes_propostas_produtos_seq'::regclass),
    "id_proposta" bigint NOT NULL,
    "id_produto" bigint,
    "quantidade" integer,
    "valor" float8,
    PRIMARY KEY ("id_clientes_propostas_produtos")
);

-- --------------------------------------------------
-- Tabela "clientes_stats"
-- --------------------------------------------------
CREATE TABLE "public"."clientes_stats" (
    "cliente" integer NOT NULL,
    "unidades" integer,
    "agendamentos" integer,
    "cnpjs" integer,
    "propostas" integer,
    "grupos" integer,
    "lancamentos" integer,
    "pedidos" integer,
    "faturamentos" integer,
    "pagamentos" integer,
    "doses_solicitadas" integer,
    "doses_enviadas" integer,
    "doses_utilizadas" integer,
    PRIMARY KEY ("cliente")
);

-- --------------------------------------------------
-- Tabela "clientes_stats_old"
-- --------------------------------------------------
CREATE TABLE "public"."clientes_stats_old" (
    "cliente" integer,
    "unidades" integer,
    "agendamentos" integer,
    "cnpjs" integer,
    "propostas" integer,
    "grupos" integer,
    "lancamentos" integer,
    "pedidos" integer,
    "faturamentos" integer,
    "pagamentos" integer,
    "doses_solicitadas" integer,
    "doses_enviadas" integer,
    "doses_utilizadas" integer
);

-- --------------------------------------------------
-- Tabela "clinicas"
-- --------------------------------------------------
CREATE TABLE "public"."clinicas" (
    "id" integer NOT NULL DEFAULT nextval('clinicas_id_seq'::regclass),
    "cnpj" float8,
    "nome" varchar(100),
    "razao_social" varchar(100),
    "ie" varchar(25),
    "cnes" varchar(25),
    "endereco" varchar(100),
    "bairro" varchar(100),
    "cidade" varchar(35),
    "estado" varchar(2),
    "cep" varchar(10),
    "ativo" integer DEFAULT 1,
    "horario" text,
    "url" varchar(100),
    "nivel" integer DEFAULT 0,
    "numero" varchar(10),
    "complemento" varchar(25),
    "logo" varchar,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "clinicas_banco"
-- --------------------------------------------------
CREATE TABLE "public"."clinicas_banco" (
    "id" integer NOT NULL DEFAULT nextval('clinicas_banco_id_seq'::regclass),
    "clinica" integer,
    "banco" integer,
    "nome_banco" varchar(50),
    "agencia" varchar(10),
    "conta" varchar(10),
    "cnpj" float8,
    "favorecido" varchar(50),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "contatos"
-- --------------------------------------------------
CREATE TABLE "public"."contatos" (
    "id" integer NOT NULL DEFAULT nextval('contatos_id_seq'::regclass),
    "tipo" integer,
    "empresa" integer,
    "nome" varchar(50),
    "fone_1" varchar(25),
    "fone_2" varchar(25),
    "email" varchar(50),
    "contato_principal" integer DEFAULT 0,
    "ativo" integer DEFAULT 1,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "contatos_bak"
-- --------------------------------------------------
CREATE TABLE "public"."contatos_bak" (
    "id" integer,
    "tipo" integer,
    "empresa" integer,
    "nome" varchar(50),
    "fone_1" varchar(25),
    "fone_2" varchar(25),
    "email" varchar(50),
    "contato_principal" integer,
    "ativo" integer
);

-- --------------------------------------------------
-- Tabela "cv_cli_sandino_001"
-- --------------------------------------------------
CREATE TABLE "public"."cv_cli_sandino_001" (
    "codigocliente" varchar(255),
    "nomedaempresa" varchar(255),
    "contato" varchar(255),
    "cnpj" varchar(255),
    "inscrestadual" varchar(255),
    "cpf" varchar(255),
    "crm" varchar(255),
    "enderecodecobranca" varchar(255),
    "bairro" varchar(255),
    "cidade" varchar(255),
    "est" varchar(255),
    "cep" varchar(255),
    "telefonea" varchar(255),
    "telefoneb" varchar(255),
    "ramal" varchar(255),
    "fax" varchar(255),
    "celular" varchar(255),
    "codfornecedor" varchar(255),
    "codigodopedido" varchar(255),
    "tiporelacionamento" varchar(255),
    "observacÃµes" varchar(255),
    "enderecodecorrespondencia" varchar(255),
    "codigo_grupo" varchar(255),
    "cadastrado_em" varchar(255),
    "brindes" varchar(255),
    "contato2" varchar(255),
    "contato3" varchar(255),
    "contato4" varchar(255),
    "contato5" varchar(255),
    "contato6" varchar(255),
    "cartao" varchar(255),
    "regiao" varchar(255),
    "capital_de_estado" varchar(255),
    "precogestovacinal" varchar(255),
    "codigopasteur" varchar(255),
    "atividade" varchar(255),
    "parceiro" varchar(255),
    "codigoglaxo" varchar(255),
    "email" varchar(255)
);

-- --------------------------------------------------
-- Tabela "danfes"
-- --------------------------------------------------
CREATE TABLE "public"."danfes" (
    "id" integer NOT NULL DEFAULT nextval('danfes_id_seq'::regclass),
    "produto" integer,
    "numero_danfe" float8 NOT NULL DEFAULT 0,
    "quantidade_dose" integer NOT NULL DEFAULT 0,
    "valor_unitario" float8 DEFAULT 0,
    "valor_total" float8 DEFAULT 0,
    "data_emissao" timestamp,
    "data" timestamp,
    "ativo" integer NOT NULL DEFAULT 1,
    "data_inativo" timestamp,
    "observacao_inativo" text,
    "observacao" text,
    "lote" varchar(255),
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "consignado" varchar DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "documentos"
-- --------------------------------------------------
CREATE TABLE "public"."documentos" (
    "id" integer NOT NULL DEFAULT nextval('documentos_id_seq'::regclass),
    "proprietario" integer,
    "tipo_documento" integer,
    "tipo" integer,
    "documento_nome" varchar(300),
    "data" timestamp,
    "usuario_id" integer DEFAULT 0,
    "documento_nome_original" varchar(300),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "documentos_tipo"
-- --------------------------------------------------
CREATE TABLE "public"."documentos_tipo" (
    "id" integer NOT NULL DEFAULT nextval('documentos_tipo_id_seq'::regclass),
    "descricao" varchar(40),
    "dir" varchar(300),
    "tipo" integer,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "eb_tipo_usr"
-- --------------------------------------------------
CREATE TABLE "public"."eb_tipo_usr" (
    "id_tipo" integer,
    "tipo" varchar(30)
);

-- --------------------------------------------------
-- Tabela "eb_usuario"
-- --------------------------------------------------
CREATE TABLE "public"."eb_usuario" (
    "id_usuario" integer,
    "nome" varchar(80),
    "email" varchar(80),
    "senha" varchar(80),
    "cpf" varchar(11),
    "dt_nasc" date,
    "telefone" varchar(15),
    "fk_tipo_usr" integer,
    "ativo" bool,
    "dt_criacao" date
);

-- --------------------------------------------------
-- Tabela "emails_notificacoes"
-- --------------------------------------------------
CREATE TABLE "public"."emails_notificacoes" (
    "id" integer NOT NULL DEFAULT nextval('emails_notificacoes_id_seq'::regclass),
    "tipo" integer NOT NULL DEFAULT 1,
    "remetente" varchar(255),
    "destinatario" varchar(255),
    "data_envio" timestamp,
    "data_retorno" timestamp,
    "tipo_resposta" integer NOT NULL DEFAULT 0,
    "subtipo_resposta" integer NOT NULL DEFAULT 0,
    "mensagem" text,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "empresas"
-- --------------------------------------------------
CREATE TABLE "public"."empresas" (
    "id" integer NOT NULL DEFAULT nextval('empresas_id_seq'::regclass),
    "cliente" integer,
    "cnpj" float8,
    "nome" varchar(156),
    "razao_social" varchar(156),
    "ie" varchar(25),
    "im" varchar(25),
    "endereco" varchar(125),
    "bairro" varchar(35),
    "cidade" varchar(35),
    "estado" varchar(2),
    "cep" varchar(9),
    "ativo" integer DEFAULT 1,
    "numero" varchar(10),
    "complemento" varchar(25),
    "regiao_atend" integer DEFAULT '-1'::integer,
    "contato" varchar(50),
    "contato_telefone" varchar(25),
    "email" varchar(255),
    "observacao" text,
    "cnpj_principal" integer NOT NULL DEFAULT 0,
    "sanofi_cadastro" smallint DEFAULT 0,
    "sanofi_data" date,
    "sanofi_limite" float8 DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "faturamento"
-- --------------------------------------------------
CREATE TABLE "public"."faturamento" (
    "id" integer NOT NULL DEFAULT nextval('faturamento_id_seq'::regclass),
    "pedido" integer NOT NULL DEFAULT 0,
    "lancamento" integer NOT NULL DEFAULT 0,
    "danfe_cliente" varchar(255),
    "data_emissao" timestamp DEFAULT now(),
    "nota_fiscal_laboratorio" varchar(255),
    "data_vencimento_laboratorio" timestamp DEFAULT now(),
    "status" integer NOT NULL DEFAULT 1,
    "data" timestamp DEFAULT now(),
    "data_inativo" timestamp,
    "observacao_inativo" text,
    "ativo" integer NOT NULL DEFAULT 1,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "faturamento_entradas"
-- --------------------------------------------------
CREATE TABLE "public"."faturamento_entradas" (
    "id" integer NOT NULL DEFAULT nextval('faturamento_entradas_id_seq'::regclass),
    "faturamento" integer NOT NULL DEFAULT 0,
    "nota_fiscal" varchar,
    "data_vencimento" timestamp DEFAULT now(),
    "valor" float8 DEFAULT 0,
    "data_lancamento" timestamp DEFAULT now(),
    "valor_pago" float8 DEFAULT 0,
    "data_pagamento" timestamp,
    "valor_nota_fiscal" float8 DEFAULT 0,
    "data_nota_fiscal" timestamp,
    "boleto" varchar,
    "ativo" integer NOT NULL DEFAULT 1,
    "forma_pagamento" integer NOT NULL DEFAULT 1,
    "observacao" text,
    "data_nota_fiscal_fixa" date
);

-- --------------------------------------------------
-- Tabela "faturamento_entradas_old"
-- --------------------------------------------------
CREATE TABLE "public"."faturamento_entradas_old" (
    "id" integer NOT NULL DEFAULT nextval('faturamento_entradas_id_seq'::regclass),
    "faturamento" integer NOT NULL DEFAULT 0,
    "nota_fiscal" varchar(255),
    "data_vencimento" timestamp DEFAULT now(),
    "valor" float8 DEFAULT 0,
    "data_lancamento" timestamp DEFAULT now(),
    "valor_pago" float8 DEFAULT 0,
    "data_pagamento" timestamp,
    "valor_nota_fiscal" float8 DEFAULT 0,
    "data_nota_fiscal" timestamp,
    "boleto" varchar(255),
    "ativo" integer NOT NULL DEFAULT 1,
    "forma_pagamento" integer NOT NULL DEFAULT 1,
    "observacao" text,
    "data_nota_fiscal_fixa" date,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "fontes"
-- --------------------------------------------------
CREATE TABLE "public"."fontes" (
    "id" integer NOT NULL DEFAULT nextval('fontes_id_seq'::regclass),
    "nome" varchar(64),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "fontes_clientes"
-- --------------------------------------------------
CREATE TABLE "public"."fontes_clientes" (
    "cliente" integer NOT NULL,
    "fonte" integer NOT NULL,
    "codigo" integer NOT NULL,
    PRIMARY KEY ("cliente", "fonte", "codigo")
);

-- --------------------------------------------------
-- Tabela "fornecedores"
-- --------------------------------------------------
CREATE TABLE "public"."fornecedores" (
    "id" integer NOT NULL DEFAULT nextval('fornecedores_id_seq'::regclass),
    "nome" varchar(80),
    "razao_social" varchar(80),
    "ie" varchar(25),
    "im" varchar(25),
    "endereco" varchar(80),
    "numero" varchar(10),
    "complemento" varchar(25),
    "bairro" varchar(70),
    "cidade" varchar(35),
    "estado" varchar(2),
    "cep" varchar(9),
    "ativo" integer DEFAULT 1,
    "nivel" integer DEFAULT 0,
    "imagem" varchar,
    "fone_1" varchar(25),
    "fone_2" varchar(25),
    "fone_3" varchar(25),
    "email" varchar(100),
    "cnpj" float8,
    "ie_isento" integer DEFAULT 0,
    "banco" varchar,
    "agencia" varchar,
    "cc" varchar,
    "observacao" text,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "lancamentos"
-- --------------------------------------------------
CREATE TABLE "public"."lancamentos" (
    "id" integer NOT NULL DEFAULT nextval('lancamentos_id_seq'::regclass),
    "cliente" integer NOT NULL DEFAULT 0,
    "cliente_cnpj" integer DEFAULT 0,
    "produto" integer NOT NULL DEFAULT 0,
    "quantidade_dose" integer NOT NULL DEFAULT 0,
    "valor_unitario" float8 DEFAULT 0,
    "valor_total" float8 DEFAULT 0,
    "valor_produto_laboratorio_unitario" float8 DEFAULT 0,
    "valor_produto_laboratorio_total" float8 DEFAULT 0,
    "valor_gesto_laboratorio_unitario" float8 DEFAULT 0,
    "valor_gesto_laboratorio_total" float8 DEFAULT 0,
    "valor_vacinar" float8 DEFAULT 0,
    "valor_boleto" float8 DEFAULT 0,
    "imposto_iss" float8 DEFAULT 0,
    "imposto_ir" float8 DEFAULT 0,
    "imposto_clss" float8 DEFAULT 0,
    "imposto_cofins" float8 DEFAULT 0,
    "imposto_pis" float8 DEFAULT 0,
    "imposto_inss" float8 DEFAULT 0,
    "data_lancamento" timestamp NOT NULL DEFAULT now(),
    "ativo" integer NOT NULL DEFAULT 1,
    "data_inativo" timestamp,
    "observacao_inativo" text,
    "taxa_visita" float8 DEFAULT 0,
    "multa" float8 DEFAULT 0,
    "empresa" integer NOT NULL DEFAULT 0,
    "local_entrega" integer NOT NULL DEFAULT 0,
    "clinica" integer NOT NULL DEFAULT 0,
    "prazo" integer NOT NULL DEFAULT 30,
    "observacao" text,
    "proposta" integer NOT NULL DEFAULT 0,
    "quantidade_dose_laboratorio" integer NOT NULL DEFAULT 0,
    "imposto_outros" float8 DEFAULT 0,
    "nota_fiscal" integer,
    "tipo_operacao" integer,
    "data_envio" timestamp,
    "data_retorno" timestamp,
    "cnpj_faturar" varchar,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "lancamentos_agendamentos"
-- --------------------------------------------------
CREATE TABLE "public"."lancamentos_agendamentos" (
    "id" integer NOT NULL DEFAULT nextval('lancamentos_agendamentos_id_seq'::regclass),
    "lancamento" integer DEFAULT 0,
    "agendamento" integer DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "lancamentos_garantias"
-- --------------------------------------------------
CREATE TABLE "public"."lancamentos_garantias" (
    "id" integer NOT NULL DEFAULT nextval('lancamentos_garantias_id_seq'::regclass),
    "cliente" integer NOT NULL DEFAULT 0,
    "produto" integer NOT NULL DEFAULT 0,
    "ano" integer NOT NULL DEFAULT 0,
    "quantidade" integer NOT NULL DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "lancamentos_produtos"
-- --------------------------------------------------
CREATE TABLE "public"."lancamentos_produtos" (
    "id" integer NOT NULL DEFAULT nextval('lancamentos_produtos_id_seq'::regclass),
    "lancamento" bigint,
    "produto" bigint,
    "quantidade_dose" integer,
    "valor_unitario" float8,
    "valor_total" float8,
    "valor_produto_laboratorio_unitario" float8,
    "valor_produto_laboratorio_total" float8,
    "valor_gesto_laboratorio_unitario" float8,
    "valor_gesto_laboratorio_total" float8,
    "taxa_visita" float8,
    "multa" float8,
    "valor_vacinar" float8,
    "quantidade_dose_laboratorio" integer,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "new_pagamento"
-- --------------------------------------------------
CREATE TABLE "public"."new_pagamento" (
    "id" integer NOT NULL DEFAULT nextval('new_pagamento_new2_id_seq'::regclass),
    "valor" float4 NOT NULL DEFAULT 0,
    "id_profissional" integer NOT NULL DEFAULT 0,
    "id_agendamento" integer,
    "id_usuario_pagou" integer,
    "dt_pagamento" timestamp,
    "created_at" timestamp,
    "updated_at" timestamp,
    "descricao" varchar(1024) DEFAULT NULL::character varying,
    "periodo_trabalhado_inicio" timestamp,
    "periodo_trabalhado_fim" timestamp,
    "lancamento_manual" smallint DEFAULT '0'::smallint,
    "dt_exclusao" timestamp,
    "tipo_adiantamento" smallint DEFAULT '0'::smallint,
    "valor_pago" float4 DEFAULT '0'::real,
    "id_pagamento_baixa" integer DEFAULT 0
);

-- --------------------------------------------------
-- Tabela "new_pagamento_bkp"
-- --------------------------------------------------
CREATE TABLE "public"."new_pagamento_bkp" (
    "id" integer NOT NULL DEFAULT nextval('new_pagamento_id_seq'::regclass),
    "valor" float4 NOT NULL,
    "id_profissional" integer NOT NULL,
    "id_agendamento" integer,
    "id_usuario_pagou" integer,
    "dt_pagamento" timestamp,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp,
    "descricao" varchar(255),
    "periodo_trabalhado_inicio" timestamp,
    "periodo_trabalhado_fim" timestamp,
    "lancamento_manual" smallint DEFAULT '0'::smallint,
    "dt_exclusao" timestamp,
    "tipo_adiantamento" smallint DEFAULT '0'::smallint,
    "valor_pago" float4 DEFAULT '0'::real,
    "id_pagamento_baixa" integer DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "new_pagamento_old"
-- --------------------------------------------------
CREATE TABLE "public"."new_pagamento_old" (
    "id" integer NOT NULL DEFAULT nextval('new_pagamento_id_seq'::regclass),
    "valor" float4 NOT NULL,
    "id_profissional" integer NOT NULL,
    "id_agendamento" integer,
    "id_usuario_pagou" integer,
    "dt_pagamento" timestamp,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp,
    "descricao" varchar(255) DEFAULT NULL::character varying,
    "periodo_trabalhado_inicio" timestamp,
    "periodo_trabalhado_fim" timestamp,
    "lancamento_manual" smallint DEFAULT '0'::smallint,
    "dt_exclusao" timestamp,
    "tipo_adiantamento" smallint DEFAULT '0'::smallint,
    "valor_pago" float4 DEFAULT '0'::real,
    "id_pagamento_baixa" integer DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "new_pagamento_parametro"
-- --------------------------------------------------
CREATE TABLE "public"."new_pagamento_parametro" (
    "id" integer NOT NULL DEFAULT nextval('new_pagamento_parametro_id_seq'::regclass),
    "valor" float4 NOT NULL,
    "id_profissional" integer NOT NULL,
    "forma_pagamento" integer NOT NULL,
    "total_horas" integer,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp,
    "excluded_at" timestamp,
    "ano_vigencia" integer,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "new_pagamento_parametro_2"
-- --------------------------------------------------
CREATE TABLE "public"."new_pagamento_parametro_2" (
    "id" integer NOT NULL DEFAULT nextval('new_pagamento_parametro_id_seq'::regclass),
    "valor" float4 NOT NULL,
    "id_profissional" integer NOT NULL,
    "forma_pagamento" integer NOT NULL,
    "total_horas" integer,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp,
    "excluded_at" timestamp,
    "ano_vigencia" integer,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "notas_fiscais"
-- --------------------------------------------------
CREATE TABLE "public"."notas_fiscais" (
    "numero" integer NOT NULL,
    "rps_serie" varchar(3),
    "rps_numero" integer NOT NULL,
    "codigo_verificacao" varchar(12) NOT NULL,
    "data_emissao" timestamp,
    "data_cancelamento" timestamp,
    "status" varchar(3),
    "tributacao" varchar(3),
    "opcao_simples" integer NOT NULL,
    "valor_servicos" float8 DEFAULT 0,
    "codigo_servico" integer DEFAULT 0,
    "aliquota_servicos" float8 DEFAULT 0,
    "valor_iss" float8 DEFAULT 0,
    "valor_credito" float8 DEFAULT 0,
    "iss_retido" integer NOT NULL DEFAULT 0,
    "doc_prestador" float8 DEFAULT 0,
    "doc_tomador" float8 DEFAULT 0,
    "email_tomador" varchar(255),
    "descriminacao" text,
    PRIMARY KEY ("numero", "rps_numero", "codigo_verificacao")
);

-- --------------------------------------------------
-- Tabela "pagamentos"
-- --------------------------------------------------
CREATE TABLE "public"."pagamentos" (
    "id" integer NOT NULL DEFAULT nextval('pagamentos_id_seq'::regclass),
    "tipo" integer DEFAULT 0,
    "cedente" integer DEFAULT 0,
    "pagamento_forma" integer DEFAULT 0,
    "valor" float8 DEFAULT 0,
    "data_pagamento" timestamp NOT NULL DEFAULT now(),
    "observacao" text,
    "ativo" integer DEFAULT 1,
    "observacao_inativo" text,
    "periodo_inicio" timestamp,
    "periodo_fim" timestamp,
    "banco" integer,
    "agencia" varchar,
    "cc" varchar,
    "conta_tipo" integer NOT NULL DEFAULT 1,
    "adiantamento" numeric DEFAULT 0,
    "adiantamento_status" numeric DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "pagamentos_agendamentos"
-- --------------------------------------------------
CREATE TABLE "public"."pagamentos_agendamentos" (
    "id" integer NOT NULL DEFAULT nextval('pagamentos_agendamentos_id_seq'::regclass),
    "pagamento" integer DEFAULT 0,
    "agendamento" integer DEFAULT 0,
    "valor" float8 DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "pagamentos_formas"
-- --------------------------------------------------
CREATE TABLE "public"."pagamentos_formas" (
    "id" integer NOT NULL DEFAULT nextval('pagamentos_formas_id_seq'::regclass),
    "descricao" text,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "pagamentos_tipos"
-- --------------------------------------------------
CREATE TABLE "public"."pagamentos_tipos" (
    "id" integer NOT NULL DEFAULT nextval('pagamentos_tipos_id_seq'::regclass),
    "descricao" text,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "parceiros"
-- --------------------------------------------------
CREATE TABLE "public"."parceiros" (
    "id" integer NOT NULL DEFAULT nextval('parceiros_id_seq'::regclass),
    "cnpj" float8,
    "nome" varchar(50),
    "razao_social" varchar(100),
    "ie" varchar(25),
    "im" varchar(25),
    "endereco" varchar(80),
    "bairro" varchar(35),
    "cidade" varchar(35),
    "estado" varchar(2),
    "cep" varchar(9),
    "ativo" integer DEFAULT 1,
    "nivel" integer DEFAULT 0,
    "numero" varchar(10),
    "complemento" varchar(25),
    "valor_comissao" float8 DEFAULT 0,
    "logo" varchar,
    "banco" varchar,
    "agencia" varchar,
    "cc" varchar,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "parceiros_comissoes"
-- --------------------------------------------------
CREATE TABLE "public"."parceiros_comissoes" (
    "id" integer NOT NULL DEFAULT nextval('parceiros_comissoes_id_seq'::regclass),
    "parceiro" integer DEFAULT 0,
    "ano" integer DEFAULT 0,
    "valor" float8 DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "pedidos"
-- --------------------------------------------------
CREATE TABLE "public"."pedidos" (
    "id" integer NOT NULL DEFAULT nextval('pedidos_id_seq'::regclass),
    "lancamento" integer NOT NULL DEFAULT 0,
    "data" timestamp DEFAULT now(),
    "prazo" integer NOT NULL DEFAULT 30,
    "ativo" integer NOT NULL DEFAULT 1,
    "observacao_inativo" text,
    "data_inativo" timestamp,
    "acerto_consignacao" integer NOT NULL DEFAULT 0,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "pedidos_danfes"
-- --------------------------------------------------
CREATE TABLE "public"."pedidos_danfes" (
    "id" integer NOT NULL DEFAULT nextval('pedidos_danfes_id_seq'::regclass),
    "pedido" integer NOT NULL DEFAULT 0,
    "danfe" integer NOT NULL DEFAULT 0,
    "quantidade" integer NOT NULL DEFAULT 0,
    "data" timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "phinxlog"
-- --------------------------------------------------
CREATE TABLE "public"."phinxlog" (
    "version" bigint NOT NULL,
    "start_time" timestamp NOT NULL,
    "end_time" timestamp NOT NULL,
    PRIMARY KEY ("version")
);

-- --------------------------------------------------
-- Tabela "prestadores_de_servico"
-- --------------------------------------------------
CREATE TABLE "public"."prestadores_de_servico" (
    "id" integer NOT NULL DEFAULT nextval('prestadores_de_servico_id_seq'::regclass),
    "nome" varchar(80),
    "razao_social" varchar(80),
    "ie" varchar(25),
    "im" varchar(25),
    "endereco" varchar(80),
    "numero" varchar(10),
    "complemento" varchar(25),
    "bairro" varchar(70),
    "cidade" varchar(35),
    "estado" varchar(2),
    "cep" varchar(9),
    "ativo" integer DEFAULT 1,
    "nivel" integer DEFAULT 0,
    "imagem" varchar,
    "email" varchar(100),
    "cnpj" float8,
    "ie_isento" integer DEFAULT 0,
    "fone_1" varchar(25),
    "fone_2" varchar(25),
    "fone_3" varchar(25),
    "banco" varchar(50),
    "agencia" varchar(30),
    "conta" varchar(30),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "produtos"
-- --------------------------------------------------
CREATE TABLE "public"."produtos" (
    "id" integer NOT NULL DEFAULT nextval('produtos_id_seq'::regclass),
    "nome" varchar(25),
    "fabricante" integer,
    "ativo" integer DEFAULT 1,
    "doses" integer DEFAULT 1,
    "valor_dose" float8,
    "descritivo" text,
    "lote" varchar(10),
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "produtos_fabricante"
-- --------------------------------------------------
CREATE TABLE "public"."produtos_fabricante" (
    "id" integer NOT NULL DEFAULT nextval('produtos_fabricante_id_seq'::regclass),
    "nome" varchar(25),
    "ativo" integer DEFAULT 1,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "profissionais"
-- --------------------------------------------------
CREATE TABLE "public"."profissionais" (
    "id" integer NOT NULL DEFAULT nextval('profissionais_id_seq'::regclass),
    "nome" varchar(50),
    "cpf" float8,
    "rg" varchar(30),
    "data_nasc" date,
    "tipo" integer,
    "coren" varchar(15),
    "coren_emissor" varchar(2),
    "cnh" varchar(15),
    "cnh_vecto" date,
    "cnh_categoria" varchar(2),
    "endereco" varchar(80),
    "bairro" varchar,
    "cidade" varchar,
    "estado" varchar(2),
    "cep" varchar(9),
    "fone_1" varchar(25),
    "fone_2" varchar(25),
    "email" varchar(255),
    "obs" text,
    "ativo" integer DEFAULT 1,
    "apelido" varchar(30),
    "nivel" integer DEFAULT 0,
    "numero" varchar(20),
    "imagem" varchar,
    "complemento" varchar,
    "celular" varchar,
    "ano_conclusao" varchar,
    "matricula" varchar,
    "encontro" varchar,
    "banco" integer,
    "agencia" varchar,
    "cc" varchar,
    "coren_protocolo" varchar(300),
    "is_carro" integer DEFAULT '-1'::integer,
    "disponibilidade" integer DEFAULT 0,
    "instituicao_ensino" varchar(200),
    "coren_dt_emissao" date,
    "coren_inativo" integer NOT NULL DEFAULT 0,
    "ccm" integer,
    "disponivel_viagem" integer NOT NULL DEFAULT 0,
    "pis" float8,
    "conta_tipo" integer NOT NULL DEFAULT 1,
    "conta_propria" varchar(1),
    "tempo_clinica" varchar(100),
    "data_admissao" date,
    "data_demissao" date,
    "confirmar_participacao" integer,
    "confirmar_participacao_data" date,
    "nome_mae" varchar(50) DEFAULT NULL::character varying,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "profissionais_horario"
-- --------------------------------------------------
CREATE TABLE "public"."profissionais_horario" (
    "id_profissional" integer,
    "horario" integer,
    "id_profissional_horario" integer NOT NULL DEFAULT nextval('profissionais_horario_id_profissional_horario_seq'::regclass),
    PRIMARY KEY ("id_profissional_horario")
);

-- --------------------------------------------------
-- Tabela "profissionais_tipo"
-- --------------------------------------------------
CREATE TABLE "public"."profissionais_tipo" (
    "id" integer NOT NULL DEFAULT nextval('profissionais_tipo_id_seq'::regclass),
    "descricao" varchar(25),
    "ativo" integer DEFAULT 1,
    PRIMARY KEY ("id")
);

-- --------------------------------------------------
-- Tabela "relatorio_agendamento_vip"
-- --------------------------------------------------
CREATE TABLE "public"."relatorio_agendamento_vip" (
    "campanha" text,
    "cnpj" text,
    "razao_social" text,
    "cnpj_filial" text,
    "nome_fantasia" text,
    "cod_local" text,
    "nome_local" text,
    "tipo_local" text,
    "qt_funcionario_adulto" text,
    "qt_dependente_adulto" text,
    "qt_dependente_pediatrico" text,
    "endereco" text,
    "bairro" text,
    "cidade" text,
    "uf" text,
    "cep" text,
    "responsavel" text,
    "ddd1" text,
    "telefone1" text,
    "ddd2" text,
    "telefone2" text,
    "ddd3" text,
    "telefone3" text,
    "email" text,
    "vacina" text,
    "utiliza_vip" text,
    "local_atendimento" text,
    "vigÃªncia_campanha" text,
    "dt_limite_repescagem" text,
    "dt_limite_agendamento" text,
    "valor_local" text,
    "valor_web" text,
    "agendado" text,
    "data_hora_agendada" text,
    "data_hora_estimada" text,
    "observacao" text,
    "clinica" text,
    "endereco_clinica" text,
    "bairro_clinica" text,
    "cidade_clinica" text,
    "uf_clinica" text,
    "contato_clinica" text,
    "tel_clinica" text,
    "email_clinica" text,
    "horario_funcionamento" text,
    "clinica_hora_funcionamento" text
);

-- --------------------------------------------------
-- Tabela "relatorio_agendamento_vip_001"
-- --------------------------------------------------
CREATE TABLE "public"."relatorio_agendamento_vip_001" (
    "campanha" text,
    "cnpj" text,
    "razao_social" text,
    "cnpj_filial" text,
    "nome_fantasia" text,
    "cod_local" text,
    "nome_local" text,
    "tipo_local" text,
    "qt_funcionario_adulto" text,
    "qt_dependente_adulto" text,
    "qt_dependente_pediatrico" text,
    "endereco" text,
    "bairro" text,
    "cidade" text,
    "uf" text,
    "cep" text,
    "responsavel" text,
    "ddd1" text,
    "telefone1" text,
    "ddd2" text,
    "telefone2" text,
    "ddd3" text,
    "telefone3" text,
    "email" text,
    "vacina" text,
    "utiliza_vip" text,
    "local_atendimento" text,
    "vigÃªncia_campanha" text,
    "dt_limite_repescagem" text,
    "dt_limite_agendamento" text,
    "valor_local" text,
    "valor_web" text,
    "agendado" text,
    "data_hora_agendada" text,
    "data_hora_estimada" text,
    "observacao" text,
    "clinica" text,
    "endereco_clinica" text,
    "bairro_clinica" text,
    "cidade_clinica" text,
    "uf_clinica" text,
    "contato_clinica" text,
    "tel_clinica" text,
    "email_clinica" text,
    "horario_funcionamento" text,
    "clinica_hora_funcionamento" text
);

-- --------------------------------------------------
-- Tabela "relatorio_agendamento_vip_002"
-- --------------------------------------------------
CREATE TABLE "public"."relatorio_agendamento_vip_002" (
    "campanha" text,
    "cnpj" text,
    "razao_social" text,
    "cnpj_filial" text,
    "nome_fantasia" text,
    "cod_local" text,
    "nome_local" text,
    "tipo_local" text,
    "qt_funcionario_adulto" text,
    "qt_dependente_adulto" text,
    "qt_dependente_pediatrico" text,
    "endereco" text,
    "bairro" text,
    "cidade" text,
    "uf" text,
    "cep" text,
    "responsavel" text,
    "ddd1" text,
    "telefone1" text,
    "ddd2" text,
    "telefone2" text,
    "ddd3" text,
    "telefone3" text,
    "email" text,
    "vacina" text,
    "utiliza_vip" text,
    "local_atendimento" text,
    "vigÃªncia_campanha" text,
    "dt_limite_repescagem" text,
    "dt_limite_agendamento" text,
    "valor_local" text,
    "valor_web" text,
    "agendado" text,
    "data_hora_agendada" text,
    "data_hora_estimada" text,
    "observacao" text,
    "clinica" text,
    "endereco_clinica" text,
    "bairro_clinica" text,
    "cidade_clinica" text,
    "uf_clinica" text,
    "contato_clinica" text,
    "tel_clinica" text,
    "email_clinica" text,
    "horario_funcionamento" text,
    "clinica_hora_funcionamento" text
);

-- --------------------------------------------------
-- Tabela "sesi_from_bruno_001"
-- --------------------------------------------------
CREATE TABLE "public"."sesi_from_bruno_001" (
    "data" varchar(255),
    "hora" varchar(255),
    "empresa" varchar(255),
    "cnpj" varchar(255),
    "cod" varchar(255),
    "reg" varchar(255),
    "nada1" varchar(255),
    "doses" varchar(255),
    "nada2" varchar(255),
    "nada3" varchar(255),
    "endereco" varchar(255),
    "bairro" varchar(255),
    "cidade" varchar(255),
    "estado" varchar(255),
    "nada4" varchar(255),
    "nada5" varchar(255),
    "nada6" varchar(255),
    "nada7" varchar(255),
    "nada8" varchar(255),
    "nada9" varchar(255),
    "nada10" varchar(255),
    "nada11" varchar(255),
    "nada12" varchar(255),
    "nada13" varchar(255),
    "nada14" varchar(255)
);

-- --------------------------------------------------
-- Tabela "sesi_normal_1_cnpjs"
-- --------------------------------------------------
CREATE TABLE "public"."sesi_normal_1_cnpjs" (
    "id_elegibilidade" text,
    "id_campanha" text,
    "id_campanha_empresa" text,
    "campanha" text,
    "cnpj" text,
    "razao_social" text,
    "nome_fantasia" text,
    "total_dose" text,
    "utiliza_vip" text,
    "email_empresa" text,
    "responsavel_empresa" text,
    "tipo_atend_clinica" text,
    "valor_servico" text,
    "valor_servico_web" text,
    "endereco" text,
    "uf" text,
    "cidade" text,
    "bairro" text,
    "cep" text,
    "possui_agendamento" text,
    "tipo_local" text,
    "data_vigencia_campanha_ini" text,
    "data_vigencia_campanha_fim" text,
    "qtd_dias_repescagem" text,
    "id_empresa" text,
    "id_matriz" text,
    "somente_web" text,
    "data_limite_agendamento" text,
    "obs" text,
    "ddd1" text,
    "telefone1" text,
    "ddd2" text,
    "telefone2" text
);

-- --------------------------------------------------
-- Tabela "sesi_normal_1_cnpjs_old2"
-- --------------------------------------------------
CREATE TABLE "public"."sesi_normal_1_cnpjs_old2" (
    "id_elegibilidade" text,
    "id_campanha" text,
    "id_campanha_empresa" text,
    "campanha" text,
    "cnpj" text,
    "razao_social" text,
    "nome_fantasia" text,
    "total_dose" text,
    "utiliza_vip" text,
    "email_empresa" text,
    "responsavel_empresa" text,
    "tipo_atend_clinica" text,
    "valor_servico" text,
    "valor_servico_web" text,
    "endereco" text,
    "uf" text,
    "cidade" text,
    "bairro" text,
    "cep" text,
    "possui_agendamento" text,
    "tipo_local" text,
    "data_vigencia_campanha_ini" text,
    "data_vigencia_campanha_fim" text,
    "qtd_dias_repescagem" text,
    "id_empresa" text,
    "id_matriz" text,
    "somente_web" text,
    "data_limite_agendamento" text,
    "obs" text,
    "ddd1" text,
    "telefone1" text,
    "ddd2" text,
    "telefone2" text
);

-- --------------------------------------------------
-- Tabela "sesi_normal_2_cnpjs_old"
-- --------------------------------------------------
CREATE TABLE "public"."sesi_normal_2_cnpjs_old" (
    "id_elegibilidade" text,
    "id_campanha" text,
    "id_campanha_empresa" text,
    "campanha" text,
    "cnpj" text,
    "razao_social" text,
    "nome_fantasia" text,
    "total_dose" text,
    "utiliza_vip" text,
    "email_empresa" text,
    "responsavel_empresa" text,
    "tipo_atend_clinica" text,
    "valor_servico" text,
    "valor_servico_web" text,
    "endereco" text,
    "uf" text,
    "cidade" text,
    "bairro" text,
    "cep" text,
    "possui_agendamento" text,
    "tipo_local" text,
    "data_vigencia_campanha_ini" text,
    "data_vigencia_campanha_fim" text,
    "qtd_dias_repescagem" text,
    "id_empresa" text,
    "id_matriz" text,
    "somente_web" text,
    "data_limite_agendamento" text,
    "obs" text,
    "ddd1" text,
    "telefone1" text,
    "ddd2" text,
    "telefone2" text
);

-- --------------------------------------------------
-- Tabela "tab_municipios"
-- --------------------------------------------------
CREATE TABLE "public"."tab_municipios" (
    "id" bigint NOT NULL DEFAULT 0,
    "iduf" integer NOT NULL DEFAULT 0,
    "nome" varchar(255),
    "uf" varchar(2)
);

-- --------------------------------------------------
-- Tabela "teste"
-- --------------------------------------------------
CREATE TABLE "public"."teste" (
    "id" integer NOT NULL DEFAULT nextval('teste_id_seq'::regclass),
    "vl" integer
);

-- --------------------------------------------------
-- Tabela "unidades_encontradas"
-- --------------------------------------------------
CREATE TABLE "public"."unidades_encontradas" (
    "cliente_id" integer NOT NULL,
    "cnpj" varchar(255),
    "unidade" varchar(255),
    "razao_social" varchar(255),
    "ie" varchar(255),
    "im" varchar(255),
    "cep" varchar(255),
    "endereco" varchar(255),
    "bairro" varchar(255),
    "estado" varchar(255),
    "cidade" varchar(255),
    "regiao_atend" varchar(255),
    "contato" varchar(255),
    "telefone" varchar(255),
    "telefone_2" varchar(255),
    "email_contato" varchar(255),
    "id" integer NOT NULL DEFAULT nextval('unidades_encontradas_id_seq'::regclass)
);

-- --------------------------------------------------
-- Tabela "unidades_perdidas"
-- --------------------------------------------------
CREATE TABLE "public"."unidades_perdidas" (
    "cnpj" varchar(255),
    "unidade" varchar(255),
    "razao_social" varchar(255),
    "ie" varchar(255),
    "im" varchar(255),
    "cep" varchar(255),
    "endereco" varchar(255),
    "bairro" varchar(255),
    "estado" varchar(255),
    "cidade" varchar(255),
    "regiao_atend" varchar(255),
    "contato" varchar(255),
    "telefone" varchar(255),
    "telefone_2" varchar(255),
    "email_contato" varchar(255),
    "id" integer NOT NULL DEFAULT nextval('unidades_perdidas_id_seq'::regclass)
);

-- --------------------------------------------------
-- Tabela "vacinados"
-- --------------------------------------------------
CREATE TABLE "public"."vacinados" (
    "id" integer NOT NULL DEFAULT nextval('vacinados_id_seq'::regclass),
    "cliente_id" integer,
    "empresa_id" integer,
    "agendamento_id" integer,
    "nome_participante" varchar(255) NOT NULL,
    "cpf_participante" varchar(11),
    "matricula_titular" varchar(50),
    "tipo_participante" varchar(20),
    "data_nascimento" date,
    "email" varchar(255),
    "sexo" varchar(1),
    "uf" varchar(2),
    "cpf_titular_vinculo" varchar(11),
    "desc_dept" varchar(255),
    "cod_empresa" varchar(50),
    "descr_estab" varchar(255),
    "cod_polo" varchar(50),
    "polo_administrativo" varchar(255),
    "cod_predio" varchar(50),
    "predio" varchar(255),
    "cod_local_trabalho" varchar(50),
    "local_trabalho" varchar(255),
    "charact_dept_id" varchar(50),
    "cnpj_unidade" varchar(14),
    "nome_razao_social" varchar(255),
    "agen_fil" varchar(50),
    "vacinado" bool DEFAULT false,
    "data_vacinacao" timestamp,
    "produto_id" integer,
    "lote_vacina" varchar(50),
    "criado_em" timestamp DEFAULT now(),
    "atualizado_em" timestamp DEFAULT now(),
    PRIMARY KEY ("id")
);


