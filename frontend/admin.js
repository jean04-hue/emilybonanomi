/* Emily_Bonanomi 2.0 - Painel Admin (Fase 5)
   Core do painel: guard, sidebar, api wrapper, toast, money.
   Chaves isoladas do site público: eb_admin_token / eb_admin_user
   Reusa o mesmo endpoint /api/auth/login do backend existente.
*/

const API_BASE = (window.API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

// ============ STORAGE ============
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

// ============ GUARD ============
function guard() {
    const u = getUser();
    const t = getToken();
    // backend usa tipo_usuario; a spec fala em role. Aceita os dois.
    const role = u && (u.role || u.tipo_usuario);
    if (!t || !u || role !== 'admin') {
        location.replace('login.html');
        return false;
    }
    return true;
}

// ============ SIDEBAR ============
function sidebar(ativo) {
    const links = [
        { key: 'dashboard',   label: 'Dashboard',  href: 'dashboard.html' },
        { key: 'produtos',    label: 'Produtos',   href: 'produtos.html' },
        { key: 'categorias',  label: 'Categorias', href: 'categorias.html' },
        { key: 'estoque',     label: 'Estoque',    href: 'estoque.html' },
        { key: 'pedidos',     label: 'Pedidos',    href: 'pedidos.html' },
        { key: 'clientes',    label: 'Clientes',   href: 'clientes.html' },
        { key: 'avaliacoes',  label: 'Avaliações', href: 'avaliacoes.html' }
    ];
    const html = `
        <aside class="sidebar">
            <div class="brand">Emily Admin</div>
            <nav>
                ${links.map(l =>
                    `<a href="${l.href}" class="${l.key===ativo?'active':''}"><span>${l.label}</span></a>`
                ).join('')}
                <div class="logout">
                    <a href="#" onclick="logout();return false;"><span>Sair</span></a>
                </div>
            </nav>
        </aside>`;
    document.body.insertAdjacentHTML('afterbegin', html);
}

function logout() {
    clearSession();
    location.href = 'login.html';
}

// ============ API WRAPPER ============
async function api(path, opts = {}) {
    const headers = Object.assign({}, opts.headers || {});
    const t = getToken();
    if (t) headers['Authorization'] = 'Bearer ' + t;

    // Só adiciona Content-Type se não for FormData e tiver body
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
    // Envelope {success, data} → devolve data. Caso contrário, devolve tudo.
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) return data.data;
    return data;
}

// ============ TOAST ============
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

// ============ UTILS ============
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

// expor global
window.guard = guard;
window.sidebar = sidebar;
window.logout = logout;
window.api = api;
window.toast = toast;
window.money = money;
window.dateBR = dateBR;
window.qs = qs;
window.statusBadge = statusBadge;
window.getUser = getUser;
window.saveSession = saveSession;