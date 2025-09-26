// app.js — controla navegação e telas do PWA

let currentUser = null;

// elementos
const nav = document.querySelector(".nav");
const content = document.getElementById("content");

// ============================================================
// Inicialização do Firebase
// ============================================================
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    renderApp();
  } else {
    renderLogin();
  }
});

// ============================================================
// Renderização
// ============================================================
function renderLogin() {
  nav.innerHTML = "";
  content.innerHTML = `
    <div class="card center">
      <h2>Entrar</h2>
      <input id="email" type="email" placeholder="Email" />
      <input id="senha" type="password" placeholder="Senha" />
      <button class="btn" onclick="login()">Entrar</button>
      <p class="small">
        <a href="#" onclick="register()">Criar conta</a>
      </p>
    </div>
  `;
}

async function renderApp() {
  try {
    const me = await whoami();
    currentUser.info = me;

    // menu
    nav.innerHTML = `
      <a href="#" class="link active" onclick="showPage('home')">Home</a>
      <a href="#" class="link" onclick="showPage('compras')">Compras</a>
      <a href="#" class="link" onclick="showPage('historico')">Histórico</a>
      <a href="#" class="link" onclick="logout()">Sair</a>
    `;

    showPage("home");
  } catch (err) {
    console.error("Erro renderApp", err);
    alert("Erro ao carregar dados do usuário.");
  }
}

function setActive(page) {
  document.querySelectorAll(".nav .link").forEach(a => a.classList.remove("active"));
  const link = [...document.querySelectorAll(".nav .link")].find(a => a.textContent === page);
  if (link) link.classList.add("active");
}

// ============================================================
// Páginas
// ============================================================
function showPage(page) {
  setActive(page === "home" ? "Home" : page.charAt(0).toUpperCase() + page.slice(1));

  if (page === "home") return renderHome();
  if (page === "compras") return renderCompras();
  if (page === "historico") return renderHistorico();
}

// Home
function renderHome() {
  const me = currentUser.info || {};
  content.innerHTML = `
    <div class="card">
      <h2>Olá, ${me.nome || "Funcionário"} 👋</h2>
      <p>Aqui você vê seus dados cadastrais e navega entre Compras e Histórico.</p>
      <div class="notice">
        <p><b>Seus dados</b></p>
        <p>Email: ${me.email || "-"}</p>
        <p>Papel: ${me.role || "-"}</p>
        <p>Aba na planilha: ${me.aba || "(aguardando liberação)"}</p>
      </div>
    </div>
  `;
}

// Compras
function renderCompras() {
  content.innerHTML = `
    <div class="card">
      <h2>Nova Compra</h2>
      <div class="input">
        <label>Nº Orçamento</label>
        <input id="orcamento" placeholder="Digite o nº do orçamento" />
      </div>
      <button class="btn" onclick="enviarCompra()">Enviar</button>
    </div>
  `;
}

async function enviarCompra() {
  const orc = document.getElementById("orcamento").value.trim();
  if (!orc) return alert("Digite o nº do orçamento.");
  try {
    const res = await submitAprovacao(orc);
    if (res.success) {
      alert(`Solicitação enviada com código ${res.codigo}`);
      showPage("historico");
    } else {
      alert("Erro: " + res.error);
    }
  } catch (err) {
    alert("Falha: " + err.message);
  }
}

// Histórico
async function renderHistorico() {
  content.innerHTML = `<div class="card"><p>Carregando histórico...</p></div>`;
  try {
    const res = await getHistorico();
    if (!res.success) throw new Error(res.error);

    let html = `
      <div class="card">
        <h2>Histórico de Compras</h2>
        <table class="table">
          <tr>
            <th>Data</th>
            <th>Orçamento</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
    `;

    res.rows.forEach(r => {
      let statusClass = "muted";
      if (r.autorizacao && r.autorizacao.includes("Aprovado")) statusClass = "green";
      else if (r.autorizacao && r.autorizacao.includes("Pendente")) statusClass = "orange";

      html += `
        <tr>
          <td>${r.data || ""}</td>
          <td>${r.orcamento || ""}</td>
          <td>${r.valor || ""}</td>
          <td class="${statusClass}">${r.autorizacao || ""}</td>
        </tr>
      `;
    });

    html += `</table></div>`;
    content.innerHTML = html;
  } catch (err) {
    content.innerHTML = `<div class="card">Erro: ${err.message}</div>`;
  }
}

// ============================================================
// Autenticação Firebase
// ============================================================
async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  try {
    await firebase.auth().signInWithEmailAndPassword(email, senha);
  } catch (err) {
    alert("Erro no login: " + err.message);
  }
}

async function register() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, senha);
    alert("Conta criada com sucesso. Agora faça login.");
  } catch (err) {
    alert("Erro no cadastro: " + err.message);
  }
}

async function logout() {
  await firebase.auth().signOut();
}
