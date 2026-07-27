// 4) Configuração do link da loja
const LOJA_URL = "http://127.0.0.1:5501";

// Captura o ID do produto diretamente da URL (?id=X)
const urlParams = new URLSearchParams(window.location.search);
const produtoId = urlParams.get('id');

if (!produtoId) {
    alert("Produto não encontrado.");
    window.location.href = "produtos.html";
}

// Função global para a troca rápida de imagem da galeria
window.trocarImagem = function(url, elemento) {
    document.getElementById("imagemPrincipal").src = url;
    
    // Remove classe ativa de todas as miniaturas e adiciona na clicada
    document.querySelectorAll(".miniaturas-wrapper img").forEach(img => img.classList.remove("ativa"));
    if(elemento) elemento.classList.add("ativa");
}

async function carregarDadosProduto() {
    try {
        // Executa as buscas em paralelo para melhor performance
        const [produto, reviews] = await Promise.all([
            api(`/products/${produtoId}`),
            api(`/products/${produtoId}/reviews`)
        ]);

        // Define o código do produto na barra do topo
        document.getElementById("codigoProduto").innerText = `ID do Produto: #${produto.id}`;

        // Configura o botão de ver no site de forma dinâmica
        const btnVerSite = document.getElementById("btnVerSite");
        btnVerSite.onclick = () => {
            window.open(`${LOJA_URL}/produto.html?id=${produto.id}`, "_blank");
        };

        // -------------------------------------------------------------
        // Renderizar Informações Principais
        // -------------------------------------------------------------
        const containerProduto = document.getElementById("produto");
        containerProduto.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h2 style="margin-top:0;">${produto.nome}</h2>
                    <p><strong>SKU Base:</strong> ${produto.sku || '—'}</p>
                    <p><strong>Slug:</strong> ${produto.slug || '—'}</p>
                    <p><strong>Categoria:</strong> ${produto.categoria_nome || '—'}</p>
                    <p><strong>Status:</strong> ${produto.ativo ? '<span class="badge badge-green">Ativo</span>' : '<span class="badge badge-gray">Inativo</span>'}</p>
                    <p><strong>Destaque:</strong> ${produto.destaque ? '<span class="badge badge-blue">Sim</span>' : 'Não'}</p>
                </div>
                <div>
                    <p><strong>Preço:</strong> ${money(produto.preco)}</p>
                    <p><strong>Preço Promocional:</strong> ${produto.preco_promocional ? money(produto.preco_promocional) : '—'}</p>
                    <p><strong>Descrição:</strong><br>${produto.descricao || 'Sem descrição.'}</p>
                </div>
            </div>
        `;

        // -------------------------------------------------------------
        // 1) Galeria de Imagens com Miniaturas Interativas
        // -------------------------------------------------------------
        const imgPrincipal = document.getElementById("imagemPrincipal");
        const containerGaleria = document.getElementById("galeria");
        containerGaleria.innerHTML = "";

        if (produto.imagens && produto.imagens.length > 0) {
            // Define a primeira imagem como padrão inicial
            imgPrincipal.src = produto.imagens[0].url;

            // Alimenta as miniaturas clicáveis
            produto.imagens.forEach((img, index) => {
                const classeAtiva = index === 0 ? 'class="ativa"' : '';
                containerGaleria.innerHTML += `
                    <img src="${img.url}" ${classeAtiva} onclick="trocarImagem('${img.url}', this)" alt="Miniatura">
                `;
            });
        } else {
            // Fallback caso o produto não possua imagens cadastradas
            imgPrincipal.src = "https://via.placeholder.com/300x350?text=Sem+Imagem";
            containerGaleria.innerHTML = "<p style='color:#777;'>Nenhuma miniatura disponível.</p>";
        }

        // -------------------------------------------------------------
        // 2) Tabela de Variações Dinâmica
        // -------------------------------------------------------------
        const tbodyVariacoes = document.getElementById("variacoes");
        tbodyVariacoes.innerHTML = "";

        if (produto.variacoes && produto.variacoes.length > 0) {
            produto.variacoes.forEach(v => {
                tbodyVariacoes.innerHTML += `
                    <tr>
                        <td><strong>${v.sku || '—'}</strong></td>
                        <td>${v.cor || '—'}</td>
                        <td>${v.tamanho || '—'}</td>
                        <td>
                            ${v.estoque > 0 
                                ? `<span class="badge badge-green">${v.estoque} un</span>` 
                                : `<span class="badge badge-red">Esgotado</span>`
                            }
                        </td>
                    </tr>
                `;
            });
        } else {
            tbodyVariacoes.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#777;">Este produto não possui variações registradas.</td></tr>`;
        }

        // -------------------------------------------------------------
        // 3) Avaliações completas estruturadas com Estrelas
        // -------------------------------------------------------------
        const containerMedia = document.getElementById("media");
        const containerAvaliacoes = document.getElementById("avaliacoes");
        
        containerAvaliacoes.innerHTML = "";

        if (reviews && reviews.itens && reviews.itens.length > 0) {
            // Renderiza o cabeçalho de média
            const mediaNota = parseFloat(reviews.resumo.media).toFixed(1);
            const estrelasMedia = "★".repeat(Math.round(mediaNota)) + "☆".repeat(5 - Math.round(mediaNota));
            
            containerMedia.innerHTML = `
                <span style="color:#f4b400; font-size: 22px;">${estrelasMedia}</span> 
                <span>${mediaNota} de 5</span> 
                <span style="font-weight: normal; color: #666; font-size: 0.9rem;">(${reviews.resumo.total} avaliações)</span>
            `;

            // Loop para renderizar cada card de avaliação dos clientes
            reviews.itens.forEach(r => {
                const estrelasFixas = "★".repeat(r.nota) + "☆".repeat(5 - r.nota);
                const dataFormatada = new Date(r.created_at).toLocaleDateString("pt-BR", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                containerAvaliacoes.innerHTML += `
                    <div class="card-avaliacao">
                        <h4>${r.cliente}</h4>
                        <div class="estrelas">${estrelasFixas}</div>
                        <span class="data-avaliacao">Avaliado em ${dataFormatada}</span>
                        <p class="comentario-texto">"${r.comentario || 'Sem comentários informados.'}"</p>
                    </div>
                `;
            });
        } else {
            containerMedia.innerHTML = "";
            containerAvaliacoes.innerHTML = "<p style='color:#777;'>Este produto ainda não recebeu nenhuma avaliação.</p>";
        }

        // -------------------------------------------------------------
        // 4) Scroll Suave se a URL contiver a hashtag #card-avaliacoes
        // -------------------------------------------------------------
        if (window.location.hash === '#card-avaliacoes') {
            setTimeout(() => {
                const cardAvaliacoes = document.getElementById('card-avaliacoes');
                if (cardAvaliacoes) {
                    cardAvaliacoes.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300); // Aguarda a renderização dos dados para rolar a tela
        }

    } catch (erro) {
        console.error("Erro ao carregar os dados da página:", erro);
        document.getElementById("produto").innerText = "Ocorreu um erro ao carregar os dados do produto.";
        document.getElementById("avaliacoes").innerText = "Não foi possível carregar as avaliações.";
    }
}

// Dispara a carga assim que o arquivo é lido pelo navegador
carregarDadosProduto();