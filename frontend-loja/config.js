const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');

if (usuarioLogado.senha_temporaria && !window.location.pathname.includes('alterar-senha.html')) {
    window.location.href = 'alterar-senha.html';
}

// Configuração global do frontend
window.API_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'https://emily-bonanomi-api.onrender.com/api';
window.api = async function(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(window.API_URL + path, { ...opts, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
    return data;
};

// Redireciona para o login guardando a URL de origem
window.exigirLogin = function() {
    if (!localStorage.getItem('token')) {
        const redirect = location.pathname + location.search;
        location.href = 'login-cliente.html?redirect=' + encodeURIComponent(redirect);
        return false;
    }
    return true;
};

// Gate leve: dispara login sem sair da página caso não tenha token (para botões)
window.gateLogin = function() {
    if (localStorage.getItem('token')) return true;
    const redirect = location.pathname + location.search;
    location.href = 'login-cliente.html?redirect=' + encodeURIComponent(redirect);
    return false;
};

// Badge do carrinho
window.atualizarBadgeCarrinho = async function() {
    const el = document.getElementById('contadorCarrinho');
    if (!el) return;
    if (!localStorage.getItem('token')) { el.textContent = '0'; return; }
    try {
        const itens = await window.api('/cart');
        const total = itens.reduce((s, i) => s + Number(i.quantidade || 0), 0);
        el.textContent = total;
    } catch (_) { el.textContent = '0'; }
};

// Toast simples
window.toast = function(msg, tipo = 'ok') {
    let el = document.getElementById('eb-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'eb-toast';
        document.body.appendChild(el);
    }
    el.className = 'eb-toast ' + tipo + ' show';
    el.textContent = msg;
    clearTimeout(window._tt);
    window._tt = setTimeout(() => el.classList.remove('show'), 3000);
};

document.addEventListener('DOMContentLoaded', () => window.atualizarBadgeCarrinho());
