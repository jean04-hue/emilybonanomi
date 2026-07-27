const params = new URLSearchParams(window.location.search);
const pedidoId = params.get('id');

async function carregarPedido() {
    try {
        const pedido = await api(`/orders/${pedidoId}`);
        const container = document.getElementById('pedido');

        // Estilo padrão para os cards
        const cardStyle = `
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        `;

        // 1. Cabeçalho e Card de Informações do Pedido
        let html = `
        <div style="max-width:1000px; margin:auto; padding:30px;">
            <h2 style="margin-bottom: 20px;">
                Pedido ${pedido.codigo_pedido}
            </h2>

            <div class="card-style" style="${cardStyle}">
                <h3 style="margin-top:0; margin-bottom:15px;">Informações do Pedido</h3>
                
                <p><strong>ID:</strong> ${pedido.id}</p>
                <p><strong>Data:</strong> ${new Date(pedido.created_at).toLocaleString('pt-BR')}</p>
                <p>
                    <strong>Status:</strong>
                    <span class="status ${pedido.status.toLowerCase()}">${pedido.status}</span>
                </p>
                <p><strong>Pagamento:</strong> ${pedido.status_pagamento}</p>
                <p><strong>Total:</strong> R$ ${Number(pedido.total).toFixed(2)}</p>
                <p style="margin-bottom:0;"><strong>Itens:</strong> ${pedido.itens.length}</p>
            </div>

            <h3 style="margin-top: 30px; margin-bottom: 15px;">Produtos</h3>
        `;

        // 2. Loop dos Produtos
        pedido.itens.forEach(item => {
            const urlProduto = `../frontend-loja/produto.html?id=${item.produto_id}`;

            html += `
            <div class="card-style" style="${cardStyle} display:flex; gap:20px; align-items:flex-start;">
                <img
                    src="${item.imagem}"
                    alt="${item.nome_produto}"
                    style="
                        width:120px;
                        height:120px;
                        object-fit:cover;
                        border-radius:8px;
                        border:1px solid #ddd;
                    ">

                <div style="flex:1;">
                    <h4 style="margin-top:0;">${item.nome_produto}</h4>
                    <p><strong>ID Produto:</strong> ${item.produto_id}</p>
                    
                    <button
                        class="btn"
                        style="margin-bottom:12px;"
                        onclick="window.open('${urlProduto}','_blank')">
                        Ver Produto
                    </button>

                    <p><strong>SKU:</strong> ${item.sku}</p>
                    <p><strong>Categoria:</strong> <span id="categoria-${item.produto_id}">Carregando...</span></p>
                    <p><strong>Cor:</strong> ${item.cor}</p>
                    <p><strong>Tamanho:</strong> ${item.tamanho}</p>
                    <p><strong>Quantidade:</strong> ${item.quantidade}</p>
                    <p><strong>Valor Unitário:</strong> R$ ${Number(item.preco_unitario).toFixed(2)}</p>
                    <p><strong>Subtotal:</strong> R$ ${Number(item.subtotal).toFixed(2)}</p>
                    <p style="margin-bottom:0;"><strong>Estoque Atual:</strong> <span id="estoque-${item.variacao_id}">Carregando...</span></p>
                </div>
            </div>
            `;
        });

        // Monta a string do endereço completo para a busca no Google Maps
        const enderecoCompleto = `${pedido.logradouro || ''}, ${pedido.numero || ''} ${pedido.bairro || ''} ${pedido.cidade || ''} ${pedido.estado || ''} ${pedido.cep || ''}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto.trim())}`;

        // 3. Card do Endereço de Entrega (Clicável e com efeitos visuais)
        html += `
            <h3 style="margin-top: 30px; margin-bottom: 15px;">📍 Endereço de Entrega</h3>
            
            <div 
                class="card-style" 
                style="${cardStyle} cursor: pointer; transition: all 0.2s ease-in-out;" 
                onclick="window.open('${mapsUrl}', '_blank')"
                onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.1)'; this.style.borderColor='#cbd5e1';"
                onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.04)'; this.style.borderColor='#e2e8f0';"
                onmousedown="this.style.transform='scale(0.98)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.04)';"
                onmouseup="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.1)';"
                title="Clique para abrir no Google Maps"
            >
                <p><strong>Apelido:</strong> ${pedido.apelido || '-'}</p>
                <p><strong>CEP:</strong> ${pedido.cep || '-'}</p>
                <p><strong>Logradouro:</strong> ${pedido.logradouro || '-'}, ${pedido.numero || '-'}</p>
                ${pedido.complemento ? `<p><strong>Complemento:</strong> ${pedido.complemento}</p>` : ''}
                <p><strong>Bairro:</strong> ${pedido.bairro || '-'}</p>
                <p style="margin-bottom:0;"><strong>Cidade:</strong> ${pedido.cidade || '-'} / ${pedido.estado || '-'}</p>
            </div>
        </div>
        `;

        container.innerHTML = html;

        // Atualiza categoria e estoque dos produtos
        for (const item of pedido.itens) {
            try {
                const produto = await api(`/products/${item.produto_id}`);

                document.getElementById(`categoria-${item.produto_id}`).textContent =
                    produto.categoria_nome || '-';

                const variacao = produto.variacoes.find(v => v.id == item.variacao_id);

                document.getElementById(`estoque-${item.variacao_id}`).textContent =
                    variacao ? variacao.estoque : '-';
            } catch (e) {
                console.error(e);
            }
        }

    } catch (e) {
        console.error(e);
        document.getElementById('pedido').innerHTML = `
            <h2>Erro ao carregar pedido</h2>
            <p>${e.message}</p>
        `;
    }
}

carregarPedido();