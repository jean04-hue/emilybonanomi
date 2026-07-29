/* Emily_Bonanomi 2.0 - Core & Template Engine do Painel Admin */

const API_BASE = (window.API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

// ============ STORAGE & AUTH ============
const TOKEN_KEY = 'eb_admin_token';
const USER_KEY  = 'eb_admin_user';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function getUser()  { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } }
function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

function guard() {
    const u = getUser();
    const t = getToken();
    const role = u && (u.role || u.tipo_usuario);
    if (!t || !u || role !== 'admin') {
        location.replace('login.html');
        return false;
    }
    return true;
}

function logout() {
    clearSession();
    location.href = 'login.html';
}

// ============ TEMPLATE ENGINE CENTRALIZADO ============
function renderLayout(options = {}) {
    if (!guard()) return;

    const activeKey = options.active || '';
    const title     = options.title || 'Painel Admin';
    const subtitle  = options.subtitle || '';
    const actions   = options.actions || ''; // Botões no topo (ex: "+ Novo Produto")

    // Links sem ícones/figurinhas
    const links = [
        { key: 'dashboard',   label: 'Dashboard',  href: 'dashboard.html' },
        { key: 'produtos',    label: 'Produtos',   href: 'produtos.html' },
        { key: 'categorias',  label: 'Categorias', href: 'categorias.html' },
        { key: 'estoque',     label: 'Estoque',    href: 'estoque.html' },
        { key: 'pedidos',     label: 'Pedidos',    href: 'pedidos.html' },
        { key: 'clientes',    label: 'Clientes',   href: 'clientes.html' },
        { key: 'avaliacoes',  label: 'Avaliações', href: 'avaliacoes.html' }
    ];

    // Guarda o conteúdo HTML original escrito dentro da página
    const pageContent = document.body.innerHTML;

    const user = getUser();
    const userName = user?.nome || 'Admin';

    // Monta o Layout Mestre sem <span class="nav-icon">
    const fullLayout = `
        <div id="sidebar-overlay" class="sidebar-overlay"></div>
        <button id="menu-toggle" class="menu-toggle" aria-label="Abrir menu">☰</button>

        <aside class="sidebar">
            <div class="brand">Emily Admin</div>
            <nav>
                ${links.map(l => `
                    <a href="${l.href}" class="${l.key === activeKey ? 'active' : ''}">
                        <span>${l.label}</span>
                    </a>
                `).join('')}
                <div class="logout">
                    <a href="#" onclick="logout(); return false;">
                        <span>Sair</span>
                    </a>
                </div>
            </nav>
        </aside>

        <main class="main">
            <header class="topbar">
                <div>
                    <h1>${title}</h1>
                    ${subtitle ? `<div class="sub-greeting">${subtitle}</div>` : ''}
                </div>
                <div class="topbar-actions">
                    ${actions}
                    <div class="user-badge">Olá, <strong>${userName}</strong></div>
                </div>
            </header>

            <section class="page-body">
                ${pageContent}
            </section>
        </main>
    `;

    // Injeta o novo layout estruturado
    document.body.innerHTML = fullLayout;

    // Inicializa manipuladores do Menu Mobile
    initMobileMenu();
}

function initMobileMenu() {
    const menuBtn = document.getElementById("menu-toggle");
    const sidebarEl = document.querySelector(".sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    function toggleMenu() {
        if (!sidebarEl) return;
        const isOpen = sidebarEl.classList.toggle("open");
        if (overlay) overlay.classList.toggle("show", isOpen);
        document.body.classList.toggle("menu-open", isOpen);
    }

    function closeMenu() {
        if (!sidebarEl) return;
        sidebarEl.classList.remove("open");
        if (overlay) overlay.classList.remove("show");
        document.body.classList.remove("menu-open");
    }

    if (menuBtn) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (overlay) overlay.addEventListener("click", closeMenu);

    document.addEventListener("click", (e) => {
        if (
            window.innerWidth <= 768 &&
            sidebarEl && sidebarEl.classList.contains("open") &&
            !sidebarEl.contains(e.target) &&
            e.target !== menuBtn
        ) {
            closeMenu();
        }
    });
}

// ============ API WRAPPER ============
async function api(path, opts = {}) {
    const headers = Object.assign({}, opts.headers || {});
    const t = getToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;

    if (opts.body && !(opts.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
        if (typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
    }

    const url = path.startsWith('http') ? path : (API_BASE + path);
    const res = await fetch(url, Object.assign({}, opts, { headers }));

    let data = null;
    const text = await res.text();
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

    if (res.status === 401) {
        toast('Sessão expirada. Faça login novamente.', 'error');
        setTimeout(() => { clearSession(); location.href = 'login.html'; }, 800);
        throw new Error('Não autorizado');
    }
    if (!res.ok) {
        const msg = (data && (data.error || data.erro || data.message)) || `Erro ${res.status}`;
        toast(msg, 'error');
        throw new Error(msg);
    }
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) return data.data;
    return data;
}

// ============ UTILS ============
function toast(msg, tipo = 'success') {
    let box = document.querySelector('.toast-container');
    if (!box) {
        box = document.createElement('div');
        box.className = 'toast-container';
        document.body.appendChild(box);
    }
    const el = document.createElement('div');
    el.className = 'toast ' + (tipo === 'error' ? 'error' : tipo === 'warning' ? 'warning' : '');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3200);
}

function money(n) {
    const v = Number(n || 0);
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dateBR(s) {
    if (!s) return '-';
    const d = new Date(s);
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function qs(k) { return new URLSearchParams(location.search).get(k); }

function statusBadge(status) {
    const map = {
        aguardando_pagamento: ['Aguardando Pagamento', 'badge-beige'],
        pago:                 ['Pago',                 'badge-green'],
        separando:            ['Separando',            'badge-blue'],
        enviado:              ['Enviado',              'badge-blue'],
        entregue:             ['Entregue',             'badge-green'],
        cancelado:            ['Cancelado',            'badge-red'],
        devolvido:            ['Devolvido',            'badge-red'],
        devolucao_solicitada: ['Devolução Solicitada', 'badge-beige'],
        devolucao_aprovada:   ['Devolução Aprovada',   'badge-green'],
        devolucao_recusada:   ['Devolução Recusada',   'badge-red']
    };
    const [txt, cls] = map[status] || [status || '-', 'badge-gray'];
    return `<span class="badge ${cls}">${txt}</span>`;
}

// Exposição Global
window.guard = guard;
window.renderLayout = renderLayout;
window.logout = logout;
window.api = api;
window.toast = toast;
window.money = money;
window.dateBR = dateBR;
window.qs = qs;
window.statusBadge = statusBadge;
window.getUser = getUser;
window.saveSession = saveSession;