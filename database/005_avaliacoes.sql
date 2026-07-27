-- =========================================
-- AVALIACOES DE PRODUTOS
-- =========================================

CREATE TABLE avaliacoes_produtos (
    id BIGSERIAL PRIMARY KEY,

    produto_id BIGINT NOT NULL,

    usuario_id BIGINT NOT NULL,

    pedido_id BIGINT NOT NULL,

    nota INTEGER NOT NULL
        CHECK (nota >= 1 AND nota <= 5),

    comentario TEXT,

    aprovado BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_avaliacao_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_avaliacao_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_avaliacao_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE
);