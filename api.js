const API_BASE = "https://script.google.com/macros/s/AKfycbwAxjV-Gx1G5BiBeBDL8fHz8B23_PRWiAMJ00dpNEFDPRr9VVnbBPSaBLzpqTD1fxGOcA/exec";

async function apiPost(action, payload = {}){
  const user = firebase.auth().currentUser;
  const idToken = user ? await user.getIdToken() : null;

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, Authorization: `Bearer ${idToken}`, ...payload })
  });
  const json = await res.json().catch(() => ({}));
  if(!res.ok) throw new Error(json.error || "Erro na API");
  return json;
}

async function whoami(){ return apiPost("whoami"); }
async function submitAprovacao(orcamento){ return apiPost("submitApproval", { orcamento }); }
async function getHistorico(tab){ return apiPost("getHistory", { tab }); }
