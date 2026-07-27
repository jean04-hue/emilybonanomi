-- =========================================
-- PEDIDOS
-- =========================================

CREATE TABLE pedidos (
    id BIGSERIAL PRIMARY KEY,

    codigo_pedido VARCHAR(30) UNIQUE NOT NULL,
    external_reference VARCHAR(100) UNIQUE,

    usuario_id BIGINT NOT NULL,

    endereco_id BIGINT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'aguardando_pagamento'
    CHECK (
        status IN (
            'aguardando_pagamento',
            'pago',
            'separando',
            'enviado',
            'entregue',
            'cancelado',
            'devolvido'
        )
    ),

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id),

    CONSTRAINT fk_pedido_endereco
        FOREIGN KEY (endereco_id)
        REFERENCES enderecos(id)
);
-- =========================================
-- PEDIDO ITENS
-- =========================================

CREATE TABLE pedido_itens (
    id BIGSERIAL PRIMARY KEY,

    pedido_id BIGINT NOT NULL,

    produto_id BIGINT NOT NULL,

    variacao_id BIGINT NOT NULL,

    sku VARCHAR(100) NOT NULL,

    nome_produto VARCHAR(255) NOT NULL,

    cor VARCHAR(100),

    tamanho VARCHAR(20),

    preco_unitario NUMERIC(10,2) NOT NULL,

    quantidade INTEGER NOT NULL,

    subtotal NUMERIC(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_item_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_item_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id),

    CONSTRAINT fk_item_variacao
        FOREIGN KEY (variacao_id)
        REFERENCES produto_variacoes(id)
);

-- =========================================
-- HISTORICO STATUS PEDIDO
-- =========================================

CREATE TABLE historico_status_pedido (
    id BIGSERIAL PRIMARY KEY,

    pedido_id BIGINT NOT NULL,

    usuario_responsavel_id BIGINT,

    status VARCHAR(30) NOT NULL,

    observacao TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_historico_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_historico_usuario
        FOREIGN KEY (usuario_responsavel_id)
        REFERENCES usuarios(id)
);