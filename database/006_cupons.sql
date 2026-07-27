-- =========================================
-- CUPONS
-- =========================================

CREATE TABLE cupons (
    id BIGSERIAL PRIMARY KEY,

    codigo VARCHAR(50) UNIQUE NOT NULL,

    descricao VARCHAR(255),

    tipo_desconto VARCHAR(20) NOT NULL
    CHECK (
        tipo_desconto IN (
            'percentual',
            'valor_fixo',
            'frete_gratis'
        )
    ),

    valor_desconto NUMERIC(10,2) NOT NULL DEFAULT 0,

    valor_minimo_pedido NUMERIC(10,2) DEFAULT 0,

    limite_total_usos INTEGER,

    total_usos INTEGER DEFAULT 0,

    ativo BOOLEAN DEFAULT TRUE,

    data_inicio TIMESTAMP,

    data_fim TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- CUPOM USOS
-- =========================================

CREATE TABLE cupom_usos (
    id BIGSERIAL PRIMARY KEY,

    cupom_id BIGINT NOT NULL,

    usuario_id BIGINT NOT NULL,

    pedido_id BIGINT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cupom_uso_cupom
        FOREIGN KEY (cupom_id)
        REFERENCES cupons(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cupom_uso_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cupom_uso_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_cupom_usuario
        UNIQUE (cupom_id, usuario_id)
);