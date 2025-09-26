// logout
document.addEventListener("DOMContentLoaded", () => {
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      firebase.auth().signOut().then(() => {
        window.location.href = "index.html";
      });
    });
  }
});

// compras
const btnSubmitCompra = document.getElementById("btnSubmitCompra");
if (btnSubmitCompra) {
  btnSubmitCompra.addEventListener("click", async () => {
    const orcamento = document.getElementById("inputOrcamento").value;
    if (!orcamento) {
      alert("Digite o número do orçamento.");
      return;
    }
    const res = await enviarCompra(orcamento);
    if (res.success) {
      alert("Solicitação enviada com sucesso! Código: " + res.codigo);
      document.getElementById("inputOrcamento").value = "";
    } else {
      alert("Erro: " + res.error);
    }
  });
}
