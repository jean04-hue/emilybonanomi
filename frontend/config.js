window.API_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'https://SEU-BACKEND.onrender.com/api';

window.api = async function(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(window.API_URL + path, { ...opts, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.erro || 'Erro');
    return data;
};

window.exigirAdmin = function() {
    const token = localStorage.getItem('token');
    const tipo = localStorage.getItem('tipo_usuario');
    if (!token || tipo !== 'admin') { location.href = 'login.html'; return false; }
    return true;
};
