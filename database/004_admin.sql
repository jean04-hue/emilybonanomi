-- =========================================
-- CONFIGURACOES LOJA
-- =========================================

CREATE TABLE configuracoes_loja (
    id BIGSERIAL PRIMARY KEY,

    nome_loja VARCHAR(255) NOT NULL,

    email_contato VARCHAR(255),

    telefone_contato VARCHAR(30),

    instagram VARCHAR(255),

    facebook VARCHAR(255),

    tiktok VARCHAR(255),

    descricao TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- CONFIGURACOES FRETE
-- =========================================

CREATE TABLE configuracoes_frete (
    id BIGSERIAL PRIMARY KEY,

    valor_frete_gratis NUMERIC(10,2) DEFAULT 299.00,

    ativo BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- BANNERS
-- =========================================

CREATE TABLE banners (
    id BIGSERIAL PRIMARY KEY,

    titulo VARCHAR(255),

    subtitulo VARCHAR(255),

    imagem_url TEXT NOT NULL,

    link_destino TEXT,

    ordem INTEGER DEFAULT 1,

    ativo BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP
);

-- =========================================
-- NOTIFICACOES
-- =========================================

CREATE TABLE notificacoes (
    id BIGSERIAL PRIMARY KEY,

    usuario_id BIGINT NOT NULL,

    titulo VARCHAR(255) NOT NULL,

    mensagem TEXT NOT NULL,

    tipo VARCHAR(50) DEFAULT 'sistema',

    lida BOOLEAN DEFAULT FALSE,

    enviado_email BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notificacao_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =========================================
-- LOGS ADMIN
-- =========================================

CREATE TABLE logs_admin (
    id BIGSERIAL PRIMARY KEY,

    admin_id BIGINT NOT NULL,

    entidade VARCHAR(100) NOT NULL,

    entidade_id BIGINT,

    acao VARCHAR(50) NOT NULL,

    dados_antes JSONB,

    dados_depois JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_admin
        FOREIGN KEY (admin_id)
        REFERENCES usuarios(id)
);