// api.js — já com o endpoint correto do Apps Script

const API_BASE = "https://script.google.com/macros/s/AKfycbzKjMitdqHzEWb8BUGx0VSLiOHuJMQmkbEDYd_BT9oFj5JjxJHfRiGvGjVG3XbjXcMm/exec";

/**
 * Chama o Apps Script via POST
 * @param {string} action Ação que queremos que o backend faça
 * @param {Object} payload Dados extras (por exemplo: orcamento)
 */
async function apiPost(action, payload = {}) {
  const user = firebase.auth().currentUser;
  const idToken = user ? await user.getIdToken() : null;

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action, Authorization: `Bearer ${idToken}`, ...payload })
  });

  const text = await res.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error("Resposta não JSON:", text);
  }

  if (!res.ok) {
    throw new Error(json.error || "Erro na API");
  }
  return json;
}

// Interfaces de uso no frontend:

/** retorna dados do usuário (nome, email, aba, role) */
async function whoami() {
  return apiPost("whoami");
}

/** envia nova compra/orçamento (sem valor) */
async function submitAprovacao(orcamento) {
  return apiPost("submitApproval", { orcamento });
}

/** obtém histórico de compras do usuário */
async function getHistorico() {
  return apiPost("getHistory");
}

