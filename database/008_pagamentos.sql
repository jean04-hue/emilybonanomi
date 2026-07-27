-- ============================================================
-- 008_pagamentos.sql — Tabela dedicada a pagamentos (Mercado Pago PIX)
-- Idempotente: pode rodar mais de uma vez sem erro
-- ============================================================

CREATE TABLE IF NOT EXISTS pagamentos (
    id              BIGSERIAL PRIMARY KEY,
    pedido_id       BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    payment_id      VARCHAR(255),
    qr_code         TEXT,
    qr_code_base64  TEXT,
    ticket_url      TEXT,
    status          VARCHAR(50) DEFAULT 'pending',
    valor           NUMERIC(10,2),
    expira_em       TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_pedido    ON pagamentos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_paymentid ON pagamentos(payment_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status    ON pagamentos(status);
