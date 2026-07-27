const API = window.API_URL || 'http://localhost:3000/api';
const token = localStorage.getItem('token');

let pollingId = null;
let timerId = null;

if (!token) {
    window.location.href = 'login-cliente.html';
}

const dados = JSON.parse(localStorage.getItem('pixAtual') || 'null');
const container = document.getElementById('pix');

if (!dados || !dados.pedido || !dados.pagamento) {
    container.innerHTML = `
        <h1>Nenhum pagamento em andamento</h1>
        <p>Volte ao carrinho e finalize seu pedido.</p>
        <a class="pix-btn" href="carrinho.html">Voltar ao carrinho</a>
    `;
} else {
    renderPix();
}

function renderPix() {
    const pedido = dados.pedido;
    const pag    = dados.pagamento;

    container.innerHTML = `
        <h1>Pagamento via PIX</h1>
        <p class="pix-info">Pedido: <strong>${pedido.codigo_pedido}</strong></p>
        <p class="pix-info">Valor: <strong>R$ ${Number(pedido.total).toFixed(2).replace('.',',')}</strong></p>

        <div class="pix-timer" id="pixTimer">15:00</div>
        <p class="pix-info">Tempo restante para pagamento</p>

        <img class="pix-qrcode" src="data:image/png;base64,${pag.qrCodeBase64}" alt="QR Code PIX">

        <textarea id="pixCode" class="pix-code" readonly>${pag.qrCode}</textarea>
        <br>
        <button class="pix-btn" onclick="copiarPix(this)">
    Copiar código PIX
</button>
        <button class="pix-btn sec" onclick="location.href='meus-pedidos.html'">Meus pedidos</button>

        <div class="pix-loading">

    <div id="pixSpinner" class="spinner"></div>

    <div id="loadingText" class="loading-text">
        Aguardando confirmação do pagamento...
    </div>

    <div class="loading-subtitle">
        Não feche esta página.<br>
        Estamos verificando automaticamente o pagamento.
    </div>

</div>

<div id="pixStatus" class="pix-status pending">
    Aguardando pagamento...
</div>
    `;

    iniciarContador(15 * 60);
    iniciarPolling(pedido.id);
}

async function copiarPix(btn) {

    const el = document.getElementById('pixCode');

    try {
        await navigator.clipboard.writeText(el.value);
    } catch {
        el.select();
        document.execCommand('copy');
    }

    const original = btn.textContent;

    btn.textContent = "✅ Código copiado!";

    setTimeout(() => {
        btn.textContent = original;
    }, 2000);
}


function iniciarContador(segundos) {
    const el = document.getElementById('pixTimer');
    function tick() {
        const m = String(Math.floor(segundos / 60)).padStart(2,'0');
        const s = String(segundos % 60).padStart(2,'0');
        el.textContent = `${m}:${s}`;
        if (segundos <= 60) el.classList.add('warn');
        if (segundos <= 0) {
            clearInterval(timerId);

const spinner = document.getElementById('pixSpinner');
const loadingText = document.getElementById('loadingText');
const status = document.getElementById('pixStatus');

if (spinner) spinner.style.display = 'none';

if (loadingText) {
    loadingText.innerHTML = "⏰ PIX expirado.";
    loadingText.style.color = "#c0392b";
}

if (status) {
    status.className = "pix-status rejected";
    status.innerHTML = "Gere um novo pagamento para continuar.";
}

el.textContent = "Expirado";

return;
        }
        segundos--;
    }
    if (timerId) {
    clearInterval(timerId);
}

tick();
timerId = setInterval(tick, 1000);
}


function iniciarPolling(pedidoId) {
    async function checar() {
        try {
            const r = await fetch(`${API}/payments/${pedidoId}/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await r.json();
            atualizarStatus(data.status);
            if (data.status === 'approved') {
                clearInterval(pollingId);
                clearInterval(timerId);
                localStorage.removeItem('pixAtual');
                setTimeout(() => { window.location.href = 'meus-pedidos.html'; }, 3000);
            } else if (['rejected','cancelled','refunded'].includes(data.status)) {
                clearInterval(pollingId);
            }
        } catch (e) {
            console.error('[polling]', e);
        }
    }
    if (pollingId) {
    clearInterval(pollingId);
}

checar();
pollingId = setInterval(checar, 5000);
}

function atualizarStatus(status) {

    const box = document.getElementById('pixStatus');
    const spinner = document.getElementById('pixSpinner');
    const loadingText = document.getElementById('loadingText');

    if (!box) return;

    box.classList.remove('pending', 'approved', 'rejected');

    if (status === 'approved') {

        box.classList.add('approved');

        if (spinner) {
            spinner.style.display = 'none';
        }

        if (loadingText) {
            loadingText.innerHTML = `
                ✅ <strong>Pagamento aprovado!</strong><br>
                Redirecionando...
            `;
            loadingText.style.color = '#1e6b1e';
        }

        box.innerHTML = `
            Pagamento confirmado com sucesso.
        `;

    }
    else if (['rejected','cancelled','refunded'].includes(status)) {

        box.classList.add('rejected');

        if (spinner) {
            spinner.style.display = 'none';
        }

        if (loadingText) {
            loadingText.innerHTML = `
                ❌ Pagamento não concluído.
            `;
            loadingText.style.color = '#c0392b';
        }

        box.innerHTML = `
            Tente gerar um novo pagamento.
        `;

    }
    else {

        box.classList.add('pending');

        if (spinner) {
            spinner.style.display = 'block';
        }

        if (loadingText) {
            loadingText.innerHTML =
                'Aguardando confirmação do pagamento...';
            loadingText.style.color = '#444';
        }

        box.innerHTML = `
            Aguardando pagamento...
        `;
    }
}
