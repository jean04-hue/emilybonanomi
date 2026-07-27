// Página do produto — galeria sincronizada por cor (estilo Zara) + vídeo
const params = new URLSearchParams(location.search);
const produtoId = params.get('id');
let produto = null;
let corSelecionada = null;
let tamanhoSelecionado = null;
let galeria = [];   // mídias filtradas pela cor atual
let idxGaleria = 0;

async function carregarProduto() {
  try { 
    produto = await api(`/products/${produtoId}`); 
  } catch (e) { 
    document.getElementById('produto').innerHTML = `<p>Erro: ${e.message}</p>`; 
    return; 
  }
  document.title = `${produto.nome} - Emily Bonanomi`;
  render();
  await carregarAvaliacoes(); // Agora vai funcionar porque a div existirá
}

function midiasProduto() {
  return produto.midias || produto.imagens || [];
}

function coresDisponiveis() {
  return [...new Set((produto.variacoes || []).map(v => v.cor).filter(Boolean))];
}

function midiasDaCor(cor) {
  const todas = midiasProduto();
  if (!cor) return todas;
  const daCor = todas.filter(m => (m.cor || null) === cor);
  const semCor = todas.filter(m => !m.cor);
  return daCor.length ? [...daCor, ...semCor] : todas;
}

function render() {
  const cores = coresDisponiveis();
  // CORREÇÃO: Mantém a cor já selecionada pelo usuário em vez de resetar para a primeira
  corSelecionada = corSelecionada || cores[0] || null;
  galeria = midiasDaCor(corSelecionada);

  const preco = Number(produto.preco);
  const promo = produto.preco_promocional ? Number(produto.preco_promocional) : null;
  const precoFinal = promo || preco;

  document.getElementById('produto').innerHTML = `
    <div class="produto-grid">
      <div class="galeria">
        <div class="galeria-principal" id="galPrincipal"></div>
        <div class="galeria-thumbs" id="galThumbs"></div>
      </div>
      <div class="produto-info">
        <div class="breadcrumb">Home / ${produto.categoria_nome || 'Produtos'} / ${produto.nome}</div>
        <h1>${produto.nome}</h1>
        <p class="produto-desc">${produto.descricao || ''}</p>
        <div class="produto-preco">
          ${promo ? `<span class="preco-antigo">R$ ${preco.toFixed(2).replace('.',',')}</span>` : ''}
          <span class="preco">R$ ${precoFinal.toFixed(2).replace('.',',')}</span>
        </div>
        <p class="parcela">Em até 6x de R$ ${(precoFinal/6).toFixed(2).replace('.',',')} sem juros</p>

        ${cores.length ? `
        <div class="bloco-cor">
          <strong>Cor: <span id="corLabel">${corSelecionada || ''}</span></strong>
          <div id="cores" class="opcoes-cor">
            ${cores.map(c => `<button class="btn-cor ${c===corSelecionada?'ativo':''}" data-cor="${c}">${c}</button>`).join('')}
          </div>
        </div>` : ''}

        <div id="areaTamanho" class="bloco-tamanho"></div>
        <div id="areaEstoque" class="area-estoque"></div>

        <div class="acoes-produto">
          <button id="btnAdd" class="btn btn-primary" disabled>Adicionar ao Carrinho</button>
          <button id="btnFav" class="btn btn-outline">♡ Favoritar</button>
        </div>
      </div>
    </div>
    <!-- FIX: Div de avaliações adicionada para evitar erro de elemento nulo -->
    <div id="avaliacoes"></div>`;

  renderGaleria();
  renderTamanhos();

  document.querySelectorAll('.btn-cor').forEach(b => {
    b.onclick = () => {
      corSelecionada = b.dataset.cor;
      document.querySelectorAll('.btn-cor').forEach(x => x.classList.remove('ativo'));
      b.classList.add('ativo');
      document.getElementById('corLabel').textContent = corSelecionada;
      
      // FIX: Zera o tamanho selecionado ao trocar de cor para evitar bugs de estoque
      tamanhoSelecionado = null; 
      galeria = midiasDaCor(corSelecionada);
      idxGaleria = 0;
      
      renderGaleria();
      renderTamanhos();
    };
  });

  document.getElementById('btnAdd').onclick = adicionar;
  document.getElementById('btnFav').onclick = favoritar;

  api('/favorites/' + produtoId + '/check')
    .then(fav => {
      if (fav.favorito) {
        const btn = document.getElementById('btnFav');
        btn.classList.add('ativo');
        btn.innerHTML = '♥ Favoritado';
      }
    })
    .catch(() => {});
}

function renderMidia(m) {
  if (!m) return '<div class="midia-vazia">Sem imagem</div>';
  if ((m.tipo || 'imagem') === 'video') {
    return `<video src="${m.url}" controls playsinline preload="metadata"></video>`;
  }
  return `<img src="${m.url}" alt="${produto.nome}" loading="lazy">`;
}

function renderGaleria() {
  const prin = document.getElementById('galPrincipal');
  const thumbs = document.getElementById('galThumbs');
  if (!galeria.length) {
    prin.innerHTML = '<div class="midia-vazia">Sem imagem</div>';
    thumbs.innerHTML = '';
    return;
  }
  prin.innerHTML = `
    ${renderMidia(galeria[idxGaleria])}
    ${galeria.length > 1 ? `
      <button class="gal-nav prev" aria-label="Anterior">❮</button>
      <button class="gal-nav next" aria-label="Próxima">❯</button>` : ''}
  `;
  thumbs.innerHTML = galeria.map((m,i) => `
    <button class="thumb ${i===idxGaleria?'ativo':''}" data-idx="${i}" aria-label="Mídia ${i+1}">
      ${(m.tipo||'imagem')==='video'
        ? `<span class="thumb-video">▶</span><img src="${m.url.replace('/video/upload/','/video/upload/so_0/').replace(/\.mp4$/,'.jpg')}" onerror="this.style.display='none'">`
        : `<img src="${m.url}" alt="">`}
    </button>`).join('');

  prin.querySelector('.prev')?.addEventListener('click', () => { idxGaleria = (idxGaleria - 1 + galeria.length) % galeria.length; renderGaleria(); });
  prin.querySelector('.next')?.addEventListener('click', () => { idxGaleria = (idxGaleria + 1) % galeria.length; renderGaleria(); });
  thumbs.querySelectorAll('.thumb').forEach(t => t.onclick = () => { idxGaleria = Number(t.dataset.idx); renderGaleria(); });
}

function renderTamanhos() {
  const tams = (produto.variacoes || []).filter(v => !corSelecionada || v.cor === corSelecionada);
  document.getElementById('areaTamanho').innerHTML = `
    <strong>Tamanho:</strong>
    <div class="opcoes-tamanho">
      ${tams.map(v => `
        <button class="btn-tam" data-id="${v.id}" data-tam="${v.tamanho}" data-est="${v.estoque}" ${v.estoque<=0?'disabled':''}>
          ${v.tamanho}${v.estoque<=0?' (esgotado)':''}
        </button>`).join('')}
    </div>`;

  document.querySelectorAll('.btn-tam').forEach(b => {
    b.onclick = () => {
      tamanhoSelecionado = { id: b.dataset.id, tamanho: b.dataset.tam, estoque: +b.dataset.est };
      document.querySelectorAll('.btn-tam').forEach(x => x.classList.remove('ativo'));
      b.classList.add('ativo');
      document.getElementById('areaEstoque').textContent = `${b.dataset.est} disponível(is)`;
      document.getElementById('btnAdd').disabled = false;
    };
  });

  document.getElementById('btnAdd').disabled = true;
  document.getElementById('areaEstoque').textContent = '';
}

async function adicionar() {
  if (!tamanhoSelecionado) return toast('Selecione um tamanho', 'erro');
  if (!window.gateLogin()) return;
  try {
    await api('/cart/add', { method:'POST', body: JSON.stringify({ variacaoId: Number(tamanhoSelecionado.id), quantidade: 1 }) });
    toast('Produto adicionado ao carrinho!');
    if (typeof atualizarBadgeCarrinho === 'function') atualizarBadgeCarrinho();
  } catch (e) { toast(e.message, 'erro'); }
}

async function favoritar() {
  if (!window.gateLogin()) return;
  const btn = document.getElementById('btnFav');
  try {
    const fav = await api('/favorites/' + produtoId + '/check');
    if (fav.favorito) {
      await api('/favorites/' + produtoId, { method: 'DELETE' });
      btn.classList.remove('ativo');
      btn.innerHTML = '♡ Favoritar';
      toast('Produto removido dos favoritos!');
    } else {
      await api('/favorites/' + produtoId, { method: 'POST' });
      btn.classList.add('ativo');
      btn.innerHTML = '♥ Favoritado';
      toast('Produto adicionado aos favoritos!');
    }
  } catch (e) { toast(e.message, 'erro'); }
}

async function carregarAvaliacoes() {
  try {
    const dados = await api(`/products/${produtoId}/reviews`);
    let podeAvaliar = false;
    let jaAvaliou = false;
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const r = await api(`/products/${produtoId}/can-review`);
        podeAvaliar = r.podeAvaliar;
        jaAvaliou = r.jaAvaliou;
      } catch (e) {
        console.error("Erro ao verificar permissão de avaliação:", e);
      }
    }

    const target = document.getElementById('avaliacoes');
    if (!target) return; 

    const mostrarFormulario = token && podeAvaliar && !jaAvaliou;

    // CORREÇÃO: Sintaxe limpa das condicionais em HTML e tratamento de mensagens
    target.innerHTML = `
      <section class="avaliacoes">
        <h2>Avaliações (${dados.resumo?.total || 0})</h2>
        <div style="margin-bottom:20px">⭐ ${Number(dados.resumo?.media || 0).toFixed(1)} / 5</div>
        
        <div class="bloco-formulario-avaliacao">
          ${!token ? `
            <div class="msg-avaliacao">Faça login para poder avaliar este produto.</div>
          ` : `
            ${!podeAvaliar && !jaAvaliou ? `
              <div class="msg-avaliacao">
                  Você precisa comprar este produto para poder avaliá-lo.
              </div>
            ` : ''}

            ${jaAvaliou ? `
              <div class="msg-avaliacao">
                  ✓ Você já avaliou este produto. Obrigado pelo seu feedback!
              </div>
            ` : ''}

            <div class="controles-avaliacao" style="${!mostrarFormulario ? 'display:none;' : ''}">
              <select id="nota">
                <option value="5">★★★★★</option>
                <option value="4">★★★★☆</option>
                <option value="3">★★★☆☆</option>
                <option value="2">★★☆☆☆</option>
                <option value="1">★☆☆☆☆</option>
              </select>

              <textarea id="comentario" placeholder="Conte sua experiência..."></textarea>

              <button id="btnEnviarAvaliacao" class="btn">Avaliar</button>
            </div>
          `}
        </div>

        <div class="lista-avaliacoes">
          ${(dados.itens || []).map(a => `
            <div class="card" style="margin:20px 0">
              <strong>${a.cliente}</strong>
              <div>${'⭐'.repeat(a.nota)}</div>
              <p>${a.comentario || ''}</p>
            </div>
          `).join('') || '<p>Nenhuma avaliação ainda.</p>'}
        </div>
      </section>`;

    // Atribuição segura do evento de clique se o botão estiver visível
    const btnEnviar = document.getElementById('btnEnviarAvaliacao');
    if (btnEnviar && mostrarFormulario) {
      btnEnviar.onclick = enviarAvaliacao;
    }

  } catch(e) {
    console.error(e);
  }
}

async function enviarAvaliacao() {
  try {
    const nota = document.getElementById('nota').value;
    const comentario = document.getElementById('comentario').value;

    await api(`/products/${produtoId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        nota: Number(nota),
        comentario: comentario
      })
    });
    toast('Avaliação enviada!');
    carregarAvaliacoes();
  } catch(e) {
    toast(e.message, 'erro');
  }
}

// Inicialização
carregarProduto();