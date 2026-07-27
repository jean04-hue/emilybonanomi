const API =
    'http://localhost:3000/api';

const token =
    localStorage.getItem('token');

async function carregarEnderecos() {

    const response =
        await fetch(
            `${API}/addresses`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    const enderecos =
        await response.json();

    const container =
        document.getElementById(
            'enderecos'
        );

    container.innerHTML = '';

    if (!enderecos.length) {

        container.innerHTML =
            '<p>Nenhum endereço cadastrado.</p>';

        return;

    }

    enderecos.forEach(
        endereco => {

            container.innerHTML += `
                <div style="
                    border:1px solid #ccc;
                    padding:10px;
                    margin-bottom:10px;
                ">
                    <label>

                        <input
                            type="radio"
                            name="endereco"
                            value="${endereco.id}"
                            ${endereco.principal ? 'checked' : ''}
                        >

                        <strong>
                            ${endereco.apelido}
                        </strong>

                        <br>

                        ${endereco.logradouro},
                        ${endereco.numero}

                        <br>

                        ${endereco.bairro}

                        <br>

                        ${endereco.cidade} -
                        ${endereco.estado}

                    </label>
                </div>
            `;

        }
    );

}

document
.getElementById(
    'btnFinalizar'
)
.addEventListener(
    'click',
    async () => {

        const enderecoSelecionado =
            document.querySelector(
                'input[name="endereco"]:checked'
            );

        if (!enderecoSelecionado) {

            alert(
                'Selecione um endereço'
            );

            return;

        }

        const response =
            await fetch(
                `${API}/orders`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            enderecoId:
                                Number(
                                    enderecoSelecionado.value
                                )
                        })
                }
            );

        const data =
            await response.json();

        if (data.erro) {

            alert(data.erro);

            return;

        }

        mostrarPix(data);

    }
);

function mostrarPix(data) {

    const resultado =
        document.getElementById(
            'resultadoPix'
        );

    resultado.innerHTML = `
        <h2>PIX Gerado</h2>

        <p>
            Pedido:
            <strong>
                ${data.pedido.codigo_pedido}
            </strong>
        </p>

        <p>
            Total:
            <strong>
                R$ ${Number(
                    data.pedido.total
                ).toFixed(2)}
            </strong>
        </p>

        <img
            src="data:image/png;base64,${data.pagamento.qrCodeBase64}"
            width="250"
        >

        <br><br>

        <textarea
            id="pixCode"
            rows="6"
            cols="70"
        >${data.pagamento.qrCode}</textarea>

        <br><br>

        <button
            onclick="copiarPix()"
        >
            Copiar código PIX
        </button>
    `;

}

function copiarPix() {

    const campo =
        document.getElementById(
            'pixCode'
        );

    campo.select();

    document.execCommand(
        'copy'
    );

    alert(
        'Código PIX copiado!'
    );

}

carregarEnderecos();