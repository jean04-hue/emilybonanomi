-- =========================================
-- EMILY BONANOMI 2.0
-- CORE DATABASE V1
-- =========================================

CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,

    cpf VARCHAR(14) UNIQUE NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),

    senha_hash TEXT NOT NULL,

    email_verificado BOOLEAN DEFAULT FALSE,

    ultimo_login TIMESTAMP,

    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'cliente'
        CHECK (tipo_usuario IN ('admin', 'cliente')),

    ativo BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP
);

CREATE TABLE enderecos (
    id BIGSERIAL PRIMARY KEY,

    usuario_id BIGINT NOT NULL,

    apelido VARCHAR(100),

    cep VARCHAR(9) NOT NULL,

    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,

    complemento VARCHAR(255),

    bairro VARCHAR(150) NOT NULL,
    cidade VARCHAR(150) NOT NULL,
    estado VARCHAR(2) NOT NULL,

    principal BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_endereco_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,

    slug VARCHAR(120) UNIQUE NOT NULL,

    ativo BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP
);

CREATE TABLE produtos (
    id BIGSERIAL PRIMARY KEY,

    sku VARCHAR(100) UNIQUE NOT NULL,

    nome VARCHAR(255) NOT NULL,

    slug VARCHAR(255) UNIQUE NOT NULL,

    descricao TEXT,

    preco NUMERIC(10,2) NOT NULL,

    preco_promocional NUMERIC(10,2),

    peso NUMERIC(10,3),
    altura NUMERIC(10,2),
    largura NUMERIC(10,2),
    comprimento NUMERIC(10,2),

    ativo BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP
);

CREATE TABLE produto_categorias (
    produto_id BIGINT NOT NULL,
    categoria_id BIGINT NOT NULL,

    PRIMARY KEY (produto_id, categoria_id),

    CONSTRAINT fk_pc_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pc_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON DELETE CASCADE
);

CREATE TABLE produto_imagens (
    id BIGSERIAL PRIMARY KEY,

    produto_id BIGINT NOT NULL,

    url TEXT NOT NULL,

    ordem INTEGER DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_imagem_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id)
        ON DELETE CASCADE
);

CREATE TABLE produto_variacoes (
    id BIGSERIAL PRIMARY KEY,

    produto_id BIGINT NOT NULL,

    sku_variacao VARCHAR(120) UNIQUE NOT NULL,

    cor VARCHAR(100) NOT NULL,

    tamanho VARCHAR(20) NOT NULL,

    estoque INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_variacao_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id)
        ON DELETE CASCADE
);