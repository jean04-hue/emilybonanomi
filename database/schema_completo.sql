-- =========================================================
-- EMILY BONANOMI 2.0 - SCHEMA CONSOLIDADO E IDEMPOTENTE
-- Execute ESTE arquivo no banco vazio. Ele cria tudo.
-- =========================================================

-- ===== USUÁRIOS =====
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    senha_hash TEXT NOT NULL,
    email_verificado BOOLEAN DEFAULT FALSE,
    ultimo_login TIMESTAMP,
    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'cliente'
        CHECK (tipo_usuario IN ('admin','cliente')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ===== ENDEREÇOS =====
CREATE TABLE IF NOT EXISTS enderecos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    apelido VARCHAR(100),
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(255),
    bairro VARCHAR(150) NOT NULL,
    cidade VARCHAR(150) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_end_usuario ON enderecos(usuario_id);

-- ===== CATEGORIAS =====
CREATE TABLE IF NOT EXISTS categorias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ===== PRODUTOS =====
CREATE TABLE IF NOT EXISTS produtos (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    descricao TEXT,
    categoria_id BIGINT REFERENCES categorias(id) ON DELETE SET NULL,
    preco NUMERIC(10,2) NOT NULL,
    preco_promocional NUMERIC(10,2),
    peso NUMERIC(10,3),
    altura NUMERIC(10,2),
    largura NUMERIC(10,2),
    comprimento NUMERIC(10,2),
    ativo BOOLEAN DEFAULT TRUE,
    destaque BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
-- Compat: adiciona categoria_id em bases já criadas sem a coluna
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS categoria_id BIGINT REFERENCES categorias(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_prod_ativo ON produtos(ativo);

CREATE TABLE IF NOT EXISTS produto_imagens (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    cor VARCHAR(100),
    tipo VARCHAR(10) DEFAULT 'imagem' CHECK (tipo IN ('imagem','video')),
    ordem INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pi_produto_cor ON produto_imagens(produto_id, cor);
CREATE INDEX IF NOT EXISTS idx_pi_produto_tipo ON produto_imagens(produto_id, tipo);
CREATE INDEX IF NOT EXISTS idx_prod_destaque ON produtos(destaque) WHERE destaque = TRUE;

CREATE TABLE IF NOT EXISTS produto_variacoes (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    sku_variacao VARCHAR(120) UNIQUE NOT NULL,
    cor VARCHAR(100) NOT NULL,
    tamanho VARCHAR(20) NOT NULL,
    estoque INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== FAVORITOS =====
CREATE TABLE IF NOT EXISTS favoritos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    produto_id BIGINT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, produto_id)
);

-- ===== CARRINHO =====
CREATE TABLE IF NOT EXISTS carrinhos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carrinho_itens (
    id BIGSERIAL PRIMARY KEY,
    carrinho_id BIGINT NOT NULL REFERENCES carrinhos(id) ON DELETE CASCADE,
    variacao_id BIGINT NOT NULL REFERENCES produto_variacoes(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (carrinho_id, variacao_id)
);

-- ===== PEDIDOS =====
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGSERIAL PRIMARY KEY,
    codigo_pedido VARCHAR(30) UNIQUE NOT NULL,
    external_reference VARCHAR(100) UNIQUE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    endereco_id BIGINT NOT NULL REFERENCES enderecos(id),
    status VARCHAR(30) NOT NULL DEFAULT 'aguardando_pagamento'
        CHECK (status IN ('aguardando_pagamento','pago','separando','enviado','entregue','cancelado','devolvido')),
    status_pagamento VARCHAR(30) DEFAULT 'pending',
    metodo_pagamento VARCHAR(30),
    data_pagamento TIMESTAMP,
    subtotal NUMERIC(10,2) NOT NULL,
    frete NUMERIC(10,2) NOT NULL DEFAULT 0,
    desconto NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    mercadopago_payment_id VARCHAR(255),
    codigo_rastreio VARCHAR(100),
    transportadora VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ped_user ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ped_status ON pedidos(status);

CREATE TABLE IF NOT EXISTS pedido_itens (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id BIGINT NOT NULL REFERENCES produtos(id),
    variacao_id BIGINT NOT NULL REFERENCES produto_variacoes(id),
    sku VARCHAR(100) NOT NULL,
    nome_produto VARCHAR(255) NOT NULL,
    cor VARCHAR(100),
    tamanho VARCHAR(20),
    preco_unitario NUMERIC(10,2) NOT NULL,
    quantidade INTEGER NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historico_status_pedido (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    usuario_responsavel_id BIGINT REFERENCES usuarios(id),
    status VARCHAR(30) NOT NULL,
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== AVALIAÇÕES =====
CREATE TABLE IF NOT EXISTS avaliacoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    produto_id BIGINT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, produto_id)
);

-- ===== COMPROVANTES (fallback PIX manual) =====
CREATE TABLE IF NOT EXISTS comprovantes_pagamento (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- SEED INICIAL
-- =========================================================

-- Admin padrão  (email: admin@emily.com  senha: Admin@123)
INSERT INTO usuarios (nome, sobrenome, cpf, email, telefone, senha_hash, tipo_usuario, email_verificado)
VALUES (
  'Admin','Emily','00000000000','admin@emily.com','(00) 00000-0000',
  '$2b$10$pw1kAl6eIVt6B9enBwdBKOfbWmEjRw9DTXAXQxwg7KUtlHKXXQzVO',
  'admin', TRUE
) ON CONFLICT (email) DO NOTHING;

-- Categorias de exemplo
INSERT INTO categorias (nome, slug) VALUES
 ('Feminino','feminino'),('Masculino','masculino'),('Acessórios','acessorios')
ON CONFLICT (slug) DO NOTHING;
