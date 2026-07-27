/* ============================================================
   partials.js — cabeçalho, rodapé, topbar e busca globais
   Injeta HTML compartilhado em qualquer página que tenha:
     <div id="eb-topbar"></div>
     <div id="eb-header"></div>
     <div id="eb-footer"></div>
   Também: menu auto-ativo, dropdown de busca, badge do carrinho.
   ============================================================ */
(function () {
  const API = window.API_URL || 'http://localhost:3000/api';

  const topbarHTML = `
    <div class="topbar">
      <div>Frete grátis acima de R$199,90</div>
      <div>Parcele em até 6x sem juros</div>
    </div>`;

  const headerHTML = `
    <header class="header">
      <button class="menu-mobile-btn" id="menuMobileBtn" aria-label="Abrir menu" aria-expanded="false">☰</button>
      <nav class="menu" data-menu id="menuPrincipal">
        <a href="index.html" data-path="index.html">Início</a>
        <a href="index.html#produtos" data-path="index.html#produtos">Produtos</a>
        <a href="index.html?categoria=novidades" data-path="novidades">Novidades</a>
        <a href="favoritos.html" data-path="favoritos.html">Favoritos</a>
        <a href="minha-conta.html" data-path="minha-conta.html">Minha conta</a>
      </nav>
      <div class="logo"><a href="index.html">Emily <span>Bonanomi</span></a></div>
      <div class="acoes">
        <div class="busca-wrap">
          <button class="acao-btn" id="btnBusca" title="Buscar" aria-label="Buscar">🔍</button>
          <div class="busca-dropdown" id="buscaDropdown" hidden>
            <input type="search" id="buscaGlobalInput" placeholder="O que você procura?" autocomplete="off" aria-label="Buscar produtos">
            <div class="busca-resultados" id="buscaResultados"></div>
          </div>
        </div>
        <a href="favoritos.html" class="acao-btn" title="Favoritos" aria-label="Favoritos">♡</a>
        <a href="minha-conta.html" class="acao-btn" title="Minha conta" aria-label="Minha conta">👤</a>
        <a href="carrinho.html" class="acao-btn" title="Carrinho" aria-label="Carrinho">🛒<span id="contadorCarrinho" class="carrinho-badge" aria-live="polite">0</span></a>
      </div>
    </header>`;

  const footerHTML = `
    <section class="beneficios-bar">
      <div class="item">🚚<strong>Frete grátis</strong>acima de R$199,90</div>
      <div class="item">🔄<strong>Troca fácil</strong>até 7 dias</div>
      <div class="item">💬<strong>Atendimento</strong>Seg a Sex 9h-18h</div>
      <div class="item">🔒<strong>Compra segura</strong>Dados protegidos</div>
    </section>
    <footer class="footer footer-4col">
      <div class="col">
        <h3>Emily Bonanomi</h3>
        <p>Moda com elegância e personalidade.</p>
        <div class="social" aria-label="Redes sociais">📷 💬 📘</div>
      </div>
      <div class="col">
        <h4>Institucional</h4>
        <a href="institucional.html#sobre">Sobre nós</a>
        <a href="institucional.html#historia">Nossa história</a>
        <a href="institucional.html#contato">Contato</a>
      </div>
      <div class="col">
        <h4>Ajuda</h4>
        <a href="meus-pedidos.html">Meus pedidos</a>
        <a href="institucional.html#trocas">Trocas e devoluções</a>
        <a href="institucional.html#pagamento">Formas de pagamento</a>
      </div>
      <div class="col">
        <h4>Fique por dentro</h4>
        <p>Receba novidades e promoções.</p>
        <form class="newsletter" id="newsletterForm">
          <label for="newsletterEmail" class="sr-only">E-mail</label>
          <input id="newsletterEmail" type="email" required placeholder="Seu e-mail">
          <button type="submit">OK</button>
        </form>
      </div>
      <div class="footer-copy">© ${new Date().getFullYear()} Emily Bonanomi — Todos os direitos reservados.</div>
    </footer>`;

  function ativarMenu() {
    const page = location.pathname.split('/').pop() || 'index.html';
    const cat = new URLSearchParams(location.search).get('categoria');
    document.querySelectorAll('[data-menu] a').forEach(a => {
      const p = a.dataset.path;
      let ativo = false;
      if (p === 'novidades' && cat === 'novidades') ativo = true;
      else if (p === page) ativo = true;
      else if (p === 'index.html' && page === '' ) ativo = true;
      if (ativo) a.classList.add('ativo');
    });
  }

  function ativarBusca() {
    const btn = document.getElementById('btnBusca');
    const dd  = document.getElementById('buscaDropdown');
    const inp = document.getElementById('buscaGlobalInput');
    const res = document.getElementById('buscaResultados');
    if (!btn || !dd) return;

    btn.addEventListener('click', () => {
      dd.hidden = !dd.hidden;
      if (!dd.hidden) inp.focus();
    });
    document.addEventListener('click', e => {
      if (!dd.contains(e.target) && e.target !== btn) dd.hidden = true;
    });

    let timer;
    inp.addEventListener('input', () => {
      clearTimeout(timer);
      const q = inp.value.trim();
      if (q.length < 2) { res.innerHTML = ''; return; }
      timer = setTimeout(async () => {
        try {
          const r = await fetch(`${API}/products?busca=${encodeURIComponent(q)}`);
          const lista = await r.json();
          res.innerHTML = (lista.slice(0,6)).map(p => `
            <a class="busca-item" href="produto.html?id=${p.id}">
              <img src="${p.imagem || 'https://via.placeholder.com/60x60'}" alt="${p.nome}" loading="lazy" width="60" height="60">

              <div>
                <div class="nome">${p.nome}</div>
                <div class="preco">R$ ${Number(p.preco).toFixed(2).replace('.',',')}</div>
              </div>
            </a>`).join('') || '<p class="vazio">Nenhum produto encontrado.</p>';
        } catch(_) { res.innerHTML = '<p class="vazio">Erro na busca.</p>'; }
      }, 250);
    });
  }

  function ativarMenuMobile() {
    const btn = document.getElementById('menuMobileBtn');
    const menu = document.getElementById('menuPrincipal');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
      const aberto = menu.classList.toggle('aberto');
      btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
  }

  function ativarNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof window.toast === 'function') window.toast('Obrigada por se inscrever!', 'ok');
      form.reset();
    });
  }

  function inject() {
    const t = document.getElementById('eb-topbar');
    const h = document.getElementById('eb-header');
    const f = document.getElementById('eb-footer');
    if (t) t.outerHTML = topbarHTML;
    if (h) h.outerHTML = headerHTML;
    if (f) f.outerHTML = footerHTML;
    ativarMenu();
    ativarBusca();
    ativarMenuMobile();
    ativarNewsletter();
    if (typeof window.atualizarBadgeCarrinho === 'function') window.atualizarBadgeCarrinho();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
