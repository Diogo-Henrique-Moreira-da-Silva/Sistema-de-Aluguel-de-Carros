const API_URL = "http://localhost:8080/clientes";
const userId = localStorage.getItem("userId");
const form = document.getElementById("form");
const inputs = form.querySelectorAll("input");
const btnEditar = document.getElementById("btnEditar");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");
const btnExcluir = document.getElementById("btnExcluir");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");
const lastUpdate = document.getElementById("lastUpdate");
const titleNome = document.getElementById("titleNome");
const subtitleEmail = document.getElementById("subtitleEmail");
const idBadge = document.getElementById("idBadge");

async function carregarPerfil() {
  try {
    const res = await fetch(`${API_URL}/${userId}`);
    if (!res.ok) throw new Error("Erro ao buscar perfil");
    const data = await res.json();

    document.getElementById("rg").value = data.rg || "";
    document.getElementById("cpf").value = data.cpf || "";
    document.getElementById("nome").value = data.nome || "";
    document.getElementById("endereco").value = data.endereco || "";
    document.getElementById("profissao").value = data.profissao || "";
    document.getElementById("entidadeEmpregadora").value = data.empregador || "";
    document.getElementById("rendimentos").value = data.rendimento || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("senha").value = "";

    titleNome.textContent = data.nome;
    subtitleEmail.textContent = data.email;
    idBadge.textContent = `ID: ${data.id}`;
    lastUpdate.textContent = new Date().toLocaleString();
  } catch (error) {
    mostrarToast("Não foi possível carregar seu perfil.");
    console.error(error);
  }
}

btnEditar.addEventListener("click", () => {
  inputs.forEach(i => i.removeAttribute("readonly"));
  btnEditar.style.display = "none";
  btnSalvar.style.display = "inline-block";
  btnCancelar.style.display = "inline-block";
});

btnCancelar.addEventListener("click", () => {
  inputs.forEach(i => i.setAttribute("readonly", true));
  btnEditar.style.display = "inline-block";
  btnSalvar.style.display = "none";
  btnCancelar.style.display = "none";
  carregarPerfil();
});

btnSalvar.addEventListener("click", async () => {
  const clienteAtualizado = {
    rg: document.getElementById("rg").value,
    cpf: document.getElementById("cpf").value,
    nome: document.getElementById("nome").value,
    endereco: document.getElementById("endereco").value,
    profissao: document.getElementById("profissao").value,
    empregador: document.getElementById("entidadeEmpregadora").value,
    rendimento: parseFloat(document.getElementById("rendimentos").value) || 0,
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value || null
  };

  try {
    const res = await fetch(`${API_URL}/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clienteAtualizado)
    });

    if (!res.ok) throw new Error("Erro ao salvar alterações");
    mostrarToast("Perfil atualizado com sucesso!");
    btnCancelar.click();
    carregarPerfil();
  } catch (error) {
    mostrarToast("Erro ao salvar perfil.");
    console.error(error);
  }
});

btnExcluir.addEventListener("click", async () => {
  if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) return;
  try {
    const res = await fetch(`${API_URL}/${userId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao excluir conta");
    mostrarToast("Conta excluída. Redirecionando...");
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "index.html";
    }, 2000);
  } catch (error) {
    mostrarToast("Erro ao excluir conta.");
    console.error(error);
  }
});

function mostrarToast(msg) {
  toastMsg.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
carregarPerfil();
