const API = window.API_URL || 'http://localhost:3000/api';

const HERO_FALLBACK = {
  geral:      { categoria:'Coleção Exclusiva', titulo:'Estilo que<br>te representa', descricao:'Peças selecionadas com carinho para cada momento seu.', imagem:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200' },
  vestidos:   { categoria:'Vestidos',          titulo:'Vestidos para<br>todas as ocasiões', descricao:'Modelos elegantes para destacar sua personalidade.', imagem:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200' },
  blusas:     { categoria:'Blusas',            titulo:'Blusas que<br>combinam com você', descricao:'Conforto e elegância para o dia a dia.', imagem:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200' },
  calcas:     { categoria:'Calças',            titulo:'Caimento<br>perfeito', descricao:'Modelos modernos para qualquer ocasião.', imagem:'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200' },
  acessorios: { categoria:'Acessórios',        titulo:'Os detalhes<br>fazem diferença', descricao:'Complete sua produção.', imagem:'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200' },
  novidades:  { categoria:'Novidades',         titulo:'Acabou de<br>chegar', descricao:'As novidades da coleção, fresquinhas pra você.', imagem:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200' }
};

let categoriaAtual = null;
let produtosCache = [];
let favoritos = new Set();

async function carregarFavoritos() {
  if (!localStorage.getItem('token')) return;
  try {
    const favs = await window.api('/favorites');
    favoritos = new Set(favs.map(f => Number(f.produto_id || f.id)));
  } catch(_) {}
}

async function carregarCategorias() {
  try {
    const r = await fetch(`${API}/products/categories`);
    const cats = await r.json();
    document.getElementById('listaCategorias').innerHTML =
      `<a href="index.html" class="categoria-card ${!categoriaAtual?'categoria-ativa':''}">Todos</a>` +
      cats.map(c => `<a href="index.html?categoria=${c.slug}" class="categoria-card ${c.slug===categoriaAtual?'categoria-ativa':''}">${c.nome}</a>`).join('');
  } catch(_) {
    document.getElementById('listaCategorias').innerHTML = '';
  }
}

// Imagens de UM produto para o carrossel do card
function imagensDoProduto(p) {
  const midias = (p.imagens || p.midias || []).filter(m => (m.tipo || 'imagem') === 'imagem');
  if (midias.length) return midias.map(m => m.url);
  if (p.imagem) return [p.imagem];
  return ['https://via.placeholder.com/400x500?text=Emily+Bonanomi'];
}

function cardProduto(p) {
  const imgs = imagensDoProduto(p);
  const preco = Number(p.preco || 0);
  const parcela = (preco/6).toFixed(2).replace('.',',');
  const isFav = favoritos.has(Number(p.id));
  const multi = imgs.length > 1;
  return `
    <article class="produto-card" data-id="${p.id}" data-count="${imgs.length}">
      <button class="fav-btn ${isFav?'ativo':''}" data-id="${p.id}" title="Favoritar" aria-label="Favoritar">${isFav?'♥':'♡'}</button>
      <a href="produto.html?id=${p.id}" class="img-wrap">
        <div class="carousel">
          ${imgs.map((u,i)=>`<img class="slide ${i===0?'ativo':''}" data-idx="${i}" src="${u}" alt="${p.nome}" loading="lazy">`).join('')}
        </div>
        ${multi ? `
          <button class="nav prev" data-dir="-1" aria-label="Imagem anterior">❮</button>
          <button class="nav next" data-dir="1"  aria-label="Próxima imagem">❯</button>
          <div class="dots">${imgs.map((_,i)=>`<span class="dot ${i===0?'ativo':''}" data-idx="${i}"></span>`).join('')}</div>
        ` : ''}
      </a>
      <div class="info">
        <h3>${p.nome}</h3>
        <div class="preco">R$ ${preco.toFixed(2).replace('.',',')}</div>
        <div class="parcela">6x de R$ ${parcela}</div>
        <a href="produto.html?id=${p.id}" class="btn">Ver Produto</a>
      </div>
    </article>`;
}

function ativarCards() {
  document.querySelectorAll('.produto-card').forEach(card => {
    const slides = card.querySelectorAll('.slide');
    const dots = card.querySelectorAll('.dot');
    const count = slides.length;
    if (!count) return;
    let idx = 0;

    function go(n) {
      slides[idx].classList.remove('ativo');
      dots[idx]?.classList.remove('ativo');
      idx = (n + count) % count;
      slides[idx].classList.add('ativo');
      dots[idx]?.classList.add('ativo');
    }

    card.querySelectorAll('.nav').forEach(b => b.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      go(idx + Number(b.dataset.dir));
    }));
    card.querySelectorAll('.dot').forEach(d => d.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      go(Number(d.dataset.idx));
    }));

    // Hover-swap para 2ª imagem após 500ms
    if (count > 1) {
      let hoverTimer;
      card.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => { if (idx === 0) go(1); }, 500);
      });
      card.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        if (idx !== 0) go(0);
      });
    }
  });

  document.querySelectorAll('.fav-btn').forEach(b => b.onclick = e => toggleFav(e, b));
}

function renderProdutos(lista) {
  const cont = document.getElementById('produtos');
  cont.innerHTML = lista.length ? lista.map(cardProduto).join('')
    : '<p style="grid-column:1/-1;text-align:center;color:#888;padding:40px">Nenhum produto encontrado.</p>';
  ativarCards();
}

async function toggleFav(e, btn) {
  e.preventDefault();
  e.stopPropagation();

  if (!window.gateLogin()) return;

  const id = Number(btn.dataset.id);

  try {
    if (favoritos.has(id)) {
      await window.api('/favorites/' + id, {
        method: 'DELETE'
      });

      favoritos.delete(id);
      btn.classList.remove('ativo');
      btn.textContent = '♡';

      window.toast('Produto removido dos favoritos!', 'ok');

    } else {
      await window.api('/favorites/' + id, {
        method: 'POST'
      });

      favoritos.add(id);
      btn.classList.add('ativo');
      btn.textContent = '♥';

      window.toast('Produto adicionado aos favoritos!', 'ok');
    }
  } catch (err) {
    window.toast(err.message, 'erro');
  }
}

async function carregarProdutos() {
  const cont = document.getElementById('produtos');
  if (cont) cont.innerHTML = Array.from({length:8}).map(()=>'<div class="skeleton-card"><div class="sk sk-img"></div><div class="sk sk-line"></div><div class="sk sk-line curta"></div></div>').join('');
  try {
    let url = `${API}/products`;
    if (categoriaAtual && categoriaAtual !== 'novidades') url += `?categoria=${categoriaAtual}`;
    const r = await fetch(url);
    produtosCache = await r.json();
  } catch(_) { produtosCache = []; }
  filtrarOrdenar();
}

function filtrarOrdenar() {
  const busca = (document.getElementById('buscaProduto')?.value || '').toLowerCase();
  const ord = document.getElementById('ordenacao')?.value;
  let lista = produtosCache.filter(p => !busca || p.nome.toLowerCase().includes(busca));
  if (ord === 'menor') lista.sort((a,b)=>a.preco-b.preco);
  if (ord === 'maior') lista.sort((a,b)=>b.preco-a.preco);
  if (ord === 'az')    lista.sort((a,b)=>a.nome.localeCompare(b.nome));
  if (ord === 'za')    lista.sort((a,b)=>b.nome.localeCompare(a.nome));
  renderProdutos(lista);
}

async function atualizarHero() {
  // 1) Tenta vitrine: produto marcado como destaque no admin
  try {
    const r = await fetch(`${API}/products/destaque`);
    if (r.ok) {
      const d = await r.json();
      if (d && d.id) {
        document.getElementById('heroCategoria').textContent = d.categoria_nome || 'Destaque';
        document.getElementById('heroTitulo').innerHTML = d.nome;
        document.getElementById('heroDescricao').textContent = (d.descricao || '').slice(0,140);
        document.getElementById('heroImagem').src = d.imagem || HERO_FALLBACK.geral.imagem;
        const btn = document.querySelector('.hero .btn');
        if (btn) btn.setAttribute('href', `produto.html?id=${d.id}`);
        return;
      }
    }
  } catch(_) {}

  // 2) Fallback por categoria selecionada
  const dados = HERO_FALLBACK[categoriaAtual] || HERO_FALLBACK.geral;
  document.getElementById('heroCategoria').textContent = dados.categoria;
  document.getElementById('heroTitulo').innerHTML = dados.titulo;
  document.getElementById('heroDescricao').textContent = dados.descricao;
  document.getElementById('heroImagem').src = dados.imagem;
}

async function init() {
  const params = new URLSearchParams(location.search);
  categoriaAtual = params.get('categoria');
  atualizarHero();
  await carregarFavoritos();
  await carregarCategorias();
  await carregarProdutos();
  document.getElementById('buscaProduto')?.addEventListener('input', filtrarOrdenar);
  document.getElementById('ordenacao')?.addEventListener('change', filtrarOrdenar);
}
init();
