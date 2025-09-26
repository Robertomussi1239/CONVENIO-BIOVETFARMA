// ======== Funções utilitárias ========
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));
const show = (id, on = true) => {
  const el = qs(id);
  if (!el) return;
  el.classList.toggle("hidden", !on);
};
const setActiveNav = (name) => {
  qsa(".nav .link").forEach((a) => {
    const isActive = a.dataset.nav === name;
    a.classList.toggle("active", isActive);
    const pageId = "#page-" + a.dataset.nav;
    if (qs(pageId)) show(pageId, isActive);
  });
};

// ======== Navegação ========
function bindNav() {
  qsa(".nav .link").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveNav(a.dataset.nav);
    })
  );
}

// ======== Renderização das Páginas ========
async function renderHome(userInfo) {
  qs("#homeName").textContent = userInfo.nome || userInfo.email || "Funcionário";

  const pending = !userInfo.aba || userInfo.aba.trim() === "";
  const lines = [
    `Email: ${userInfo.email}`,
    `Papel: ${userInfo.role}`,
    `Aba na planilha: ${userInfo.aba || "(aguardando liberação pelo administrador)"}`
  ];
  qs("#profileBox").innerHTML = lines.map((l) => `<div>${l}</div>`).join("");

  // esconde menus até liberar aba
  qsa(".nav .link").forEach((a) => {
    if (["compras", "historico"].includes(a.dataset.nav)) {
      a.classList.toggle("hidden", pending);
    }
  });
  if (pending) setActiveNav("home");
}

async function renderHistorico(tab) {
  const { rows } = await getHistorico(tab);
  const tbody = qs("#histTable tbody");
  tbody.innerHTML = "";

  (rows || []).forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.data || ""}</td>
                    <td>${r.orcamento || ""}</td>
                    <td>${r.valor || ""}</td>
                    <td>${r.autorizacao || ""}</td>`;
    tbody.appendChild(tr);
  });
}

async function renderAdminDash(state) {
  const { employees } = await whoami();
  if (!employees || employees.length === 0) {
    qs("#adminHistTable tbody").innerHTML =
      "<tr><td colspan=4>Sem funcionários mapeados.</td></tr>";
    return;
  }

  state.empList = employees;
  state.idx = 0;

  async function load() {
    const emp = state.empList[state.idx];
    qs("#adminEmployeeName").textContent = `${emp.nome} (${emp.aba})`;

    const { rows } = await getHistorico(emp.aba);
    const tbody = qs("#adminHistTable tbody");
    tbody.innerHTML = "";
    (rows || []).forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${r.data || ""}</td>
                      <td>${r.orcamento || ""}</td>
                      <td>${r.valor || ""}</td>
                      <td>${r.autorizacao || ""}</td>`;
      tbody.appendChild(tr);
    });
  }

  qs("#btnPrevEmp").onclick = () => {
    state.idx = (state.idx - 1 + state.empList.length) % state.empList.length;
    load();
  };
  qs("#btnNextEmp").onclick = () => {
    state.idx = (state.idx + 1) % state.empList.length;
    load();
  };
  await load();
}

// ======== Autenticação e UI ========
function wireAuthUI() {
  const loginView = "#view-login";
  const signupView = "#view-signup";
  const appView = "#view-app";

  // login
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

  // reset senha
  qs("#linkReset").onclick = async (e) => {
    e.preventDefault();
    const email = qs("#email").value.trim();
    if (!email) {
      qs("#loginMsg").textContent = "Digite o email para redefinição.";
      return;
    }
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      qs("#loginMsg").textContent = "Link enviado para seu email.";
    } catch (err) {
      qs("#loginMsg").textContent = err.message;
    }
  };

  // tela criar conta
  qs("#linkSignup").onclick = (e) => {
    e.preventDefault();
    show(loginView, false);
    show(signupView, true);
  };
  qs("#btnBackToLogin").onclick = () => {
    show(signupView, false);
    show(loginView, true);
  };
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

  // logout
  qs("#linkLogout").onclick = () => firebase.auth().signOut();

  // submissão de compra
  qs("#btnSubmitCompra").onclick = async () => {
    const n = qs("#orcamento").value.trim();
    if (!n) {
      qs("#comprasMsg").textContent = "Informe o número do orçamento.";
      return;
    }
    qs("#comprasMsg").textContent = "Enviando...";
    try {
      await submitAprovacao(n);
      qs("#comprasMsg").textContent = "Enviado ao administrador.";
      qs("#orcamento").value = "";
    } catch (err) {
      qs("#comprasMsg").textContent = err.message;
    }
  };

  // monitorar sessão
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

    bindNav();
    setActiveNav("home");

    try {
      const me = await whoami();

      // habilita admin
      const adminLink = qsa(".nav .link").find((a) => a.dataset.nav === "admin");
      adminLink.classList.toggle("hidden", me.role !== "admin");

      // renderiza home/histórico/dashboard
      await renderHome(me);
      if (me.aba) await renderHistorico(me.aba);
      if (me.role === "admin") await renderAdminDash({});
    } catch (err) {
      alert(err.message);
    }
  });
}

wireAuthUI();

