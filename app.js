document.getElementById("btnSubmitCompra").addEventListener("click", async () => {
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
