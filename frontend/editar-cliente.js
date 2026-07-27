const urlParams = new URLSearchParams(window.location.search);
const clienteId = urlParams.get('id');

if (!clienteId) {
    alert('Cliente não especificado.');
    window.location.href = 'clientes.html';
}

let clienteAtual = null;

// Carregar dados iniciais
async function carregarCliente() {
    try {
        clienteAtual = await api(`/admin/users/${clienteId}`);

        document.getElementById('tituloCliente').innerText = `Cliente: ${clienteAtual.nome} ${clienteAtual.sobrenome}`;

        // Preencher dados pessoais
        document.getElementById('nome').value = clienteAtual.nome || '';
        document.getElementById('sobrenome').value = clienteAtual.sobrenome || '';
        document.getElementById('email').value = clienteAtual.email || '';
        document.getElementById('telefone').value = clienteAtual.telefone || '';

        // Status de senha
        const statusSenha = document.getElementById('statusSenha');
        if (clienteAtual.senha_temporaria) {
            statusSenha.innerHTML = '<b style="color: orange;">⚠️ Senha Temporária Ativa</b>';
        } else {
            const dataTroca = clienteAtual.senha_alterada_em 
                ? new Date(clienteAtual.senha_alterada_em).toLocaleDateString('pt-BR') 
                : 'Nunca alterada';
            statusSenha.innerHTML = `<span style="color: green;">✅ Senha Normal</span> (Última alteração: ${dataTroca})`;
        }

        // Botão Desativar/Ativar
        const btnToggle = document.getElementById('btnToggleAtivo');
        btnToggle.innerText = clienteAtual.ativo ? '🚫 Desativar Cliente' : '✅ Ativar Cliente';
        btnToggle.className = clienteAtual.ativo ? 'btn btn-danger' : 'btn btn-success';
        btnToggle.onclick = toggleAtivo;

        // Preencher Endereço
        if (clienteAtual.endereco) {
            document.getElementById('cep').value = clienteAtual.endereco.cep || '';
            document.getElementById('logradouro').value = clienteAtual.endereco.logradouro || '';
            document.getElementById('numero').value = clienteAtual.endereco.numero || '';
            document.getElementById('complemento').value = clienteAtual.endereco.complemento || '';
            document.getElementById('bairro').value = clienteAtual.endereco.bairro || '';
            document.getElementById('cidade').value = clienteAtual.endereco.cidade || '';
            document.getElementById('estado').value = clienteAtual.endereco.estado || '';
        }

        // Renderizar Pedidos e Resumo
        renderizarPedidos(clienteAtual.pedidos || []);

    } catch (e) {
        alert('Erro ao carregar dados do cliente: ' + e.message);
    }
}

// Renderizar Tabela e Totais de Pedidos
function renderizarPedidos(pedidos) {
    const tb = document.getElementById('tabelaPedidos');
    const resumo = document.getElementById('resumoPedidos');

    if (!pedidos.length) {
        tb.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum pedido encontrado.</td></tr>';
        resumo.innerHTML = '<p><b>Total de pedidos:</b> 0 | <b>Total gasto:</b> R$ 0,00</p>';
        return;
    }

    const totalGasto = pedidos.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);
    resumo.innerHTML = `<p><b>Total de pedidos:</b> ${pedidos.length} | <b>Total gasto:</b> R$ ${totalGasto.toFixed(2)}</p>`;

    tb.innerHTML = pedidos.map(p => `
        <tr>
            <td>#${p.codigo_pedido || p.id}</td>
            <td>${new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
            <td>${p.status}</td>
            <td>R$ ${parseFloat(p.total).toFixed(2)}</td>
        </tr>
    `).join('');
}

// Salvar Formulário de Edição (Dados + Endereço)
document.getElementById('formCliente').onsubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            nome: document.getElementById('nome').value,
            sobrenome: document.getElementById('sobrenome').value,
            telefone: document.getElementById('telefone').value,
            endereco: {
                cep: document.getElementById('cep').value,
                logradouro: document.getElementById('logradouro').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value
            }
        };

        await api(`/admin/users/${clienteId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        alert('Cliente e endereço atualizados com sucesso!');
        carregarCliente();
    } catch (err) {
        alert('Erro ao salvar: ' + err.message);
    }
};

// Toggle Ativar/Desativar
async function toggleAtivo() {
    if (!confirm('Deseja realmente alterar o status deste cliente?')) return;
    try {
        await api(`/admin/users/${clienteId}/toggle`, { method: 'PATCH' });
        carregarCliente();
    } catch (e) {
        alert('Erro: ' + e.message);
    }
}

// Redefinir Senha Temporária
document.getElementById('btnResetSenha').onclick = async () => {

    if (
        !confirm(
            'Deseja realmente gerar uma nova senha temporária para este cliente?\n\nA senha atual será invalidada imediatamente.'
        )
    ) {
        return;
    }

    try {

        const res = await api(
            `/admin/users/${clienteId}/reset-password`,
            {
                method: 'POST'
            }
        );

        document.getElementById(
            'textoSenhaGerada'
        ).innerText = res.senha_temporaria;

        document.getElementById('statusSenha').innerHTML =
    '<b style="color:#ff9800;">⚠ Senha Temporária Ativa</b>';

        document.getElementById(
            'boxSenhaGerada'
        ).style.display = 'block';

        document.getElementById('boxSenhaGerada')
    .scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

        if (res.emailEnviado) {

    alert(
`✅ Senha temporária criada com sucesso!

O cliente recebeu um e-mail automaticamente.

Fluxo:
• A senha antiga foi invalidada.
• O cliente deverá fazer login utilizando a senha temporária.
• Após o login será obrigado a cadastrar uma nova senha antes de acessar a loja.`
    );

} else {

    alert(
`⚠ A senha temporária foi criada.

Não foi possível enviar o e-mail automaticamente.

Copie a senha exibida abaixo e encaminhe manualmente ao cliente.

Motivo:
${res.mensagem || 'Falha no envio do e-mail.'}`
    );

}

        carregarCliente();

    } catch (e) {

        alert(
            'Erro ao redefinir senha:\n\n' +
            e.message
        );

    }

};

// Copiar Senha
const btnCopiarSenha = document.getElementById('btnCopiarSenha');
if (btnCopiarSenha) {
    btnCopiarSenha.onclick = () => {
        const senha = document.getElementById('textoSenhaGerada').innerText;
        navigator.clipboard.writeText(senha).then(() => {
            alert('Senha copiada para a área de transferência!');
        }).catch(err => {
            alert('Erro ao copiar senha: ' + err.message);
        });
    };
}

carregarCliente();