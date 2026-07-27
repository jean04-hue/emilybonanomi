const API =
'http://localhost:3000/api';

const token =
localStorage.getItem('token');

async function carregarPedidos() {

const response =
    await fetch(
        `${API}/orders`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

const pedidos =
    await response.json();

const container =
    document.getElementById(
        'pedidos'
    );

container.innerHTML = '';

if (!pedidos.length) {

    container.innerHTML =
        '<p>Você ainda não possui pedidos.</p>';

    return;

}

pedidos.forEach(
    pedido => {

        container.innerHTML += `
            <div
                style="
                    border:1px solid #ccc;
                    padding:15px;
                    margin-bottom:15px;
                "
            >

                <h3>
                    ${pedido.codigo_pedido}
                </h3>

                <p>
                    Status:
                    <strong>
                        ${pedido.status}
                    </strong>
                </p>

                <p>
                    Pagamento:
                    <strong>
                        ${pedido.status_pagamento}
                    </strong>
                </p>

                <p>
                    Total:
                    <strong>
                        R$ ${Number(
                            pedido.total
                        ).toFixed(2)}
                    </strong>
                </p>

                <button
                    onclick="verDetalhes(${pedido.id})"
                >
                    Ver Detalhes
                </button>

                ${
                    pedido.status ===
                    'aguardando_pagamento'
                    ?
                    `
                    <button
                        onclick="cancelarPedido(${pedido.id})"
                    >
                        Cancelar Pedido
                    </button>
                    `
                    :
                    ''
                }

            </div>
        `;

    }
);

}

function verDetalhes(
pedidoId
) {

window.location.href =
    `pedido.html?id=${pedidoId}`;

}

async function cancelarPedido(
pedidoId
) {

const confirmar =
    confirm(
        'Deseja cancelar este pedido?'
    );

if (!confirmar)
    return;

const response =
    await fetch(
        `${API}/orders/${pedidoId}/cancel`,
        {
            method: 'PATCH',

            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

const data =
    await response.json();

alert(
    data.mensagem ||
    data.erro
);

carregarPedidos();


}

carregarPedidos();
