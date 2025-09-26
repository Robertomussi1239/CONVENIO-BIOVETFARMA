// api.js — integra PWA com Google Apps Script

// URL do WebApp publicado no Apps Script
const API_BASE = "https://script.google.com/macros/s/AKfycbzKjMitdqHzEWb8BUGx0VSLiOHuJMQmkbEDYd_BT9oFj5JjxJHfRiGvGjVG3XbjXcMm/exec";

/**
 * Faz POST para o Apps Script com token do Firebase
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
  if (!res.ok) throw new Error(json.error || "Erro na API");
  return json;
}

/**
 * Quem sou eu (dados do funcionário)
 */
async function whoami() {
  return apiPost("whoami");
}

/**
 * Submeter solicitação de compra
 */
async function submitAprovacao(orcamento) {
  return apiPost("submitApproval", { orcamento });
}

/**
 * Buscar histórico
 */
async function getHistorico() {
  return apiPost("getHistory");
}
