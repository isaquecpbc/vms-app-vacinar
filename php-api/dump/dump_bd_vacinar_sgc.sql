-- Dump de estrutura do banco MySQL: vacinar_sgc
-- Gerado em: 2026-03-18 19:05:47

-- --------------------------------------------------
-- Tabela `aplicacao_app`
-- --------------------------------------------------
CREATE TABLE `aplicacao_app` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(38) DEFAULT NULL,
  `participante_id` int NOT NULL,
  `campanha_id` int NOT NULL,
  `vacina_id` int NOT NULL,
  `conveniada_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL COMMENT 'usuario que efetuou a aplicaÃ§Ã£o',
  `lote_id` int DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL COMMENT 'Ativo ou nÃ£o para aplicaÃ§Ã£o\n',
  `dt_aplicacao` date DEFAULT NULL COMMENT 'Data da aplicaÃ§Ã£o',
  `dose` int DEFAULT NULL COMMENT 'Numero da dose aplicada',
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `dt_atualizacao` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `dt_aplicacao2` date DEFAULT NULL,
  `conveniada_id2` int DEFAULT NULL,
  `usuario_id2` int DEFAULT NULL,
  `dispositivo` char(3) DEFAULT 'WEB',
  PRIMARY KEY (`id`),
  KEY `fk_aplicacao_pasciente1_idx` (`participante_id`),
  KEY `fk_aplicacao_campanha1_idx` (`campanha_id`),
  KEY `fk_aplicacao_vacina1_idx` (`vacina_id`),
  KEY `fk_aplicacao_conveniada1_idx` (`conveniada_id`),
  KEY `fk_aplicacao_lote1_idx` (`lote_id`),
  KEY `participante_index` (`participante_id`)
) ENGINE=InnoDB AUTO_INCREMENT=57542182 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `aplicacao_report`
-- --------------------------------------------------
CREATE TABLE `aplicacao_report` (
  `id` int NOT NULL,
  `campanhaId` int NOT NULL,
  `participanteCpf` varchar(15) DEFAULT NULL,
  `participanteCodigoExterno` varchar(15) DEFAULT NULL,
  `dtAplicacao` date DEFAULT NULL,
  `participanteNome` varchar(256) DEFAULT NULL,
  `conveniadaRazaoAplicada` varchar(256) DEFAULT NULL,
  `participanteEmpresaRazao` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_campanha` (`campanhaId`),
  KEY `idx_nome` (`participanteNome`),
  KEY `idx_codigo_externo` (`participanteCodigoExterno`),
  KEY `idx_cpf` (`participanteCpf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `aplicacao_restore`
-- --------------------------------------------------
CREATE TABLE `aplicacao_restore` (
  `id` int NOT NULL AUTO_INCREMENT,
  `participante_id` int NOT NULL,
  `campanha_id` int NOT NULL,
  `vacina_id` int NOT NULL,
  `conveniada_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL COMMENT 'usuario que efetuou a aplicaÃ§Ã£o',
  `lote_id` int DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL COMMENT 'Ativo ou nÃ£o para aplicaÃ§Ã£o\n',
  `dt_aplicacao` date DEFAULT NULL COMMENT 'Data da aplicaÃ§Ã£o',
  `dose` int DEFAULT NULL COMMENT 'Numero da dose aplicada',
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `dt_atualizacao` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `dt_aplicacao2` date DEFAULT NULL,
  `conveniada_id2` int DEFAULT NULL,
  `usuario_id2` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=813632 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `aplicacao_tmp`
-- --------------------------------------------------
CREATE TABLE `aplicacao_tmp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_old` int DEFAULT NULL,
  `vacina_id` int DEFAULT NULL,
  `dose` int DEFAULT NULL,
  `dt_aplicacao` date DEFAULT NULL,
  `tipo_dose` int DEFAULT NULL,
  `conveniada_id` int DEFAULT NULL,
  `lote_descricao` varchar(45) DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `lote_id` int DEFAULT NULL,
  `campanha_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=511 DEFAULT CHARSET=latin1 COMMENT='Tabela temporÃ¡ria para importaÃ§Ã£o das aplicacoes';

-- --------------------------------------------------
-- Tabela `aplicacao_uol`
-- --------------------------------------------------
CREATE TABLE `aplicacao_uol` (
  `id` int NOT NULL AUTO_INCREMENT,
  `participante_id` int NOT NULL,
  `campanha_id` int NOT NULL,
  `vacina_id` int NOT NULL,
  `conveniada_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL COMMENT 'usuario que efetuou a aplicaÃ§Ã£o',
  `lote_id` int DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL COMMENT 'Ativo ou nÃ£o para aplicaÃ§Ã£o\n',
  `dt_aplicacao` varchar(255) DEFAULT NULL COMMENT 'Data da aplicaÃ§Ã£o',
  `dose` int DEFAULT NULL COMMENT 'Numero da dose aplicada',
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `dt_atualizacao` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=118379 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `aux_familiar`
-- --------------------------------------------------
CREATE TABLE `aux_familiar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Familiar ID';

-- --------------------------------------------------
-- Tabela `campanha`
-- --------------------------------------------------
CREATE TABLE `campanha` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `nome` varchar(255) DEFAULT NULL COMMENT 'Nome da campanha',
  `tipo` int DEFAULT NULL COMMENT '1 - campanha necessita de adesao previa  2- campanha nao necessita de adesao previa',
  `link_adesao` varchar(48) DEFAULT NULL,
  `dt_inicio` date DEFAULT NULL COMMENT 'Data de inicio da campanha',
  `dt_fim` date DEFAULT NULL COMMENT 'Data de fim da campanha',
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `termo_adesao` text,
  `dt_adesao_inicio` timestamp NULL DEFAULT NULL,
  `dt_adesao_fim` timestamp NULL DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `permite_lote_proprio` tinyint(1) DEFAULT '1' COMMENT '1 - Permite a clinica usar estoque de lote proprio\n0 - Somente lotes transferidos vacinar',
  `exibe_valor_vacina` tinyint(1) DEFAULT '0',
  `informativo_tela_adesao` text,
  `codigo_acesso` varchar(32) DEFAULT NULL COMMENT 'Codigo de acesso para campanhas de cadastro manual',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=757 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `campanha_lote`
-- --------------------------------------------------
CREATE TABLE `campanha_lote` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campanha_id` int DEFAULT NULL,
  `lote_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=788 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `campanha_novo`
-- --------------------------------------------------
CREATE TABLE `campanha_novo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `nome` varchar(255) DEFAULT NULL COMMENT 'Nome da campanha',
  `tipo` int DEFAULT NULL COMMENT '1 - campanha necessita de adesao previa  2- campanha nao necessita de adesao previa',
  `link_adesao` varchar(48) DEFAULT NULL,
  `dt_inicio` date DEFAULT NULL COMMENT 'Data de inicio da campanha',
  `dt_fim` date DEFAULT NULL COMMENT 'Data de fim da campanha',
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `termo_adesao` text,
  `dt_adesao_inicio` timestamp NULL DEFAULT NULL,
  `dt_adesao_fim` timestamp NULL DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `permite_lote_proprio` tinyint(1) DEFAULT '1' COMMENT '1 - Permite a clinica usar estoque de lote proprio\n0 - Somente lotes transferidos vacinar',
  `exibe_valor_vacina` tinyint(1) DEFAULT '0',
  `informativo_tela_adesao` text,
  `codigo_acesso` varchar(32) DEFAULT NULL COMMENT 'Codigo de acesso para campanhas de cadastro manual',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=357 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `campanha_participante`
-- --------------------------------------------------
CREATE TABLE `campanha_participante` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(38) DEFAULT NULL,
  `campanha_id` int NOT NULL,
  `participante_principal_id` int DEFAULT NULL,
  `empresa_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `codigo_externo` bigint NOT NULL,
  `nome` varchar(128) DEFAULT NULL,
  `sexo` tinyint(1) NOT NULL DEFAULT '0',
  `dt_nascimento` date DEFAULT NULL,
  `cpf` bigint DEFAULT NULL,
  `rua` varchar(256) DEFAULT NULL,
  `numero` varchar(128) DEFAULT NULL,
  `complemento` varchar(128) DEFAULT NULL,
  `bairro` varchar(128) DEFAULT NULL,
  `cidade` varchar(128) DEFAULT NULL,
  `estado` varchar(128) DEFAULT NULL,
  `cep` varchar(128) DEFAULT NULL,
  `telefone` varchar(128) DEFAULT NULL,
  `celular` varchar(128) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `dt_aceite` timestamp NULL DEFAULT NULL,
  `dt_aceite_lgpd` timestamp NULL DEFAULT NULL,
  `departamento` varchar(128) DEFAULT NULL,
  `cargo` varchar(128) DEFAULT NULL,
  `descricao` varchar(128) DEFAULT NULL,
  `matricula` varchar(128) DEFAULT NULL,
  `col1` varchar(128) DEFAULT NULL,
  `col2` varchar(128) DEFAULT NULL,
  `col3` varchar(128) DEFAULT NULL,
  `col4` varchar(128) DEFAULT NULL,
  `col5` varchar(128) DEFAULT NULL,
  `codigo_local` varchar(50) DEFAULT NULL,
  `pagador_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participante` (`campanha_id`,`codigo_externo`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4783534 DEFAULT CHARSET=utf8mb3 COMMENT='Participantes da campanha';

-- --------------------------------------------------
-- Tabela `campanha_participante_novo`
-- --------------------------------------------------
CREATE TABLE `campanha_participante_novo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(38) DEFAULT NULL,
  `campanha_id` int NOT NULL,
  `participante_principal_id` int DEFAULT NULL,
  `empresa_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `codigo_externo` varchar(128) NOT NULL,
  `nome` varchar(128) DEFAULT NULL,
  `sexo` tinyint(1) NOT NULL DEFAULT '0',
  `dt_nascimento` date DEFAULT NULL,
  `cpf` varchar(128) DEFAULT NULL,
  `rua` varchar(256) DEFAULT NULL,
  `numero` varchar(128) DEFAULT NULL,
  `complemento` varchar(128) DEFAULT NULL,
  `bairro` varchar(128) DEFAULT NULL,
  `cidade` varchar(128) DEFAULT NULL,
  `estado` varchar(128) DEFAULT NULL,
  `cep` varchar(128) DEFAULT NULL,
  `telefone` varchar(128) DEFAULT NULL,
  `celular` varchar(128) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `dt_aceite` timestamp NULL DEFAULT NULL,
  `dt_aceite_lgpd` timestamp NULL DEFAULT NULL,
  `departamento` varchar(128) DEFAULT NULL,
  `cargo` varchar(128) DEFAULT NULL,
  `descricao` varchar(128) DEFAULT NULL,
  `matricula` varchar(128) DEFAULT NULL,
  `col1` varchar(128) DEFAULT NULL,
  `col2` varchar(128) DEFAULT NULL,
  `col3` varchar(128) DEFAULT NULL,
  `col4` varchar(128) DEFAULT NULL,
  `col5` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participante` (`campanha_id`,`codigo_externo`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2399736 DEFAULT CHARSET=utf8mb3 COMMENT='Participantes da campanha';

-- --------------------------------------------------
-- Tabela `campanha_participante_pagador`
-- --------------------------------------------------
CREATE TABLE `campanha_participante_pagador` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campanha_id` int NOT NULL,
  `nome` varchar(128) DEFAULT NULL,
  `dt_nascimento` date DEFAULT NULL,
  `cpf` bigint DEFAULT NULL,
  `celular` varchar(128) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `campanha_participante_teste_inteiro`
-- --------------------------------------------------
CREATE TABLE `campanha_participante_teste_inteiro` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(38) DEFAULT NULL,
  `campanha_id` int NOT NULL,
  `participante_principal_id` int DEFAULT NULL,
  `empresa_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `codigo_externo` bigint NOT NULL,
  `nome` varchar(128) DEFAULT NULL,
  `sexo` tinyint(1) NOT NULL DEFAULT '0',
  `dt_nascimento` date DEFAULT NULL,
  `cpf` bigint DEFAULT NULL,
  `rua` varchar(256) DEFAULT NULL,
  `numero` varchar(128) DEFAULT NULL,
  `complemento` varchar(128) DEFAULT NULL,
  `bairro` varchar(128) DEFAULT NULL,
  `cidade` varchar(128) DEFAULT NULL,
  `estado` varchar(128) DEFAULT NULL,
  `cep` varchar(128) DEFAULT NULL,
  `telefone` varchar(128) DEFAULT NULL,
  `celular` varchar(128) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `dt_aceite` timestamp NULL DEFAULT NULL,
  `dt_aceite_lgpd` timestamp NULL DEFAULT NULL,
  `departamento` varchar(128) DEFAULT NULL,
  `cargo` varchar(128) DEFAULT NULL,
  `descricao` varchar(128) DEFAULT NULL,
  `matricula` varchar(128) DEFAULT NULL,
  `col1` varchar(128) DEFAULT NULL,
  `col2` varchar(128) DEFAULT NULL,
  `col3` varchar(128) DEFAULT NULL,
  `col4` varchar(128) DEFAULT NULL,
  `col5` varchar(128) DEFAULT NULL,
  `codigo_local` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participante` (`campanha_id`,`codigo_externo`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3183106 DEFAULT CHARSET=utf8mb3 COMMENT='Participantes da campanha';

-- --------------------------------------------------
-- Tabela `campanha_x_conveniada`
-- --------------------------------------------------
CREATE TABLE `campanha_x_conveniada` (
  `campanha_id` int NOT NULL,
  `conveniada_id` int NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`campanha_id`,`conveniada_id`),
  KEY `fk_campanha_x_conveniada_conveniada1_idx` (`conveniada_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Relacionamento das conveniadas participantes da campanha';

-- --------------------------------------------------
-- Tabela `campanha_x_conveniada_novo`
-- --------------------------------------------------
CREATE TABLE `campanha_x_conveniada_novo` (
  `campanha_id` int NOT NULL,
  `conveniada_id` int NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`campanha_id`,`conveniada_id`),
  KEY `fk_campanha_x_conveniada_conveniada1_new2_idx` (`conveniada_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Relacionamento das conveniadas participantes da campanha';

-- --------------------------------------------------
-- Tabela `campanha_x_parametro`
-- --------------------------------------------------
CREATE TABLE `campanha_x_parametro` (
  `campanha_id` int NOT NULL,
  `parametro_id` int NOT NULL,
  `value` int NOT NULL,
  PRIMARY KEY (`campanha_id`,`parametro_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `campanha_x_vacina`
-- --------------------------------------------------
CREATE TABLE `campanha_x_vacina` (
  `campanha_id` int NOT NULL,
  `vacina_id` int NOT NULL,
  `quantidade_dose` int DEFAULT '1',
  `valor` float DEFAULT NULL,
  `valor_laboratorio` float DEFAULT NULL,
  PRIMARY KEY (`campanha_id`,`vacina_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Relacionamento das vacinas participantes da campanha';

-- --------------------------------------------------
-- Tabela `colaboradores_tmp`
-- --------------------------------------------------
CREATE TABLE `colaboradores_tmp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `endereco` varchar(100) DEFAULT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `cpf` varchar(45) DEFAULT NULL,
  `codigo_interno` varchar(45) DEFAULT NULL,
  `sexo` varchar(45) DEFAULT NULL,
  `data_nasc` date DEFAULT NULL,
  `tipo_colaborador` varchar(45) DEFAULT NULL,
  `matricula` varchar(45) DEFAULT NULL,
  `cnpj_pagador` varchar(45) DEFAULT NULL,
  `empresa` varchar(45) DEFAULT NULL,
  `campanha` varchar(45) DEFAULT NULL,
  `mala_direta` varchar(45) DEFAULT NULL,
  `ativo` varchar(45) DEFAULT NULL,
  `desbloqueado` varchar(45) DEFAULT NULL,
  `familiar` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30237 DEFAULT CHARSET=latin1;

-- --------------------------------------------------
-- Tabela `contato`
-- --------------------------------------------------
CREATE TABLE `contato` (
  `id` int NOT NULL AUTO_INCREMENT,
  `telefone` varchar(45) DEFAULT NULL,
  `celular` varchar(45) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `nome` varchar(256) DEFAULT NULL,
  `descricao` varchar(256) DEFAULT NULL COMMENT 'DescriÃ§Ã£o do contato',
  `id_old` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3930184 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `conveniada_novo`
-- --------------------------------------------------
CREATE TABLE `conveniada_novo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(38) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `cnpj` varchar(45) DEFAULT NULL,
  `razao` varchar(255) DEFAULT NULL,
  `fantasia` varchar(255) DEFAULT NULL,
  `inscricao_estadual` varchar(45) DEFAULT NULL,
  `logo` varchar(45) DEFAULT NULL,
  `rua` varchar(256) DEFAULT NULL,
  `numero` varchar(128) DEFAULT NULL,
  `complemento` varchar(128) DEFAULT NULL,
  `bairro` varchar(128) DEFAULT NULL,
  `cidade` varchar(128) DEFAULT NULL,
  `estado` varchar(128) DEFAULT NULL,
  `cep` varchar(128) DEFAULT NULL,
  `telefone` varchar(128) DEFAULT NULL,
  `celular` varchar(128) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `atende_unidade` tinyint DEFAULT '0',
  `nome_contato` varchar(100) DEFAULT NULL,
  `contato_medico` varchar(255) DEFAULT NULL,
  `descricao_contato` varchar(100) DEFAULT NULL,
  `col1` varchar(128) DEFAULT NULL,
  `col2` varchar(128) DEFAULT NULL,
  `col3` varchar(128) DEFAULT NULL,
  `col4` varchar(128) DEFAULT NULL,
  `col5` varchar(128) DEFAULT NULL,
  `contato_administrativo` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7970 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `eb_tipo_usr`
-- --------------------------------------------------
CREATE TABLE `eb_tipo_usr` (
  `id_tipo` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `empresa_novo`
-- --------------------------------------------------
CREATE TABLE `empresa_novo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(38) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `cnpj` varchar(45) DEFAULT NULL,
  `razao` varchar(255) DEFAULT NULL,
  `fantasia` varchar(255) DEFAULT NULL,
  `inscricao_estadual` varchar(45) DEFAULT NULL,
  `logo` varchar(45) DEFAULT NULL,
  `rua` varchar(256) DEFAULT NULL,
  `numero` varchar(128) DEFAULT NULL,
  `complemento` varchar(128) DEFAULT NULL,
  `bairro` varchar(128) DEFAULT NULL,
  `cidade` varchar(128) DEFAULT NULL,
  `estado` varchar(128) DEFAULT NULL,
  `cep` varchar(128) DEFAULT NULL,
  `telefone` varchar(128) DEFAULT NULL,
  `celular` varchar(128) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `empresa_id` int DEFAULT NULL,
  `col1` varchar(128) DEFAULT NULL,
  `col2` varchar(128) DEFAULT NULL,
  `col3` varchar(128) DEFAULT NULL,
  `col4` varchar(128) DEFAULT NULL,
  `col5` varchar(128) DEFAULT NULL,
  `agencia` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24508 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `empresa_unidade`
-- --------------------------------------------------
CREATE TABLE `empresa_unidade` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int DEFAULT NULL,
  `endereco_id` int DEFAULT NULL,
  `contato_id` int DEFAULT NULL,
  `info_empresa_id` int NOT NULL,
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_empresa_unidade_empresa1_idx` (`empresa_id`),
  KEY `fk_empresa_unidade_endereco1_idx` (`endereco_id`),
  KEY `fk_empresa_unidade_table11_idx` (`contato_id`),
  KEY `fk_empresa_unidade_info_empresa1_idx` (`info_empresa_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `empresa_x_conveniada`
-- --------------------------------------------------
CREATE TABLE `empresa_x_conveniada` (
  `empresa_id` int NOT NULL,
  `conveniada_id` int NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`empresa_id`,`conveniada_id`),
  KEY `fk_empresa_x_conveniada_conveniada1_idx` (`conveniada_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Relacionamento das conveniadas participantes da empresa';

-- --------------------------------------------------
-- Tabela `empresa_x_empresa`
-- --------------------------------------------------
CREATE TABLE `empresa_x_empresa` (
  `empresa_id_pai` int NOT NULL,
  `empresa_id_filha` int NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`empresa_id_pai`,`empresa_id_filha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Relacionamento das empresas entre si';

-- --------------------------------------------------
-- Tabela `endereco`
-- --------------------------------------------------
CREATE TABLE `endereco` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rua` varchar(255) DEFAULT NULL,
  `numero` varchar(45) DEFAULT NULL,
  `complemento` varchar(45) DEFAULT NULL,
  `bairro` varchar(45) DEFAULT NULL,
  `cidade` varchar(45) DEFAULT NULL,
  `estado` varchar(45) DEFAULT NULL,
  `pais` varchar(45) DEFAULT NULL,
  `cep` varchar(45) DEFAULT NULL,
  `id_old` int DEFAULT NULL,
  `departamento` varchar(75) DEFAULT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `pessoa_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3944735 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `equipamento_mobile`
-- --------------------------------------------------
CREATE TABLE `equipamento_mobile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(38) DEFAULT NULL,
  `marca` varchar(45) DEFAULT NULL,
  `modelo` varchar(45) DEFAULT NULL,
  `imei` varchar(45) DEFAULT NULL,
  `mac_address` varchar(45) DEFAULT NULL,
  `capacidade_armazenamento` int DEFAULT NULL,
  `linha` bigint unsigned DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `patrimonio_numero` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1009 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `estoque_conveniada`
-- --------------------------------------------------
CREATE TABLE `estoque_conveniada` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conveniada_id` int NOT NULL,
  `vacina_id` int NOT NULL,
  `campanha_id` int NOT NULL,
  `quantidade` int NOT NULL,
  `valor` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `valor_laboratorio` int NOT NULL,
  `total` int NOT NULL,
  `dt_cadastro` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------
-- Tabela `gerencia_download`
-- --------------------------------------------------
CREATE TABLE `gerencia_download` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `query_string` text,
  `caminho` varchar(255) DEFAULT NULL,
  `nome_arquivo` varchar(100) DEFAULT NULL,
  `status` tinyint DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_fim` timestamp NULL DEFAULT NULL,
  `dt_inicio` timestamp NULL DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `entity` varchar(100) DEFAULT NULL,
  `extension` varchar(5) DEFAULT NULL,
  `params` varchar(255) DEFAULT NULL,
  `script_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3051 DEFAULT CHARSET=latin1;

-- --------------------------------------------------
-- Tabela `import_arquivos`
-- --------------------------------------------------
CREATE TABLE `import_arquivos` (
  `cod` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) DEFAULT NULL,
  `caminho` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `dt_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cod`)
) ENGINE=InnoDB AUTO_INCREMENT=245 DEFAULT CHARSET=latin1;

-- --------------------------------------------------
-- Tabela `info_empresa`
-- --------------------------------------------------
CREATE TABLE `info_empresa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cnpj` varchar(45) DEFAULT NULL,
  `razao` varchar(255) DEFAULT NULL,
  `fantasia` varchar(255) DEFAULT NULL,
  `inscricao_estadual` varchar(45) DEFAULT NULL,
  `logo` varchar(45) DEFAULT NULL,
  `id_old` int DEFAULT NULL,
  `empresa_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `empresa_index` (`empresa_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27402 DEFAULT CHARSET=utf8mb3 COMMENT='Dados comum de uma empresa';

-- --------------------------------------------------
-- Tabela `conveniada`
-- --------------------------------------------------
CREATE TABLE `conveniada` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(38) DEFAULT NULL,
  `endereco_id` int DEFAULT NULL,
  `contato_id` int DEFAULT NULL,
  `info_empresa_id` int NOT NULL,
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `id_old` int DEFAULT NULL,
  `contato_medico` varchar(255) DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `atende_unidade` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_conveniada_endereco1_idx` (`endereco_id`),
  KEY `fk_conveniada_table11_idx` (`contato_id`),
  KEY `fk_conveniada_info_empresa1_idx` (`info_empresa_id`),
  CONSTRAINT `fk_conveniada_endereco1` FOREIGN KEY (`endereco_id`) REFERENCES `endereco` (`id`),
  CONSTRAINT `fk_conveniada_info_empresa1` FOREIGN KEY (`info_empresa_id`) REFERENCES `info_empresa` (`id`),
  CONSTRAINT `fk_conveniada_table11` FOREIGN KEY (`contato_id`) REFERENCES `contato` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3715 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `empresa`
-- --------------------------------------------------
CREATE TABLE `empresa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `endereco_id` int DEFAULT NULL,
  `contato_id` int DEFAULT NULL,
  `info_empresa_id` int NOT NULL,
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `cnae` int DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_empresa_endereco1_idx` (`endereco_id`),
  KEY `fk_empresa_table11_idx` (`contato_id`),
  KEY `fk_empresa_info_empresa1_idx` (`info_empresa_id`),
  CONSTRAINT `fk_empresa_endereco1` FOREIGN KEY (`endereco_id`) REFERENCES `endereco` (`id`),
  CONSTRAINT `fk_empresa_info_empresa1` FOREIGN KEY (`info_empresa_id`) REFERENCES `info_empresa` (`id`),
  CONSTRAINT `fk_empresa_table11` FOREIGN KEY (`contato_id`) REFERENCES `contato` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18407 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `campanha_old`
-- --------------------------------------------------
CREATE TABLE `campanha_old` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa_id` int NOT NULL,
  `nome` varchar(75) DEFAULT NULL COMMENT '''Nome da campanha''',
  `tipo` int DEFAULT NULL COMMENT '1 - campanha necessita de adesao previa  2- campanha nao necessita de adesao previa',
  `link_adesao` varchar(45) DEFAULT NULL,
  `dt_inicio` date DEFAULT NULL COMMENT 'Data de inicio da campanha',
  `dt_fim` date DEFAULT NULL COMMENT 'Data de fim da campanha\n',
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `id_old` int DEFAULT NULL,
  `termo_adesao` text,
  `dt_adesao_inicio` timestamp NULL DEFAULT NULL,
  `dt_adesao_fim` timestamp NULL DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `permite_lote_proprio` tinyint(1) DEFAULT '1' COMMENT '1 - Permite a clinica usar estoque de lote proprio\n0 - Somente lotes transferidos vacinar',
  `exibe_valor_vacina` tinyint(1) DEFAULT '0',
  `informativo_tela_adesao` text,
  `codigo_acesso` varchar(10) DEFAULT NULL COMMENT 'Codigo de acesso para campanhas de cadastro manual',
  PRIMARY KEY (`id`),
  KEY `fk_campanha_empresa1_idx` (`empresa_id`),
  CONSTRAINT `fk_campanha_empresa1` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=357 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `info_pessoal`
-- --------------------------------------------------
CREATE TABLE `info_pessoal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cpf` varchar(45) DEFAULT NULL,
  `dt_nascimento` date DEFAULT NULL,
  `nome` varchar(256) DEFAULT NULL,
  `id_old` int DEFAULT NULL,
  `sexo` tinyint DEFAULT '0' COMMENT '0 - masculino, 1 - feminino',
  `participante_id` bigint unsigned DEFAULT NULL,
  `matricula` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=3925986 DEFAULT CHARSET=utf8mb3 COMMENT='InformaÃ§Ãµes pessoais de uma pessoa';

-- --------------------------------------------------
-- Tabela `info_pessoal_copy`
-- --------------------------------------------------
CREATE TABLE `info_pessoal_copy` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cpf` varchar(45) DEFAULT NULL,
  `dt_nascimento` date DEFAULT NULL,
  `nome` varchar(256) DEFAULT NULL,
  `id_old` int DEFAULT NULL,
  `sexo` tinyint DEFAULT '0' COMMENT '0 - masculino, 1 - feminino',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=229123 DEFAULT CHARSET=utf8mb3 COMMENT='InformaÃ§Ãµes pessoais de uma pessoa';

-- --------------------------------------------------
-- Tabela `log`
-- --------------------------------------------------
CREATE TABLE `log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sistema` varchar(45) DEFAULT NULL,
  `login` varchar(100) DEFAULT NULL,
  `mensagem` text,
  `ip` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1498302 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `lote`
-- --------------------------------------------------
CREATE TABLE `lote` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vacina_id` int NOT NULL,
  `codigo` varchar(45) NOT NULL,
  `dt_validade` date DEFAULT NULL,
  `quantidade` int DEFAULT '0',
  `quantidade_estoque` int NOT NULL,
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `lote_clinica`
-- --------------------------------------------------
CREATE TABLE `lote_clinica` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lote_id` varchar(45) DEFAULT NULL,
  `conveniada_id` varchar(45) DEFAULT NULL,
  `quantidade` int DEFAULT '0',
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `data_envio` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `matricula_valida`
-- --------------------------------------------------
CREATE TABLE `matricula_valida` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricula` varchar(50) DEFAULT NULL,
  `banco_id` int DEFAULT NULL,
  `arquivo_origem` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69424 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `migration_versions`
-- --------------------------------------------------
CREATE TABLE `migration_versions` (
  `version` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------
-- Tabela `modulos`
-- --------------------------------------------------
CREATE TABLE `modulos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) DEFAULT NULL,
  `descricao` varchar(45) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `movimentacao_clinica_mobile`
-- --------------------------------------------------
CREATE TABLE `movimentacao_clinica_mobile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mobile_id` varchar(45) DEFAULT NULL,
  `conveniada_id` varchar(45) DEFAULT NULL,
  `data_envio` date DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  `dt_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `data_retorno` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1284 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `parametro`
-- --------------------------------------------------
CREATE TABLE `parametro` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descricao` varchar(256) NOT NULL,
  `comentario` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `participante_claro`
-- --------------------------------------------------
CREATE TABLE `participante_claro` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campanha_id` int DEFAULT NULL,
  `codigoExterno` varchar(32) DEFAULT NULL,
  `nome` varchar(256) DEFAULT NULL,
  `cpf` varchar(45) DEFAULT NULL,
  `dtNascimento` varchar(45) DEFAULT NULL,
  `rua` varchar(256) DEFAULT NULL,
  `email` varchar(256) DEFAULT NULL,
  `info_pessoal_id` int DEFAULT NULL,
  `endereco_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32946 DEFAULT CHARSET=latin1;

-- --------------------------------------------------
-- Tabela `perfil`
-- --------------------------------------------------
CREATE TABLE `perfil` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1' COMMENT 'Ativo (1) ou NÃ£o (0)\n',
  `descricao` text,
  `dt_exclusao` datetime DEFAULT NULL,
  `sistema` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `perfil_x_permissao`
-- --------------------------------------------------
CREATE TABLE `perfil_x_permissao` (
  `perfil_id` int NOT NULL,
  `permissao_id` int NOT NULL,
  `permissao` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`perfil_id`,`permissao_id`),
  KEY `fk_perfil_x_permissao_permissao1_idx` (`permissao_id`),
  CONSTRAINT `fk_perfil_x_permissao_perfil1` FOREIGN KEY (`perfil_id`) REFERENCES `perfil` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Relacionamento das permissaos participantes da perfil';

-- --------------------------------------------------
-- Tabela `permissao`
-- --------------------------------------------------
CREATE TABLE `permissao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1' COMMENT 'Ativo (1) ou NÃ£o (0)\n',
  `codigo` char(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1073 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `phinxlog`
-- --------------------------------------------------
CREATE TABLE `phinxlog` (
  `version` bigint NOT NULL,
  `start_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `end_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- erro:
-- Erro SQL [1067] [42000]: Invalid default value for 'end_time'
--   Invalid default value for 'end_time'

-- --------------------------------------------------
-- Tabela `process_upload_status`
-- --------------------------------------------------
CREATE TABLE `process_upload_status` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `original_filename` varchar(255) NOT NULL,
  `total_split` smallint unsigned DEFAULT '0',
  `total_ok` smallint unsigned DEFAULT '0',
  `total_fail` smallint unsigned DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `uuid` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6194 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `process_upload_status_items`
-- --------------------------------------------------
CREATE TABLE `process_upload_status_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `process_upload_status_id` bigint unsigned NOT NULL,
  `filename` varchar(255) NOT NULL,
  `status` smallint unsigned DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21420 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `profissional`
-- --------------------------------------------------
CREATE TABLE `profissional` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) DEFAULT NULL,
  `nome_social` varchar(255) DEFAULT NULL,
  `nome_mae` varchar(255) DEFAULT NULL,
  `coren` varchar(11) DEFAULT NULL,
  `conveniada_id` int DEFAULT NULL,
  `status` int DEFAULT '1',
  `rua` varchar(96) DEFAULT NULL,
  `numero` varchar(10) DEFAULT NULL,
  `complemento` varchar(45) DEFAULT NULL,
  `cep` varchar(8) DEFAULT NULL,
  `bairro` varchar(45) DEFAULT NULL,
  `cidade` varchar(45) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `tempo_chegada` int DEFAULT NULL,
  `disponibilidade` varchar(25) DEFAULT NULL,
  `profissao` varchar(25) DEFAULT NULL,
  `disponivel_viajar` int DEFAULT '1',
  `pis` varchar(25) DEFAULT NULL,
  `instituicao_ensino` varchar(48) DEFAULT NULL,
  `banco_codigo` int DEFAULT NULL,
  `banco_agencia` int DEFAULT NULL,
  `banco_conta` varchar(25) DEFAULT NULL,
  `banco_tipo` int DEFAULT NULL,
  `banco_nome` varchar(25) DEFAULT NULL,
  `uf_coren` varchar(25) DEFAULT NULL,
  `ccm` varchar(25) DEFAULT NULL,
  `cpf` varchar(11) DEFAULT NULL,
  `rg` varchar(45) DEFAULT NULL,
  `dt_nascimento` datetime DEFAULT NULL,
  `celular` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `dt_criacao` datetime DEFAULT NULL,
  `dt_exclusao` datetime DEFAULT NULL,
  `arquivo_identificacao` varchar(255) DEFAULT NULL,
  `arquivo_residencia` varchar(255) DEFAULT NULL,
  `arquivo_conselho` varchar(255) DEFAULT NULL,
  `arquivo_curriculo` varchar(255) DEFAULT NULL,
  `arquivo_conta_bancaria` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2185 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------
-- Tabela `sqlmapoutput`
-- --------------------------------------------------
CREATE TABLE `sqlmapoutput` (
  `data` longtext
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------
-- Tabela `token_participante`
-- --------------------------------------------------
CREATE TABLE `token_participante` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(45) DEFAULT NULL,
  `participante_id` int DEFAULT NULL,
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_vinculo` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  `usuario_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `participante_index` (`participante_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42537 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `usuario`
-- --------------------------------------------------
CREATE TABLE `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(38) DEFAULT NULL,
  `contato_id` int DEFAULT NULL,
  `empresa_id` int DEFAULT NULL,
  `conveniada_id` int DEFAULT NULL,
  `info_pessoal_id` int DEFAULT NULL,
  `endereco_id` int DEFAULT NULL,
  `login` varchar(45) NOT NULL,
  `senha` text,
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `password` varchar(256) DEFAULT NULL,
  `update_pass_at` datetime DEFAULT NULL,
  `dt_aceite_lgpd` datetime DEFAULT NULL,
  `ip_allow` varchar(100) DEFAULT NULL,
  `perfil_id` int DEFAULT NULL,
  `login_salt` varchar(255) DEFAULT NULL,
  `login_verifier` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_usuario_contato2_idx` (`contato_id`),
  KEY `fk_usuario_empresa1_idx` (`empresa_id`),
  KEY `fk_usuario_info_pessoal1_idx` (`info_pessoal_id`),
  KEY `conveniada_id` (`conveniada_id`),
  KEY `endereco_id` (`endereco_id`),
  CONSTRAINT `fk_usuario_contato2` FOREIGN KEY (`contato_id`) REFERENCES `contato` (`id`),
  CONSTRAINT `fk_usuario_info_pessoal1` FOREIGN KEY (`info_pessoal_id`) REFERENCES `info_pessoal` (`id`),
  CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`endereco_id`) REFERENCES `endereco` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1894 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `estoque`
-- --------------------------------------------------
CREATE TABLE `estoque` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_origem` int NOT NULL,
  `id_destino` int NOT NULL,
  `lote_origem_id` int NOT NULL,
  `id_campanha` int DEFAULT NULL,
  `quantidade` int NOT NULL,
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lote_destino_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_origem` (`id_origem`),
  KEY `id_destino` (`id_destino`),
  KEY `id_campanha` (`id_campanha`),
  KEY `estoque_ibfk_4` (`lote_origem_id`),
  KEY `lote_destino_id` (`lote_destino_id`),
  CONSTRAINT `estoque_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`),
  CONSTRAINT `estoque_ibfk_2` FOREIGN KEY (`id_origem`) REFERENCES `conveniada` (`id`),
  CONSTRAINT `estoque_ibfk_3` FOREIGN KEY (`id_destino`) REFERENCES `conveniada` (`id`),
  CONSTRAINT `estoque_ibfk_4` FOREIGN KEY (`lote_origem_id`) REFERENCES `lote` (`id`),
  CONSTRAINT `estoque_ibfk_5` FOREIGN KEY (`id_campanha`) REFERENCES `campanha_old` (`id`),
  CONSTRAINT `estoque_ibfk_6` FOREIGN KEY (`lote_destino_id`) REFERENCES `lote` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `usuario_x_campanha`
-- --------------------------------------------------
CREATE TABLE `usuario_x_campanha` (
  `usuario_id` int NOT NULL,
  `campanha_id` int NOT NULL,
  PRIMARY KEY (`usuario_id`,`campanha_id`),
  KEY `fk_campanha_idx` (`campanha_id`),
  CONSTRAINT `fk_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------
-- Tabela `usuario_x_conveniada`
-- --------------------------------------------------
CREATE TABLE `usuario_x_conveniada` (
  `id_usuario` int NOT NULL,
  `id_conveniada` int NOT NULL,
  PRIMARY KEY (`id_usuario`,`id_conveniada`),
  KEY `id_conveniada` (`id_conveniada`),
  CONSTRAINT `usuario_x_conveniada_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`),
  CONSTRAINT `usuario_x_conveniada_ibfk_2` FOREIGN KEY (`id_conveniada`) REFERENCES `conveniada` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `usuario_x_empresa`
-- --------------------------------------------------
CREATE TABLE `usuario_x_empresa` (
  `id_usuario` int NOT NULL,
  `id_empresa` int NOT NULL,
  PRIMARY KEY (`id_usuario`,`id_empresa`),
  KEY `id_empresa` (`id_empresa`),
  CONSTRAINT `usuario_x_empresa_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`),
  CONSTRAINT `usuario_x_empresa_ibfk_2` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `usuario_x_modulo`
-- --------------------------------------------------
CREATE TABLE `usuario_x_modulo` (
  `modulos_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `permissao` char(1) DEFAULT NULL COMMENT '1 - Com Permissao\n2 - Permissao Parcial\n',
  PRIMARY KEY (`modulos_id`,`usuario_id`),
  KEY `fk_usuario_x_modulo_usuario1_idx` (`usuario_id`),
  CONSTRAINT `fk_usuario_x_modulo_modulos1` FOREIGN KEY (`modulos_id`) REFERENCES `modulos` (`id`),
  CONSTRAINT `fk_usuario_x_modulo_usuario1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `usuario_x_perfil`
-- --------------------------------------------------
CREATE TABLE `usuario_x_perfil` (
  `usuario_id` int NOT NULL,
  `perfil_id` int NOT NULL,
  PRIMARY KEY (`usuario_id`,`perfil_id`),
  KEY `fk_usuario_x_perfil_perfil1_idx` (`perfil_id`),
  CONSTRAINT `fk_usuario_x_perfil_perfil1` FOREIGN KEY (`perfil_id`) REFERENCES `perfil` (`id`),
  CONSTRAINT `fk_usuario_x_perfil_usuario1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Relacionamento das perfils participantes da usuario';

-- --------------------------------------------------
-- Tabela `usuario_x_permissao`
-- --------------------------------------------------
CREATE TABLE `usuario_x_permissao` (
  `usuario_id` int NOT NULL,
  `permissao_id` int NOT NULL,
  `permissao` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`usuario_id`,`permissao_id`),
  KEY `fk_usuario_x_permissao_permissao1_idx` (`permissao_id`),
  CONSTRAINT `fk_usuario_x_permissao_usuario1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Relacionamento das permissaos participantes da usuario';

-- --------------------------------------------------
-- Tabela `vacina`
-- --------------------------------------------------
CREATE TABLE `vacina` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1' COMMENT 'Ativo ou NÃ£o\n',
  `par_idade_maxima` int DEFAULT NULL COMMENT '''Idade mÃ¡xima''',
  `par_idade_minima` int DEFAULT NULL COMMENT '''Idade minima''',
  `par_sexo` tinyint(1) NOT NULL DEFAULT '0' COMMENT '''Sexo que a vacina Ã© aplicada''',
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `id_old` int DEFAULT NULL,
  `fabricante` varchar(255) NOT NULL,
  `par_quantidade_dose` int NOT NULL,
  `par_idade_meses_minimo` int DEFAULT NULL,
  `par_idade_meses_maximo` int DEFAULT NULL,
  `par_idade_meses_minimo_feminino` int DEFAULT NULL,
  `par_idade_meses_maximo_feminino` int DEFAULT NULL,
  `par_idade_maxima_feminino` int DEFAULT NULL,
  `par_idade_minima_feminino` int DEFAULT NULL,
  `usar_parametro_idade` tinyint NOT NULL DEFAULT '1',
  `usar_parametro_sexo` tinyint NOT NULL DEFAULT '1',
  `par_dose_extra_idade` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `aplicacao`
-- --------------------------------------------------
CREATE TABLE `aplicacao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(38) DEFAULT NULL,
  `participante_id` int NOT NULL,
  `campanha_id` int NOT NULL,
  `vacina_id` int NOT NULL,
  `conveniada_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL COMMENT 'usuario que efetuou a aplicaÃ§Ã£o',
  `lote_id` int DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL COMMENT 'Ativo ou nÃ£o para aplicaÃ§Ã£o\n',
  `dt_aplicacao` datetime DEFAULT NULL COMMENT 'Data da aplicaÃ§Ã£o',
  `dose` int DEFAULT NULL COMMENT 'Numero da dose aplicada',
  `dt_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dt_exclusao` datetime DEFAULT NULL,
  `dt_atualizacao` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `dt_aplicacao2` date DEFAULT NULL,
  `conveniada_id2` int DEFAULT NULL,
  `usuario_id2` int DEFAULT NULL,
  `dispositivo` char(3) DEFAULT 'WEB',
  `equipamento_id` int DEFAULT NULL,
  `empresa_id` int DEFAULT NULL,
  `profissional_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_aplicacao_campanha1_idx` (`campanha_id`),
  KEY `fk_aplicacao_vacina1_idx` (`vacina_id`),
  KEY `fk_aplicacao_conveniada1_idx` (`conveniada_id`),
  KEY `fk_aplicacao_lote1_idx` (`lote_id`),
  KEY `participante_index` (`participante_id`),
  KEY `aplicacao_usuario_id_IDX` (`usuario_id`) USING BTREE,
  CONSTRAINT `fk_aplicacao_vacina1` FOREIGN KEY (`vacina_id`) REFERENCES `vacina` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59753058 DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `campanha_x_conveniada_x_vacina`
-- --------------------------------------------------
CREATE TABLE `campanha_x_conveniada_x_vacina` (
  `id_campanha` int NOT NULL,
  `id_conveniada` int NOT NULL,
  `id_vacina` int NOT NULL,
  PRIMARY KEY (`id_campanha`,`id_conveniada`,`id_vacina`),
  KEY `id_conveniada` (`id_conveniada`),
  KEY `id_vacina` (`id_vacina`),
  CONSTRAINT `campanha_x_conveniada_x_vacina_ibfk_1` FOREIGN KEY (`id_campanha`) REFERENCES `campanha_old` (`id`),
  CONSTRAINT `campanha_x_conveniada_x_vacina_ibfk_2` FOREIGN KEY (`id_conveniada`) REFERENCES `conveniada` (`id`),
  CONSTRAINT `campanha_x_conveniada_x_vacina_ibfk_3` FOREIGN KEY (`id_vacina`) REFERENCES `vacina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `campanha_x_conveniada_x_vacina_valor`
-- --------------------------------------------------
CREATE TABLE `campanha_x_conveniada_x_vacina_valor` (
  `id_campanha` int NOT NULL,
  `id_conveniada` int NOT NULL,
  `id_vacina` int NOT NULL,
  `valor` float NOT NULL,
  PRIMARY KEY (`id_campanha`,`id_conveniada`,`id_vacina`),
  KEY `id_conveniada` (`id_conveniada`),
  KEY `id_vacina` (`id_vacina`),
  CONSTRAINT `campanha_x_conveniada_x_vacina_valor_ibfk_1` FOREIGN KEY (`id_campanha`) REFERENCES `campanha_old` (`id`),
  CONSTRAINT `campanha_x_conveniada_x_vacina_valor_ibfk_2` FOREIGN KEY (`id_conveniada`) REFERENCES `conveniada` (`id`),
  CONSTRAINT `campanha_x_conveniada_x_vacina_valor_ibfk_3` FOREIGN KEY (`id_vacina`) REFERENCES `vacina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------
-- Tabela `campanha_x_vacina_old`
-- --------------------------------------------------
CREATE TABLE `campanha_x_vacina_old` (
  `campanha_id` int NOT NULL,
  `vacina_id` int NOT NULL,
  `quantidade_dose` int DEFAULT '1',
  `valor` float DEFAULT NULL,
  `valor_laboratorio` float DEFAULT NULL,
  PRIMARY KEY (`campanha_id`,`vacina_id`),
  KEY `fk_campanha_x_vacina_vacina1_idx` (`vacina_id`),
  CONSTRAINT `fk_campanha_x_vacina_campanha1` FOREIGN KEY (`campanha_id`) REFERENCES `campanha_old` (`id`),
  CONSTRAINT `fk_campanha_x_vacina_vacina1` FOREIGN KEY (`vacina_id`) REFERENCES `vacina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Relacionamento das vacinas participantes da campanha';

