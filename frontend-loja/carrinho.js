// Carrinho — CRUD completo, permite remover mesmo sem estoque
if (!exigirLogin()) { /* redireciona */ }

async function carregarCarrinho() {
    const container = document.getElementById('carrinho');
    const resumo = document.getElementById('resumoCarrinho');
    container.innerHTML = '<p>Carregando...</p>';

    let itens = [];
    try { itens = await api('/cart'); }
    catch (e) { container.innerHTML = `<p>Erro: ${e.message}</p>`; return; }

    if (!itens.length) {
        container.innerHTML = '<p style="text-align:center;padding:40px">Seu carrinho está vazio.</p>';
        resumo.innerHTML = '';
        atualizarBadgeCarrinho();
        return;
    }

    // Buscar estoque de cada variação
    const variacoesInfo = {};
    await Promise.all(itens.map(async it => {
        try {
            const vs = await fetch(`${API_URL}/products/${it.produto_id}/variations`).then(r=>r.json());
            const v = vs.find(x => Number(x.id) === Number(it.variacao_id));
            variacoesInfo[it.variacao_id] = v ? v.estoque : 0;
        } catch(_) { variacoesInfo[it.variacao_id] = 0; }
    }));

    let total = 0;
    let temProblema = false;

    container.innerHTML = itens.map(item => {
        const preco = Number(item.preco);
        const qtd = Number(item.quantidade);
        const subtotal = preco * qtd;
        total += subtotal;
        const est = variacoesInfo[item.variacao_id] || 0;
        const semEstoque = est <= 0;
        const excedeu = qtd > est;
        if (semEstoque || excedeu) temProblema = true;

        return `
        <div class="item-carrinho card" style="display:flex;justify-content:space-between;gap:16px;padding:16px;margin-bottom:12px">
          <div style="flex:1">
            <h3>${item.nome}</h3>
            <p style="color:#666">Cor: ${item.cor || '-'} | Tamanho: ${item.tamanho || '-'}</p>
            <p style="color:#666">SKU: ${item.sku || '-'}</p>
            <p>Preço unitário: R$ ${preco.toFixed(2).replace('.',',')}</p>
            ${semEstoque ? '<p style="color:#c00;font-weight:bold">⚠ Sem estoque</p>' :
              excedeu ? `<p style="color:#c00;font-weight:bold">⚠ Apenas ${est} em estoque</p>` : ''}
            <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
              <button onclick="alterarQtd(${item.id}, ${qtd - 1})" ${qtd<=1?'disabled':''}>−</button>
              <input type="number" min="1" value="${qtd}" style="width:60px;text-align:center"
                onchange="alterarQtd(${item.id}, this.value)">
              <button onclick="alterarQtd(${item.id}, ${qtd + 1})" ${qtd>=est?'disabled':''}>+</button>
              <button onclick="removerItem(${item.id})" style="margin-left:16px;background:#c00;color:#fff;padding:6px 12px;border:none;border-radius:4px;cursor:pointer">Remover</button>
            </div>
          </div>
          <div style="text-align:right">
            <p class="preco" style="font-size:18px;font-weight:bold">R$ ${subtotal.toFixed(2).replace('.',',')}</p>
          </div>
        </div>`;
    }).join('');

    resumo.innerHTML = `
      <div class="card" style="padding:20px;margin-top:20px">
        <h2>Total: R$ ${total.toFixed(2).replace('.',',')}</h2>
        ${temProblema ? '<p style="color:#c00">Corrija os itens marcados antes de finalizar.</p>' : ''}
        <a class="btn btn-primary ${temProblema?'disabled':''}"
           href="${temProblema?'#':'checkout.html'}"
           style="${temProblema?'opacity:.5;pointer-events:none':''}">
           Finalizar Compra
        </a>
      </div>`;
    atualizarBadgeCarrinho();
}

window.alterarQtd = async function(id, nova) {
    nova = Number(nova);
    if (!nova || nova < 1) return;
    try {
        await api('/cart/item/' + id, { method:'PUT', body: JSON.stringify({ quantidade: nova }) });
        carregarCarrinho();
    } catch (e) { toast(e.message,"erro"); }
};

window.removerItem = async function(id) {
    if (!confirm('Remover este item do carrinho?')) return;
    try {
        await api('/cart/item/' + id, { method:'DELETE' });
        carregarCarrinho();
    } catch (e) { toast(e.message,"erro"); }
};

carregarCarrinho();
