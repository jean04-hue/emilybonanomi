const API = window.API_URL || 'http://localhost:3000/api';

const token =
localStorage.getItem(
'token'
);

if (!token) {


alert(
    'Faça login para continuar'
);

window.location.href =
    'login-cliente.html';

}

async function carregarEnderecos() {


try {

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

        container.innerHTML = `

            <div class="checkout-box">

                <h3>
                    Nenhum endereço cadastrado
                </h3>

                <p>
                    Cadastre um endereço para continuar.
                </p>

                <button
                    class="btn"
                    onclick="abrirModalEndereco()"
                >
                    Cadastrar Endereço
                </button>

            </div>

        `;

        return;

    }

    enderecos.forEach(
        endereco => {

            container.innerHTML += `

                <div class="checkout-box">

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

                        ${endereco.cidade}
                        -
                        ${endereco.estado}

                    </label>

                </div>

            `;

        }
    );

} catch (error) {

    console.error(error);

}


}

async function carregarResumo() {


try {

    const response =
        await fetch(
            `${API}/cart`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    const itens =
        await response.json();

    const resumo =
        document.getElementById(
            'resumoPedido'
        );

    let total = 0;

    itens.forEach(
        item => {

            total +=
                Number(item.preco) *
                Number(item.quantidade);

        }
    );

    resumo.innerHTML = `

        <div class="checkout-box">

            <h2>
                Resumo do Pedido
            </h2>

            <p>
                Itens:
                ${itens.length}
            </p>

            <p>
                Frete:
                Grátis
            </p>

            <h3>

                Total:

                R$ ${total.toFixed(2)}

            </h3>

        </div>

    `;

} catch (error) {

    console.error(error);

}


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

    try {

        const response =
            await fetch(
                `${API}/orders`,
                {
                    method:'POST',

                    headers:{
                        'Content-Type':
                            'application/json',

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:JSON.stringify({
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

            alert(
                data.erro
            );

            return;

        }

        localStorage.setItem(
            'pixAtual',
            JSON.stringify(data)
        );

        window.location.href =
            'pix.html';

    } catch (error) {

        console.error(error);

        alert(
            'Erro ao finalizar pedido'
        );

    }

}


);

function abrirModalEndereco() {


document
    .getElementById(
        'modalEndereco'
    )
    .style.display =
    'flex';


}

async function salvarEndereco() {


try {

    const body = {

        apelido:
            document.getElementById(
                'apelido'
            ).value,

        cep:
            document.getElementById(
                'cep'
            ).value,

        logradouro:
            document.getElementById(
                'logradouro'
            ).value,

        numero:
            document.getElementById(
                'numero'
            ).value,

        complemento:
            document.getElementById(
                'complemento'
            ).value,

        bairro:
            document.getElementById(
                'bairro'
            ).value,

        cidade:
            document.getElementById(
                'cidade'
            ).value,

        estado:
            document.getElementById(
                'estado'
            ).value,

        principal:true

    };

    const response =
        await fetch(
            `${API}/addresses`,
            {
                method:'POST',

                headers:{
                    'Content-Type':
                        'application/json',

                    Authorization:
                        `Bearer ${token}`
                },

                body:JSON.stringify(
                    body
                )
            }
        );

    const data =
        await response.json();

    if (data.erro) {

        alert(
            data.erro
        );

        return;

    }

    document
        .getElementById(
            'modalEndereco'
        )
        .style.display =
        'none';

    carregarEnderecos();

    alert(
        'Endereço cadastrado com sucesso!'
    );

} catch (error) {

    console.error(error);

    alert(
        'Erro ao salvar endereço'
    );

}


}

carregarEnderecos();
carregarResumo();
