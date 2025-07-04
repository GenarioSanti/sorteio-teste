

let checks = { check1: false, check2: false };
let dadosUsuario = {};
let numeroEscolhido = null;

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g,'');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10));
}

function irParaRegras() {
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const instagram = document.getElementById("instagram").value.trim();
  const cpf = document.getElementById("cpf").value.trim();

  if (!nome || !telefone || !instagram || !cpf) {
    return;
  }

  if (!validarCPF(cpf)) {
    return;
  }

  firebase.database().ref("usuarios").once("value", snapshot => {
    const dados = snapshot.val() || {};
    for (let key in dados) {
      const user = dados[key];
      if (user.cpf === cpf || user.telefone === telefone || user.instagram === instagram) {
        return;
      }
    }

    dadosUsuario = { nome, telefone, instagram, cpf };

    document.getElementById("form-screen").classList.remove("active");
    document.getElementById("regras-screen").classList.add("active");
  });
}

function seguir(url, checkId) {
  window.open(url, "_blank");
  const span = document.getElementById(checkId);
  span.innerText = "⏳";
  setTimeout(() => {
    const botao = document.getElementById(checkId.replace('check', 'botao'));
    if (botao) {
      botao.style.backgroundColor = '#00c853';
      botao.textContent = 'Seguido ✔️';
    }
    span.innerText = "✅";
    checks[checkId] = true;
    verificarChecks();
  }, 5000);
}

function verificarChecks() {
  if (checks.check1 && checks.check2) {
    document.getElementById("continuarBtn").disabled = false;
  }
}

function irParaNumeros() {
  document.getElementById("regras-screen").classList.remove("active");
  document.getElementById("numero-screen").classList.add("active");
  carregarNumeros();
}

function carregarNumeros() {
  const container = document.getElementById("numeros");
  container.innerHTML = "";
  firebase.database().ref("usuarios").once("value", snapshot => {
    const dados = snapshot.val() || {};
    for (let i = 1; i <= 100; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.className = "numero";
      btn.onclick = () => selecionarNumero(i, btn);
      if (Object.values(dados).some(user => user.numero === i)) {
        btn.disabled = true;
        btn.classList.add("selecionado");
      }
      container.appendChild(btn);
    }
  });
}

function selecionarNumero(numero, botao) {
  if (numeroEscolhido !== null) return; // só um número
  numeroEscolhido = numero;
  botao.disabled = true;
  botao.classList.add("selecionado");

  const finalizarBtn = document.createElement("button");
  finalizarBtn.innerText = "Finalizar Participação";
  finalizarBtn.onclick = finalizarCadastro;
  finalizarBtn.className = "finalizar";
  document.getElementById("numero-screen").appendChild(finalizarBtn);
}

function finalizarCadastro() {
  try {
    dadosUsuario.numero = numeroEscolhido;
    const finalizarBtn = document.querySelector(".finalizar");
    if (finalizarBtn) finalizarBtn.disabled = true;

    firebase.database().ref("usuarios/" + dadosUsuario.cpf).set(dadosUsuario)
      .then(() => {
        const tela = document.getElementById("numero-screen");
        tela.innerHTML = `
          <h2>Parabéns!</h2>
          <p>Você está participando com o número <strong>${numeroEscolhido}</strong>.</p>
          <p>Boa sorte! 🍀</p>
        `;
      })
      .catch(error => {
        console.error("Erro Firebase:", error);
        if (finalizarBtn) finalizarBtn.disabled = false;
      });
  } catch (err) {
    console.error("Erro inesperado:", err);
  }
}

function mostrarConfirmacao() {
  document.getElementById("confirmacao-container").style.display = "block";
  document.getElementById("continuarBtn").style.display = "none";
}

function confirmarCompartilhamento() {
  irParaNumeros();
}

function mostrarAjuda() {
  const ajuda = document.getElementById("ajuda-container");
  if (ajuda) {
    ajuda.style.display = ajuda.style.display === "none" ? "block" : "none";
  }
}


// === Validações e máscaras ===

// Máscara de telefone
function formatarTelefone(input) {
  input.addEventListener("input", function (e) {
    let x = input.value.replace(/\D/g, "").slice(0, 11);
    if (x.length >= 2) {
      x = "(" + x.slice(0, 2) + ") " + x.slice(2);
    }
    if (x.length >= 10) {
      x = x.slice(0, 10) + "-" + x.slice(10);
    }
    input.value = x;
  });
}

// Máscara de CPF
function formatarCPF(input) {
  input.addEventListener("input", function () {
    let cpf = input.value.replace(/\D/g, "").slice(0, 11);
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d{1,2})/, "$1-$2");
    input.value = cpf;
  });
}

// Validador de CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10));
}

// Validador de Instagram
function validarInstagram(insta) {
  return /^@[a-z0-9_.]+$/.test(insta);
}

// Atualizador de contador de números
function atualizarContador(totalDisponiveis) {
  const contador = document.getElementById("contador-numeros");
  if (contador) {
    contador.textContent = `Restam ${totalDisponiveis} números`;
  }
}

// Exemplo de chamada para atualizar contador
// atualizarContador(87);


// Máscara para telefone
document.getElementById("telefone").addEventListener("input", function (e) {
    let x = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = x;
    if (x.length >= 2) formatted = `(${x.slice(0, 2)}) `;
    if (x.length >= 7) formatted += `${x.slice(2, 7)}-${x.slice(7)}`;
    else if (x.length > 2) formatted += x.slice(2);
    e.target.value = formatted;
});

// Máscara e validação para CPF
document.getElementById("cpf").addEventListener("input", function (e) {
    let x = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = "";
    if (x.length > 0) formatted = x.slice(0, 3);
    if (x.length >= 4) formatted += "." + x.slice(3, 6);
    if (x.length >= 7) formatted += "." + x.slice(6, 9);
    if (x.length >= 10) formatted += "-" + x.slice(9, 11);
    e.target.value = formatted;
});

// CPF válido
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.charAt(10));
}

// Validação ao avançar
document.querySelector("button").addEventListener("click", function (e) {
    const cpfInput = document.getElementById("cpf").value;
    if (!validarCPF(cpfInput)) {
        e.preventDefault();
    }
});



// Validação do campo Instagram
const instagramInput = document.getElementById("instagram");
instagramInput.addEventListener("input", function () {
  let value = instagramInput.value;

  // Remove espaços e força minúsculas
  value = value.replace(/\s+/g, "").toLowerCase();

  // Garante que o valor comece com @
  if (!value.startsWith("@")) {
    value = "@" + value.replace(/^@+/, "");
  }

  // Validação básica
  const regex = /^@[a-z0-9_.]+$/;
  if (!regex.test(value)) {
    instagramInput.setCustomValidity("Use apenas letras minúsculas, números, ponto ou underline, sem espaços.");
  } else {
    instagramInput.setCustomValidity("");
  }

  instagramInput.value = value;
});


// Função para simular clique no botão seguir com delay de 5 segundos
function seguirPerfil(botaoId) {
  const botao = document.getElementById(botaoId);
  botao.disabled = true;
  botao.textContent = "Aguarde...";

  setTimeout(() => {
    botao.style.backgroundColor = "green";
    botao.textContent = "Seguido ✔️";
    botao.disabled = false;

    // Libera o botão PRÓXIMO automaticamente após 5 segundos
    const botaoProximo = document.getElementById("botaoProximo");
    if (botaoProximo) {
      botaoProximo.disabled = false;
    }
  }, 5000);
}



document.getElementById("telefone").addEventListener("input", function(e) {
  const valor = e.target.value;
  const apenasNumeros = valor.replace(/\D/g, "");
  if (valor !== apenasNumeros) {
  }
  e.target.value = apenasNumeros;
});

document.getElementById("cpf").addEventListener("input", function(e) {
  const valor = e.target.value;
  const apenasNumeros = valor.replace(/\D/g, "");
  if (valor !== apenasNumeros) {
  }
  e.target.value = apenasNumeros;
});




// BLOQUEIOS

document.getElementById("telefone").addEventListener("input", function(e) {
  e.target.value = e.target.value.replace(/\D/g, "");
});

document.getElementById("cpf").addEventListener("input", function(e) {
  e.target.value = e.target.value.replace(/\D/g, "");
});