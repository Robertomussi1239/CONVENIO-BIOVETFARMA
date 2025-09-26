// app.js — controla navegação e autenticação Firebase + integração com api.js

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));
const show = (id, on = true) => {
  const el = qs(id);
  if (el) el.classList.toggle("hidden", !on);
};

// Navegação
function setActiveNav(name) {
  qsa(".nav .link").forEach(a => {
    const isActive = a.dataset.nav === name;
    a.classList.toggle("active", isActive);
    const pageId = "#page-" + a.dataset.nav;
    if (qs(pageId)) show(pageId, isActive);
  });
}

function bindNav() {
  qsa(".nav .link").forEach(a =>
    a.addEventListener("click", e => {
      e.preventDefault();
      setActiveNav(a.dataset.nav);
    })
  );
}

// Renderização da Home
async function renderHome(userInfo) {
  qs("#homeName").textContent = userInfo.nome || userInfo.email || "Funcionário";
  const lines = [
    `Email: ${userInfo.email}`,
    `Papel: ${userInfo.role || "funcionário"}`,
    `Aba na planilha: ${userInfo.aba || "(aguardando liberação)"}`
  ];
  qs("#profileBox").innerHTML = lines.map(l => `<div>${l}</div>`).join("");
}

// Renderização do Histórico
async function renderHistorico() {
  const { rows } = await getHistorico();
  const tbody = qs("#histTable tbody");
  tbody.innerHTML = "";
  (rows || []).forEach(r => {
    const tr = document.createElement("tr");
    let statusClass = "";
    if (r.autorizacao && r.autorizacao.toLowerCase().includes("aprovado")) statusClass = "green";
    else if (r.autorizacao && r.autorizacao.toLowerCase().includes("pendente")) statusClass = "orange";
    tr.innerHTML = `
      <td>${r.data || ""}</td>
      <td>${r.orcamento || ""}</td>
      <td>${r.valor || ""}</td>
      <td class="${statusClass}">${r.autorizacao || ""}</td>`;
    tbody.appendChild(tr);
  });
}

// ============================================================
// Autenticação e eventos
// ============================================================
function wireAuthUI() {
  const loginView = "#view-login";
  const signupView = "#view-signup";
  const appView = "#view-app";

  // Login
  qs("#btnLogin").onclick = async () => {
    const email = qs("#email").value.trim();
    const pass = qs("#password").value.trim();
    qs("#loginMsg").textContent = "Entrando...";
    try {
      await firebase.auth().signInWithEmailAndPassword(email, pass);
      qs("#loginMsg").textContent = "";
    } catch (err) {
      qs("#loginMsg").textContent = err.message;
    }
  };

  // Reset de senha
  qs("#linkReset").onclick = async (e) => {
    e.preventDefault();
    const email = qs("#email").value.trim();
    if (!email) {
      qs("#loginMsg").textContent = "Digite o email para recuperar a senha.";
      return;
    }
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      qs("#loginMsg").textContent = "Email de recuperação enviado.";
    } catch (err) {
      qs("#loginMsg").textContent = err.message;
    }
  };

  // Navegar para cadastro
  qs("#linkSignup").onclick = (e) => {
    e.preventDefault();
    show(loginView, false);
    show(signupView, true);
  };

  // Voltar para login
  qs("#btnBackToLogin").onclick = () => {
    show(signupView, false);
    show(loginView, true);
  };

  // Cadastro
  qs("#btnSignup").onclick = async () => {
    const name = qs("#signupName").value.trim();
    const email = qs("#signupEmail").value.trim();
    const pass = qs("#signupPassword").value.trim();
    qs("#signupMsg").textContent = "Criando conta...";
    try {
      const cred = await firebase.auth().createUserWithEmailAndPassword(email, pass);
      if (name) await cred.user.updateProfile({ displayName: name });
      qs("#signupMsg").textContent = "Conta criada. Faça login.";
    } catch (err) {
      qs("#signupMsg").textContent = err.message;
    }
  };

  // Logout
  qs("#linkLogout").onclick = () => firebase.auth().signOut();

  // Submeter compra
  qs("#btnSubmitCompra").onclick = async () => {
    const n = qs("#orcamento").value.trim();
    if (!n) {
      qs("#comprasMsg").textContent = "Digite o número do orçamento.";
      return;
    }
    qs("#comprasMsg").textContent = "Enviando...";
    try {
      const resp = await submitAprovacao(n);
      if (resp.success) {
        qs("#comprasMsg").textContent = "Solicitação enviada! Código: " + resp.codigo;
        qs("#orcamento").value = "";
        await renderHistorico();
        setActiveNav("historico");
      } else {
        qs("#comprasMsg").textContent = resp.error;
      }
    } catch (err) {
      qs("#comprasMsg").textContent = err.message;
    }
  };

  // Monitor de login/logout
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      show(appView, false);
      show(signupView, false);
      show(loginView, true);
      qs("#userBadge").textContent = "";
      return;
    }

    show(loginView, false);
    show(signupView, false);
    show(appView, true);
    qs("#userBadge").textContent = user.email;

    try {
      const me = await whoami();
      await renderHome(me);
      if (me.aba) {
        await renderHistorico();
      }
      bindNav();
      setActiveNav("home");
    } catch (err) {
      alert("Erro ao carregar dados: " + err.message);
    }
  });
}

// Inicia
wireAuthUI();
