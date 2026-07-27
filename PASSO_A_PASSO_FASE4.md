# Emily Bonanomi — FASE 4 (Checkout + Mercado Pago PIX)

Nesta versão foi implementado o **fluxo real de produção do Mercado Pago PIX**, mantendo tudo que já existia (admin, cadastro, login, catálogo, carrinho).

## O que foi adicionado / alterado

### Backend
- **`database/008_pagamentos.sql`** — nova tabela dedicada `pagamentos` (payment_id, qr_code, qr_code_base64, status, valor, expira_em).
- **`backend/src/models/payment.model.js`** — CRUD da tabela `pagamentos`.
- **`backend/src/controllers/payment.controller.js`**
  - `POST /api/payments/pix` → cria/reutiliza um pagamento PIX pro pedido.
  - `GET  /api/payments/:pedidoId/status` → consulta status (com fallback direto no Mercado Pago).
- **`backend/src/routes/payment.routes.js`** — registra as rotas acima (autenticadas por JWT).
- **`backend/src/services/order.service.js`** — agora, ao criar pedido, o PIX também é salvo em `pagamentos`.
- **`backend/src/services/webhook.service.js`** — o webhook do Mercado Pago também atualiza o status em `pagamentos`.
- **`backend/src/app.js`** — registra `app.use('/api/payments', paymentRoutes)`.

### Frontend loja
- **`frontend-loja/checkout.html`** — layout novo em 2 colunas + modal para cadastrar endereço sem sair da tela.
- **`frontend-loja/pix.html` + `pix.js`** — reescritos com QR Code, botão copiar, contador regressivo (15min), status em tempo real via `setInterval` de 5s, redirecionamento pra `meus-pedidos.html` quando `status = approved`.

## Fluxo completo (produção)
```
Carrinho → Checkout → Selecionar/Cadastrar endereço
        → POST /api/orders (cria pedido + PIX no Mercado Pago + salva em `pagamentos`)
        → pix.html (QR + código copia-e-cola + polling 5s)
        → Usuário paga no app do banco
        → Webhook Mercado Pago → PATCH pedidos.status_pagamento = approved
        → Polling detecta → mostra "Pagamento aprovado" → redireciona pra Meus Pedidos
```

---

## Passo a passo para testar LOCALMENTE (antes do deploy)

### 1) Banco de dados
No PostgreSQL local, rodar em ordem (só o novo é obrigatório se você já tinha as tabelas anteriores):
```bash
psql -U postgres -d emily_bonanomi -f database/schema_completo.sql   # (se ainda não rodou)
psql -U postgres -d emily_bonanomi -f database/008_pagamentos.sql
```

### 2) Backend — `.env`
Dentro de `backend/`, crie/edite `.env`:
```
PORT=3000
DATABASE_URL=postgres://postgres:SUA_SENHA@localhost:5432/emily_bonanomi
JWT_SECRET=uma_chave_secreta_forte
FRONTEND_URL=*
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxx     # token de TESTE do Mercado Pago
MP_WEBHOOK_URL=                                     # deixe vazio no local (só em deploy)
```
> Como obter o token: painel Mercado Pago → *Suas integrações* → *Credenciais de teste* → **Access Token**.

### 3) Rodar backend
```bash
cd backend
npm install
npm install mercadopago      # caso ainda não tenha instalado
npm run dev                  # ou: node server.js
```
Deve aparecer o servidor escutando em `http://localhost:3000`.

Teste rápido: `curl http://localhost:3000/health` → `{"ok":true,...}`

### 4) Frontend
No VS Code, abrir a pasta `frontend-loja/` com **Live Server** (ou hospedar via `python -m http.server 5500`).
Confirme que `frontend-loja/config.js` aponta para `http://localhost:3000/api`.

### 5) Roteiro de teste manual
1. Abra `login-cliente.html`, cadastre um cliente novo (`cadastro.html`) e faça login.
2. Vá em `index.html`, adicione produtos ao carrinho.
3. Abra `carrinho.html` → *Finalizar compra* → `checkout.html`.
4. Cadastre um endereço pelo botão **+ Novo endereço** (o modal salva sem sair da tela).
5. Clique em **Finalizar Compra**.
   - Backend deve criar o pedido, chamar o Mercado Pago e retornar `{ pedido, pagamento }`.
   - Você deve ser redirecionado pra `pix.html` com QR Code + código copia-e-cola + contador.
6. Verifique no Postgres:
   ```sql
   SELECT * FROM pedidos ORDER BY id DESC LIMIT 1;
   SELECT * FROM pagamentos ORDER BY id DESC LIMIT 1;
   ```
7. **Simular pagamento aprovado** (Mercado Pago sandbox):
   - Opção A (mais real): pagar via app do banco em ambiente de teste do MP.
   - Opção B (rápida, só pra validar o polling): rode direto no banco
     ```sql
     UPDATE pedidos SET status_pagamento='approved', status='pago' WHERE id = <ID>;
     UPDATE pagamentos SET status='approved' WHERE pedido_id = <ID>;
     ```
     A tela do PIX vai detectar em até 5s, mostrar **"Pagamento aprovado!"** e redirecionar pra `meus-pedidos.html`.

### 6) Endpoints para testar via Postman/curl
```http
POST http://localhost:3000/api/payments/pix
Authorization: Bearer <TOKEN>
Content-Type: application/json

{ "pedidoId": 10 }
```
```http
GET http://localhost:3000/api/payments/10/status
Authorization: Bearer <TOKEN>
```

### 7) Deploy (webhook do Mercado Pago)
- Publique o backend (Render/Railway/etc).
- No Mercado Pago → *Webhooks* → cole:
  `https://SEU-BACKEND/api/webhook`  (ou `/api/payments/webhook`)
- Defina `MP_WEBHOOK_URL=https://SEU-BACKEND/api/webhook` no `.env` de produção.
- A partir daí o `webhook.service.js` atualiza `pedidos` e `pagamentos` automaticamente quando o cliente pagar.

Pronto. Fluxo real de produção, código organizado em `routes / controllers / services / models`, sem framework no frontend.
