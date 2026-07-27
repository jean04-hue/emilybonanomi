# 🚀 DEPLOY — Emily Bonanomi 2.0

Guia completo, em ordem, do zero até a loja no ar acessível pelo mundo inteiro.
Tempo total estimado: **40–60 minutos**.

---

## 📋 Visão geral

| Serviço         | Função                    | Plano grátis? |
|-----------------|---------------------------|---------------|
| **Cloudinary**  | Hospedar imagens          | ✅ Sim |
| **Neon**        | Banco PostgreSQL          | ✅ Sim |
| **Mercado Pago**| Receber pagamentos PIX    | ✅ Sim |
| **Render**      | Hospedar o backend (API)  | ✅ Sim |
| **Netlify**     | Hospedar a loja e o admin | ✅ Sim |
| **cron-job.org**| Manter o Render acordado  | ✅ Sim |

> Todas as contas são gratuitas para começar. Você só paga quando crescer.

---

## A) Cloudinary — onde as fotos dos produtos vão morar

1. Acesse <https://cloudinary.com/users/register_free> e crie a conta.
2. Confirme o e-mail.
3. No painel inicial (**Dashboard**), no canto superior, você verá um quadro com:
   - **Cloud name**
   - **API Key**
   - **API Secret** (clique no olhinho 👁 para mostrar)
4. **Copie esses 3 valores num bloco de notas** — vamos colar no Render adiante.
5. (Opcional) Em **Media Library → +Add folder**, crie a pasta `emily_bonanomi/produtos`. O backend já manda as imagens pra essa pasta.

---

## B) Mercado Pago — para receber PIX

1. Acesse <https://www.mercadopago.com.br/developers/panel> e faça login.
2. Clique em **Suas integrações → Criar aplicação**.
   - Nome: `Emily Bonanomi`
   - Modelo: **Pagamentos online**
   - Produto: **Checkout API** (PIX)
3. Dentro da aplicação criada, vá em **Credenciais de produção**:
   - Copie o **Access Token** (começa com `APP_USR-...`).
4. Para testar antes de receber dinheiro de verdade, use as **Credenciais de teste** (`TEST-...`) — mesma tela, aba "Credenciais de teste".
5. Salve esse token; ele vai virar a env `MP_ACCESS_TOKEN` no Render.

> **Importante:** para receber PIX real, sua conta MP precisa estar verificada (CPF/CNPJ aprovado). Use TEST enquanto isso.

---

## C) Neon — banco PostgreSQL na nuvem (grátis)

1. Acesse <https://console.neon.tech> → **Sign up** (entre com GitHub ou Google).
2. Clique em **Create project**:
   - Project name: `emily-bonanomi`
   - Region: **US East (Ohio)** (mais próximo do Render)
3. Após criar, na tela aparece um quadro **Connection string** — algo como:
   ```
   postgresql://emilybonanomi_owner:abc123@ep-xxxxx.neon.tech/emily_bonanomi?sslmode=require
   ```
   Copie essa string inteira. É a variável `DATABASE_URL`.
4. **Rodar o schema:**
   - No menu esquerdo clique em **SQL Editor**.
   - Abra o arquivo `database/schema_completo.sql` do projeto, **copie tudo**, cole no editor e clique **Run**.
   - Você deve ver `CREATE TABLE` em cascata sem erro.
5. **Conferir o admin:** ainda no SQL Editor execute:
   ```sql
   SELECT email, tipo_usuario FROM usuarios;
   ```
   Tem que aparecer `admin@emily.com | admin`. A senha é `Admin@123`.

---

## D) Subir o código para o GitHub

> O Render faz deploy lendo do GitHub. Se você nunca usou Git:

1. Instale o Git: <https://git-scm.com/download/win>
2. Crie conta no GitHub: <https://github.com>
3. No GitHub clique em **+ → New repository**, nome: `emily-bonanomi`, **Private**, sem README. Clique em **Create**.
4. Abra o **CMD/PowerShell** na pasta do projeto (`Emily_Bonanomi/`):
   ```bash
   git init
   git add .
   git commit -m "Versão final 2.0"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/emily-bonanomi.git
   git push -u origin main
   ```
   O GitHub vai pedir login (use **Personal Access Token** em vez de senha — gera em GitHub → Settings → Developer settings → Tokens).

---

## E) Render — hospedar o backend

1. Acesse <https://render.com> → **Get Started** (entre com GitHub e autorize).
2. **New → Web Service**.
3. Selecione o repositório `emily-bonanomi`. Clique em **Connect**.
4. Configure assim:
   - **Name:** `emily-bonanomi-api`
   - **Region:** Ohio (US East)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Mais abaixo em **Environment Variables**, clique em **Add Environment Variable** e adicione UMA POR UMA:

   | Chave | Valor |
   |---|---|
   | `DATABASE_URL` | (cole a connection string do Neon) |
   | `JWT_SECRET` | uma string longa e aleatória (ex.: `emily-secret-prod-2026-Q9k!xyz`) |
   | `CLOUDINARY_CLOUD_NAME` | (do Cloudinary) |
   | `CLOUDINARY_API_KEY` | (do Cloudinary) |
   | `CLOUDINARY_API_SECRET` | (do Cloudinary) |
   | `MP_ACCESS_TOKEN` | (Access Token do Mercado Pago) |
   | `FRONTEND_URL` | deixe `*` por enquanto (depois trocamos) |
   | `MP_WEBHOOK_URL` | deixe vazio; preenchemos depois |

6. Clique em **Create Web Service**. O Render vai instalar e subir — leva uns 3–5 minutos.
7. Quando terminar, no topo aparece a URL pública, tipo:
   `https://emily-bonanomi-api.onrender.com`
   Anote essa URL.
8. **Teste:** abra `https://emily-bonanomi-api.onrender.com/health` no navegador — deve retornar `{"ok":true,...}`.

---

## F) Atualizar o frontend com a URL real do backend

Antes de subir pro Netlify, abra:
- `frontend-loja/config.js`
- `frontend/config.js`

E em **ambos** troque a linha:
```js
: 'https://SEU-BACKEND.onrender.com/api';
```
pela URL real, ex.:
```js
: 'https://emily-bonanomi-api.onrender.com/api';
```
Salve, depois faça `git add . && git commit -m "url backend" && git push` (não é obrigatório, mas é boa prática manter o repositório sincronizado).

---

## G) Netlify — hospedar a loja (pública) e o admin

> Vamos criar **dois sites** no Netlify: um pra `frontend-loja/`, outro pra `frontend/`.

### G.1) Loja pública

1. Acesse <https://app.netlify.com> → entre com GitHub.
2. Clique em **Add new site → Deploy manually**.
3. Arraste **APENAS a pasta `frontend-loja`** do seu computador para a área indicada.
4. O Netlify gera uma URL aleatória, tipo `glittering-cake-123.netlify.app`. Clique em **Site settings → Change site name** e mude para algo legível, ex.: `emily-bonanomi`.
5. URL final: `https://emily-bonanomi.netlify.app` — **anote**.

### G.2) Painel admin

6. Volte em **Sites → Add new site → Deploy manually**.
7. Arraste a pasta `frontend` (a do admin).
8. Renomeie pra `emily-admin` → URL `https://emily-admin.netlify.app`.

### G.3) Liberar CORS no backend

9. Volte ao Render → seu serviço → **Environment** → edite `FRONTEND_URL`:
   ```
   https://emily-bonanomi.netlify.app,https://emily-admin.netlify.app
   ```
10. O Render reinicia automaticamente. Aguarde uns 30 segundos.

### G.4) Configurar webhook do Mercado Pago

11. No Render edite a env `MP_WEBHOOK_URL`:
    ```
    https://emily-bonanomi-api.onrender.com/api/payments/webhook
    ```
12. No painel Mercado Pago → **Suas integrações → sua aplicação → Webhooks → Configurar notificações** → cole a mesma URL acima → marque o evento **payments**. Salvar.

Pronto. Agora, quando alguém pagar um PIX, o MP avisa seu backend, que muda o status do pedido pra "pago" automaticamente.

---

## H) (Opcional) Domínio próprio

1. Compre um domínio em <https://registro.br> (`.com.br` é R$ 40/ano) ou GoDaddy/Hostinger.
2. No Netlify (site da loja) → **Domain settings → Add custom domain** → digite `emilybonanomi.com.br`.
3. O Netlify mostra os **DNS records** (4 nameservers). No painel do Registro.br vá em **Editar zona DNS** e configure conforme o Netlify pediu.
4. Aguarde até 24h para propagar. O SSL (https) é instalado automático pelo Netlify.

---

## I) (Opcional) Evitar "cold start" do Render free

O plano grátis do Render dorme depois de 15 min sem acesso. Pra primeira requisição não demorar 30s:

1. Crie conta em <https://cron-job.org> (grátis).
2. **Create cronjob**:
   - Title: `Emily ping`
   - URL: `https://emily-bonanomi-api.onrender.com/health`
   - Schedule: a cada 10 minutos
3. Salvar. Pronto, o backend fica sempre quente.

---

## J) ✅ Checklist final de testes

Faça TUDO isto direto na loja pública e no admin **em produção** antes de entregar pro cliente:

1. [ ] Acessar a loja pelo celular — visual responsivo OK
2. [ ] Cadastrar novo cliente (e-mail novo)
3. [ ] Fazer login com o cliente
4. [ ] Cadastrar um endereço em "Minha conta"
5. [ ] No admin (`/login.html`) logar com `admin@emily.com` / `Admin@123`
6. [ ] Trocar a senha do admin imediatamente (via SQL no Neon, ou pela tela de perfil se existir):
       ```sql
       UPDATE usuarios SET senha_hash = '<hash bcrypt nova>' WHERE email='admin@emily.com';
       ```
7. [ ] No admin, cadastrar 1 categoria
8. [ ] Cadastrar 1 produto, com pelo menos 1 cor + 1 tamanho + estoque
9. [ ] Subir 2 imagens do produto (vai pro Cloudinary)
10. [ ] Voltar na loja como cliente, abrir o produto e adicionar ao carrinho
11. [ ] Finalizar checkout — escolher endereço — gerar PIX
12. [ ] Conferir que o QR-code PIX aparece e funciona (testar no app do banco se for produção, ou no painel MP em modo teste)
13. [ ] Pagar (ou no painel admin clicar em "Confirmar pagamento manualmente")
14. [ ] Status do pedido vai pra "Pago" — admin muda pra "Separando" → "Enviado" (adiciona código de rastreio)
15. [ ] Cliente vê o pedido em "Meus Pedidos" com o status atualizado
16. [ ] Admin marca como "Entregue" → cliente avalia o produto (1–5 estrelas)
17. [ ] Avaliação aparece na página do produto
18. [ ] Cliente favorita um produto, abre "Favoritos", remove

Se passou todos: **a loja está pronta pra ser entregue ao cliente. 🎉**

---

## 🆘 Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| "Failed to fetch" no navegador | CORS não liberou a URL do Netlify | Conferir `FRONTEND_URL` no Render (com `https://`, sem `/` no fim) |
| Backend cai com `ECONNREFUSED` | `DATABASE_URL` errada | Recopiar do Neon, deve terminar com `?sslmode=require` |
| Imagens não sobem | Cloudinary keys erradas | Conferir as 3 envs no Render |
| QR PIX não gera | `MP_ACCESS_TOKEN` inválido | Pegar token novo no painel MP |
| Webhook não dispara | URL do webhook errada | Conferir no painel MP que termina em `/api/payments/webhook` |
| Site fora do ar | Render dormiu | Aguardar 30s OU configurar cron-job (item I) |

---

Pronto. Loja online, do mundo todo. Boa venda! 🛍️
