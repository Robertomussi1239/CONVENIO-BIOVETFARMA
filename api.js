// api.js — versão atualizada com nova URL do Apps Script

const API_BASE = "https://script.google.com/macros/s/AKfycbyJ_NY1rffjHpjWJFKzGICymeUHj3zuJAqVatYSYbmT7AsceLpAp_oU3CgOGo7v_Hxb/exec";

// Função genérica de chamada à API
async function apiPost(action, payload = {}) {
  const user = firebase.auth().currentUser;
  const idToken = user ? await user.getIdToken() : null;

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // ESSENCIAL -> evita preflight no iOS/Safari
    body: JSON.stringify({
      action,
      Authorization: `Bearer ${idToken}`,
      ...payload
    })
  });

  const text = await res.text(); // pega texto cru primeiro (para debug)
  let json = {};
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error("Resposta não é JSON válido:", text);
  }

  if (!res.ok) {
    throw new Error(json.error || "Erro na API");
  }
  return json;
}

// ==== Chamadas específicas usadas no app ====

async function whoami() {
  return apiPost("whoami");
}

async function submitAprovacao(orcamento) {
  return apiPost("submitApproval", { orcamento });
}

async function getHistorico(tab) {
  return apiPost("getHistory", { tab });
}
