// Login + Cadastro em abas com suporte a senha temporária
const redirectTo = new URLSearchParams(location.search).get('redirect') || 'index.html';

const tabEntrar = document.querySelector('[data-tab="entrar"]');
const tabCadastrar = document.querySelector('[data-tab="cadastrar"]');
const formEntrar = document.getElementById('formEntrar');
const formCadastrar = document.getElementById('formCadastrar');

// Função centralizada para alternar abas
function alternarAba(aba) {
  if (aba === 'entrar') {
    tabEntrar.classList.add('ativo');
    tabCadastrar.classList.remove('ativo');
    formEntrar.removeAttribute('hidden');
    formCadastrar.setAttribute('hidden', 'true');
  } else {
    tabCadastrar.classList.add('ativo');
    tabEntrar.classList.remove('ativo');
    formCadastrar.removeAttribute('hidden');
    formEntrar.setAttribute('hidden', 'true');
  }
}

tabEntrar.addEventListener('click', () => alternarAba('entrar'));
tabCadastrar.addEventListener('click', () => alternarAba('cadastrar'));

// SUBMIT DO LOGIN
formEntrar.addEventListener('submit', async e => {
  e.preventDefault();
  const btnSubmit = e.target.querySelector('button[type="submit"]');
  const textoOriginal = btnSubmit.innerText;

  try {
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Entrando...';

    const fd = Object.fromEntries(new FormData(e.target));
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(fd) });

    if (!data.token) throw new Error(data.erro || 'Falha no login');

    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario || {}));

    // SE A SENHA FOR TEMPORÁRIA: Redireciona obrigatoriamente para troca de senha
    if (data.usuario && data.usuario.senha_temporaria) {
      toast('Atenção: Você precisa cadastrar uma nova senha!', 'alerta');
      setTimeout(() => location.href = 'alterar-senha.html', 500);
      return;
    }

    toast('Bem-vinda de volta!');
    setTimeout(() => location.href = redirectTo, 400);

  } catch (err) {
    toast(err.message, 'erro');
    btnSubmit.disabled = false;
    btnSubmit.innerText = textoOriginal;
  }
});

// SUBMIT DO CADASTRO
formCadastrar.addEventListener('submit', async e => {
  e.preventDefault();
  const btnSubmit = e.target.querySelector('button[type="submit"]');
  const textoOriginal = btnSubmit.innerText;

  try {
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Criando conta...';

    const fd = Object.fromEntries(new FormData(e.target));
    const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(fd) });

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario || {}));
      toast('Conta criada com sucesso!');
      setTimeout(() => location.href = redirectTo, 400);
    } else {
      toast('Cadastro realizado! Por favor, faça login.', 'ok');
      alternarAba('entrar');
      btnSubmit.disabled = false;
      btnSubmit.innerText = textoOriginal;
    }
  } catch (err) {
    toast(err.message, 'erro');
    btnSubmit.disabled = false;
    btnSubmit.innerText = textoOriginal;
  }
});

const modalForgot =
document.getElementById(
'modalForgotPassword'
);

document
.getElementById(
'btnForgotPassword'
)
.onclick=e=>{

e.preventDefault();

modalForgot.classList.add(
'show'
);

};

document
.getElementById(
'fecharModalForgot'
)
.onclick=()=>{

modalForgot.classList.remove(
'show'
);

};

modalForgot.onclick=e=>{

if(e.target===modalForgot){

modalForgot.classList.remove(
'show'
);

}

};

document
.getElementById(
'formForgotPassword'
)
.onsubmit=
async e=>{

e.preventDefault();

const email=

document
.getElementById(
'emailForgot'
)
.value;

try{

await api(

'/auth/forgot-password',

{

method:'POST',

body:JSON.stringify({

email

})

}

);

toast(

'Se existir uma conta para este e-mail, enviaremos as instruções.'

);

modalForgot.classList.remove(

'show'

);

}catch(err){

toast(

err.message,

'erro'

);

}

};