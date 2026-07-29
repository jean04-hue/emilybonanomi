// Usamos a API REST do Brevo diretamente via fetch (Sem erro de SDK!)

async function enviarEmailRedefinicaoSenha({ to, nome, senhaTemporaria, linkLoja }) {

    const htmlContent = `
<div style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
<tr>
<td align="center">
<table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.08);">
<tr>
<td style="background:#2e7d32;padding:35px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:34px;">Emily Bonanomi</h1>
<p style="margin:12px 0 0;color:#EAF7EA;font-size:16px;">Moda Feminina • Elegância em cada detalhe</p>
</td>
</tr>
<tr>
<td style="padding:45px;">
<h2 style="margin-top:0;color:#333;">Olá, ${nome}! 👋</h2>
<p style="font-size:16px;color:#555;line-height:1.8;">
Recebemos uma solicitação de redefinição da senha da sua conta.
Para garantir a segurança dos seus dados, foi criada uma <strong>senha temporária</strong> que permitirá apenas um novo acesso.
</p>
<div style="background:#f8f8f8;border:2px dashed #2e7d32;border-radius:10px;padding:25px;margin:35px 0;text-align:center;">
<p style="margin:0;color:#777;font-size:14px;">Sua senha temporária é:</p>
<div style="font-size:34px;font-weight:bold;color:#2e7d32;letter-spacing:4px;margin-top:15px;font-family:Consolas,monospace;">
${senhaTemporaria}
</div>
</div>
<div style="background:#FFF8F1;border-left:5px solid #d9a57c;padding:25px;border-radius:6px;margin-bottom:35px;">
<h3 style="margin-top:0;color:#8b5e3c;">Como acessar sua conta</h3>
<p style="margin:10px 0;color:#555;"><b>1.</b> Clique no botão <b>"Acessar Loja"</b>.</p>
<p style="margin:10px 0;color:#555;"><b>2.</b> Faça login utilizando seu e-mail cadastrado e a senha temporária acima.</p>
<p style="margin:10px 0;color:#555;"><b>3.</b> Você será redirecionado automaticamente para criar uma nova senha.</p>
<p style="margin:10px 0;color:#555;"><b>4.</b> Após cadastrar sua nova senha, seu acesso será liberado normalmente.</p>
</div>
<div style="text-align:center;margin:45px 0;">
<a href="${linkLoja}" style="background:#2e7d32;color:#fff;padding:18px 45px;text-decoration:none;font-size:18px;font-weight:bold;border-radius:8px;display:inline-block;">
🛍️ Acessar Loja
</a>
</div>
<div style="background:#FFF3CD;border-left:5px solid #FFC107;padding:20px;border-radius:6px;">
<h3 style="margin-top:0;color:#856404;">🔒 Importante</h3>
<p style="margin-bottom:10px;color:#555;line-height:1.7;">• Esta senha é temporária.</p>
<p style="margin-bottom:10px;color:#555;line-height:1.7;">• Ela poderá ser utilizada apenas para o próximo acesso.</p>
<p style="margin-bottom:10px;color:#555;line-height:1.7;">• Assim que você criar uma nova senha, esta senha temporária será invalidada automaticamente.</p>
<p style="margin:0;color:#555;line-height:1.7;">• Caso não tenha solicitado esta alteração, entre em contato imediatamente com nossa equipe.</p>
</div>
</td>
</tr>
<tr>
<td style="background:#fafafa;padding:35px;text-align:center;border-top:1px solid #eee;">
<p style="margin:0;font-size:14px;color:#777;line-height:1.8;">
Este é um e-mail automático da <strong>Emily Bonanomi</strong>.<br>Por favor, não responda esta mensagem.
</p>
<p style="margin-top:20px;font-size:13px;color:#aaa;">
© ${new Date().getFullYear()} Emily Bonanomi. Todos os direitos reservados.
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</div>
`;

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { name: "Emily Bonanomi", email: "financeiro.neiderjean@gmail.com" },
                to: [{ email: to, name: nome }],
                subject: "🔑 Sua senha temporária - Emily Bonanomi",
                htmlContent
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Erro Brevo HTTP ${response.status}: ${JSON.stringify(data)}`);
        }

        console.log("EMAIL TEMPORÁRIO ENVIADO VIA BREVO:", data);
        return data;

    } catch (err) {
        console.error("ERRO EMAIL TEMPORÁRIO:", err);
        throw err;
    }
}

async function enviarEmailRecuperacao({ to, nome, link }) {
    const htmlContent = `
<div style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
<tr>
<td align="center">
<table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.08);">
<tr>
<td style="background:#2e7d32;padding:35px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:34px;">Emily Bonanomi</h1>
<p style="margin:12px 0 0;color:#EAF7EA;font-size:16px;">Moda Feminina • Elegância em cada detalhe</p>
</td>
</tr>
<tr>
<td style="padding:45px;">
<h2 style="margin-top:0;color:#333;">Olá, ${nome}! 👋</h2>
<p style="font-size:16px;color:#555;line-height:1.8;">Recebemos uma solicitação para redefinir a senha da sua conta.</p>
<p style="font-size:16px;color:#555;line-height:1.8;">Se foi você quem realizou essa solicitação, basta clicar no botão abaixo para criar uma nova senha.</p>
<div style="background:#FFF8F1;border-left:5px solid #d9a57c;padding:25px;border-radius:6px;margin:35px 0;">
<h3 style="margin-top:0;color:#8b5e3c;">Como recuperar sua senha</h3>
<p style="margin:10px 0;color:#555;"><b>1.</b> Clique no botão <b>"Criar nova senha"</b>.</p>
<p style="margin:10px 0;color:#555;"><b>2.</b> Escolha uma nova senha para sua conta.</p>
<p style="margin:10px 0;color:#555;"><b>3.</b> Confirme a nova senha.</p>
<p style="margin:10px 0;color:#555;"><b>4.</b> Faça login normalmente utilizando sua nova senha.</p>
</div>
<div style="text-align:center;margin:45px 0;">
<a href="${link}" style="background:#2e7d32;color:#fff;padding:18px 45px;text-decoration:none;font-size:18px;font-weight:bold;border-radius:8px;display:inline-block;">
🔐 Criar nova senha
</a>
</div>
<div style="background:#FFF3CD;border-left:5px solid #FFC107;padding:20px;border-radius:6px;">
<h3 style="margin-top:0;color:#856404;">⏳ Importante</h3>
<p style="margin-bottom:10px;color:#555;line-height:1.7;">• Este link é válido por apenas <b>30 minutos</b>.</p>
<p style="margin-bottom:10px;color:#555;line-height:1.7;">• Após esse período será necessário solicitar uma nova recuperação.</p>
<p style="margin:0;color:#555;line-height:1.7;">• Caso você não tenha solicitado esta alteração, basta ignorar este e-mail. Sua senha continuará a mesma.</p>
</div>
</td>
</tr>
<tr>
<td style="background:#fafafa;padding:35px;text-align:center;border-top:1px solid #eee;">
<p style="margin:0;font-size:14px;color:#777;line-height:1.8;">
Este é um e-mail automático da <strong>Emily Bonanomi</strong>.<br>Por favor, não responda esta mensagem.
</p>
<p style="margin-top:20px;font-size:13px;color:#aaa;">
© ${new Date().getFullYear()} Emily Bonanomi. Todos os direitos reservados.
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</div>
`;

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { name: "Emily Bonanomi", email: "financeiro.neiderjean@gmail.com" },
                to: [{ email: to, name: nome }],
                subject: "🔐 Recuperação de senha - Emily Bonanomi",
                htmlContent
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Erro Brevo HTTP ${response.status}: ${JSON.stringify(data)}`);
        }

        console.log("EMAIL RECUPERAÇÃO ENVIADO VIA BREVO:", data);
        return data;

    } catch (err) {
        console.error("ERRO EMAIL RECUPERAÇÃO:", err);
        throw err;
    }
}

module.exports = {
    enviarEmailRedefinicaoSenha,
    enviarEmailRecuperacao
};