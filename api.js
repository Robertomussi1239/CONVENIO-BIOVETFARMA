const BASE_URL = "https://script.google.com/macros/s/SEU_DEPLOY_ID/exec";

async function apiPost(action, payload) {
  const resp = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload })
  });
  return await resp.json();
}

// Cadastro automático no 1º login
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) return;
  const nome  = user.displayName || user.email.split("@")[0];
  const email = user.email;
  await apiPost("registrarFuncionario", { nome, email });
});

// Nova compra (sem valor)
async function enviarCompra(orcamento) {
  const user = firebase.auth().currentUser;
  if (!user) throw new Error("Usuário não logado");
  return await apiPost("novaCompra", { email: user.email, orcamento });
}

// Histórico
async function carregarHistorico() {
  const user = firebase.auth().currentUser;
  if (!user) return { historico: [] };
  return await apiPost("listarHistorico", { email: user.email });
}

