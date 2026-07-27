-- =========================================
-- FAVORITOS
-- =========================================

CREATE TABLE favoritos (
    id BIGSERIAL PRIMARY KEY,

    usuario_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favorito_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorito_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_favorito
        UNIQUE (usuario_id, produto_id)
);

-- =========================================
-- CARRINHOS
-- =========================================

CREATE TABLE carrinhos (
    id BIGSERIAL PRIMARY KEY,

    usuario_id BIGINT NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_carrinho_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =========================================
-- CARRINHO ITENS
-- =========================================

CREATE TABLE carrinho_itens (
    id BIGSERIAL PRIMARY KEY,

    carrinho_id BIGINT NOT NULL,

    variacao_id BIGINT NOT NULL,

    quantidade INTEGER NOT NULL DEFAULT 1
        CHECK (quantidade > 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_item_carrinho
        FOREIGN KEY (carrinho_id)
        REFERENCES carrinhos(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_item_variacao
        FOREIGN KEY (variacao_id)
        REFERENCES produto_variacoes(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_item_variacao
        UNIQUE (carrinho_id, variacao_id)
);