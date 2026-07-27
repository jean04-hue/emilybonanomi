# Emily_Bonanomi 2.0 — Fase 5

## O que mudou nesta fase
Substituição **completa do painel administrativo** (pasta `frontend/`).  
**Nada** foi alterado no backend, no banco ou no site público (`frontend-loja/`).  
As páginas do admin agora seguem o padrão visual e comportamental da spec:

- Login exclusivo do admin com verificação de `role/tipo_usuario === 'admin'`
- Chaves isoladas no `localStorage`: `eb_admin_token` e `eb_admin_user` (não conflitam com o login do cliente na loja)
- Guard automático em todas as páginas (redireciona pra `login.html` se não for admin)
- Sidebar fixa com Dashboard · Produtos · Categorias · Estoque · Pedidos · Clientes · Avaliações · Sair
- Wrapper `api()` com injeção automática do Bearer, tratamento de 401 e envelope `{success,data}` ou `{erro}`
- Utilitários `toast()`, `money()`, `statusBadge()`
- Visual: Playfair Display + Poppins, verde `#2e7d32`, bege `#d9a57c`, fundo `#f7f5f1`

### Páginas criadas
`login.html`, `dashboard.html`, `produtos.html`, `produto-form.html`, `editar-produto.html`, `produto-imagens.html`, `categorias.html`, `categoria-form.html`, `editar-categoria.html`, `estoque.html`, `pedidos.html`, `clientes.html`, `editar-cliente.html`, `avaliacoes.html` — mais `admin.css` e `admin.js` completamente reescritos.

### Endpoints usados (já existentes no backend)
| Recurso | Rota |
| --- | --- |
| Login | `POST /api/auth/login` |
| Dashboard | `GET /api/admin/dashboard` |
| Produtos | `GET/POST/PUT/DELETE /api/admin/products[/:id]` |
| Imagens do produto | `GET /api/products/:id/images`, `POST /api/products/:id/images`, `DELETE /api/products/images/:imgId` |
| Variações | `GET /api/products/:id/variations`, `POST /api/products/:id/variations`, `PUT/DELETE /api/products/variations/:vid` |
| Categorias | `GET/POST/PUT/DELETE /api/admin/categories` |
| Pedidos | `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`, `POST /api/admin/orders/:id/rastreio`, `POST /api/admin/orders/:id/confirmar-pagamento` |
| Clientes | `GET /api/admin/users`, `GET /api/admin/users/:id`, `PATCH /api/admin/users/:id/toggle` |
| Avaliações | `GET /api/admin/reviews`, `DELETE /api/admin/reviews/:id` |
| Estoque | via `PUT /api/products/variations/:id` (`{ estoque }`) |

---

## Passo a passo detalhado pra testar localmente

### 1. Banco de dados
Se você já testou a Fase 4 no mesmo Postgres, **pule este passo**.

Caso queira começar do zero:
1. Abra o pgAdmin (ou DBeaver / psql) e crie um banco: `CREATE DATABASE emily;`
2. Conecte no banco `emily` e rode, na ordem:
   - `database/schema_completo.sql`
   - todas as migrations em `database/` (ex.: `v2_migrations.sql`, `008_pagamentos_mp.sql`, `admin_seed.sql`)
3. Confirme que existe o admin: `SELECT email, tipo_usuario FROM usuarios WHERE tipo_usuario='admin';`
   → deve retornar `admin@emily.com`.

### 2. Backend
Abra o projeto no VS Code.

1. **Terminal** → `cd backend`
2. `npm install` (só na primeira vez)
3. Confirme o `.env` do backend (mesmo da Fase 4). Mínimo necessário:
   ```env
   PORT=3000
   DATABASE_URL=postgres://usuario:senha@localhost:5432/emily
   JWT_SECRET=alguma_chave_bem_longa_e_aleatoria
   CLOUDINARY_CLOUD_NAME=xxx
   CLOUDINARY_API_KEY=xxx
   CLOUDINARY_API_SECRET=xxx
   FRONTEND_URL=http://127.0.0.1:5500,http://localhost:5500
   # SMTP é opcional — sem ele, os e-mails caem em "dry-run" (log no console)
   ```
   > Se sua senha do Postgres começa com número ou tem caractere especial, mantenha ela **entre aspas** no `.env`. O `pg` já foi ajustado para forçar `String()`.

4. `npm run dev` → deve subir em `http://localhost:3000` (veja a rota `/health`).

### 3. Frontend do admin
Não requer build. Basta servir os arquivos estáticos:

1. No VS Code, abra a pasta `frontend/`
2. Confirme o arquivo `frontend/config.js`:
   ```js
   window.API_URL = 'http://localhost:3000/api';
   ```
3. Clique com o botão direito em `login.html` → **Open with Live Server** (extensão Live Server, porta 5500 por padrão).
4. Abra `http://127.0.0.1:5500/login.html`.

### 4. Roteiro de testes (checklist)
Faça na ordem para garantir que tudo está OK.

**A. Login**
- [ ] Digite `admin@emily.com` / `Admin@123` → cai no dashboard
- [ ] Faça logout (sidebar → Sair) → volta pra login
- [ ] Tente abrir `dashboard.html` sem estar logado → redireciona pra `login.html`
- [ ] Faça login com uma conta **cliente** (não admin) na tela de login do admin → mostra "Somente administradores" (não guarda token)

**B. Dashboard**
- [ ] Vê os 6 cards: Vendas hoje, Vendas do mês, Ticket médio, Pedidos, Clientes, Produtos
- [ ] "Últimos pedidos" e "Top produtos" aparecem preenchidos (se o banco tiver dados)

**C. Categorias**
- [ ] Criar nova categoria (ex.: "Vestidos" / slug `vestidos`)
- [ ] Editar o nome dela
- [ ] Desativar → some da listagem pública, mas fica no admin como "Inativa"

**D. Produtos**
- [ ] Criar produto novo (SKU único, slug, nome, preço, categoria)
- [ ] Após criar, você é redirecionado para `editar-produto.html` daquele produto
- [ ] Adicionar 2 variações (ex.: `Preta / P / 5` e `Preta / M / 3`)
- [ ] Clicar em "Gerenciar imagens" → subir 1 imagem `.jpg` → aparece no Cloudinary
- [ ] Voltar à listagem em `produtos.html` → o novo produto aparece com o estoque somado
- [ ] Abrir o site público (`frontend-loja/index.html` via Live Server em outra porta ou aba) → o produto deve aparecer se `ativo=true`

**E. Estoque**
- [ ] Em `estoque.html`, cada produto lista suas variações com input numérico
- [ ] Mudar quantidade + botão Salvar → toast "Estoque atualizado"
- [ ] Recarregar → valor persistiu

**F. Pedidos**
- [ ] Faça um pedido de teste como cliente na loja (`frontend-loja/`) — cadastre um cliente, adicione produto ao carrinho, gere o PIX
- [ ] Volte pro admin → `pedidos.html` → o pedido aparece com status "Aguardando Pagamento"
- [ ] Clique em **Confirmar Pagto** → status muda pra "Pago"
- [ ] Mude o status pra "Enviado", preencha transportadora + código de rastreio, clique **Salvar** → console do backend loga o e-mail (ou envia se SMTP estiver configurado)
- [ ] No cliente, `meus-pedidos.html` mostra o pedido atualizado

**G. Clientes**
- [ ] `clientes.html` mostra todos os clientes cadastrados, com a contagem de pedidos correta
- [ ] Clique em "Ver" → vê os pedidos daquele cliente
- [ ] "Desativar" → status muda pra "Não"

**H. Avaliações**
- [ ] Como cliente, avalie um produto que já comprou
- [ ] No admin, `avaliacoes.html` lista a review com estrelas + comentário
- [ ] Botão "Remover" apaga a avaliação

**I. Segurança**
- [ ] Sem token: `curl -i http://localhost:3000/api/admin/dashboard` → **401**
- [ ] Com token de cliente comum: **403 "Acesso negado"**
- [ ] Com token de admin: **200** com JSON

---

## Deploy
As instruções de deploy do backend (Render/Neon) e do admin (Netlify) continuam **idênticas às da Fase 4** — veja `DEPLOY.md`. Só lembre de:
- Netlify do admin apontando para a pasta `frontend/`
- `frontend/config.js` com `window.API_URL = 'https://SEU-BACKEND.onrender.com/api'`
- Em `FRONTEND_URL` do backend, incluir a URL do admin (separada por vírgula)

---

## Notas
- Se o backend rodar em porta diferente de 3000, edite `frontend/config.js`.
- O painel usa `eb_admin_token` / `eb_admin_user` no `localStorage`; o site público usa `token` / `user` (chaves separadas). Você pode ficar logado nos dois ao mesmo tempo no mesmo browser sem conflito.
- Se você quiser um caminho protegido (por servidor) em vez de estáticos, sirva `frontend/` por trás de um `nginx` com Basic Auth adicional — não é obrigatório.
- Trocar a senha do admin em produção: `UPDATE usuarios SET senha_hash = '<hash bcrypt>' WHERE email='admin@emily.com';` (gere hash com `bcrypt.hash('NovaSenha', 10)`).
