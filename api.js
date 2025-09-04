// api.js — apontando para a NOVA URL do Apps Script

const API_BASE = "https://script.google.com/macros/s/AKfycbw2qlBF3jipHnWe2Qs1JpQsq8yhZCR7cT122FwMOHLnoiaXx8MnJv3AY-ZWaeKAlR8bAg/exec";

async function apiPost(action, payload = {}) {
  const user = firebase.auth().currentUser;
  const idToken = user ? await user.getIdToken() : null;

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // mantém text/plain para evitar preflight
    body: JSON.stringify({ action, Authorization: `Bearer ${idToken}`, ...payload })
  });

  const text = await res.text();
  let json = {};
  try { json = JSON.parse(text); } catch (e) { console.error("Resposta não JSON:", text); }
  if (!res.ok) throw new Error(json.error || "Erro na API");
  return json;
}

async function whoami(){ return apiPost("whoami"); }
async function submitAprovacao(orcamento){ return apiPost("submitApproval", { orcamento }); }
async function getHistorico(tab){ return apiPost("getHistory", { tab }); }
