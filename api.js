// api.js — apontando para a NOVA URL do Apps Script

const API_BASE = "https://script.google.com/macros/s/AKfycbzKjMitdqHzEWb8BUGx0VSLiOHuJMQmkbEDYd_BT9oFj5JjxJHfRiGvGjVG3XbjXcMm/exec";

/**
 * Envia requisição POST para o backend do Apps Script
 */
async function apiPost(action, payload = {}) {
  const user = firebase.auth().currentUser;
  const idToken = user ? await user.getIdToken() : null;

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // evita CORS preflight
    body: JSON.stringify({ action, Authorization: `Bearer ${idToken}`, ...payload })
  });

  const text = await res.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error("Resposta não JSON:", text);
  }
  if (!res.ok) throw new Error(json.error || "Erro na API");
  return json;
}

/**
 * Funções de alto nível chamadas pelo app.js
 */
async function whoami() {
  return apiPost("whoami");
}

async function submitAprovacao(orcamento) {
  return apiPost("submitApproval", { orcamento });
}

async function getHistorico(tab) {
  return apiPost("getHistory", { tab });
}
