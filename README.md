# Emily_Bonanomi 2.0 — Loja Virtual

Loja virtual completa de roupas (frontend público + painel admin) com pagamento PIX via **Mercado Pago**, imagens no **Cloudinary** e banco **PostgreSQL**.

## Stack
- **Frontend:** HTML5 + CSS3 + JavaScript Vanilla
- **Backend:** Node.js + Express 5
- **Banco:** PostgreSQL 14+
- **Imagens:** Cloudinary
- **Pagamento:** Mercado Pago (PIX)
- **Hospedagem sugerida:** Backend no **Render**, frontends no **Netlify**, banco no **Neon**

## Estrutura
```
Emily_Bonanomi/
├── backend/          → API Express
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js
│       ├── config/   (db.js, cloudinary.js, mercadopago.js)
│       ├── middlewares/
│       ├── models/
│       ├── services/
│       ├── controllers/
│       └── routes/
├── database/
│   └── schema_completo.sql  ← rode ESTE arquivo no banco vazio
├── frontend/         → painel admin (login.html é a porta de entrada)
└── frontend-loja/    → site público da loja (index.html é a home)
```

## Rodar localmente

### 1. Banco
```bash
createdb emily_bonanomi
psql -d emily_bonanomi -f database/schema_completo.sql
```
> Cria o admin padrão: **admin@emily.com** / **Admin@123**

### 2. Backend
```bash
cd backend
cp .env.example .env   # depois edite com suas chaves
npm install
npm start
```
API ficará em http://localhost:3000

### 3. Frontends
Servir os arquivos estáticos com qualquer servidor (Live Server, http-server, etc.):
```bash
npx http-server frontend-loja -p 5500
npx http-server frontend      -p 5501
```
Acesse:
- Loja: http://localhost:5500
- Admin: http://localhost:5501/login.html

## Deploy em produção
Veja **[DEPLOY.md](./DEPLOY.md)** — passo a passo completo (Cloudinary + Neon + Render + Netlify + domínio + checklist de testes).
