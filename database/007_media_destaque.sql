-- =========================================================
-- FASE 1 — Múltiplas mídias por cor + produto em destaque
-- Idempotente: rode quantas vezes quiser.
-- =========================================================

-- Coluna de destaque (hero da home)
ALTER TABLE produtos
    ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_prod_destaque
    ON produtos(destaque)
    WHERE destaque = TRUE;

-- Coluna "cor" nas mídias (NULL = imagem geral do produto)
ALTER TABLE produto_imagens
    ADD COLUMN IF NOT EXISTS cor VARCHAR(100);

-- Coluna "tipo": imagem | video
ALTER TABLE produto_imagens
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(10) DEFAULT 'imagem';

-- Constraint idempotente para tipo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'produto_imagens' AND constraint_name = 'produto_imagens_tipo_check'
    ) THEN
        ALTER TABLE produto_imagens
            ADD CONSTRAINT produto_imagens_tipo_check
            CHECK (tipo IN ('imagem','video'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pi_produto_cor
    ON produto_imagens(produto_id, cor);

CREATE INDEX IF NOT EXISTS idx_pi_produto_tipo
    ON produto_imagens(produto_id, tipo);
