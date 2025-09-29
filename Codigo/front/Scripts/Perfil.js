const API_BASE = "https://sistema-de-aluguel-de-carros-l02h.onrender.com";
const EP = {
  get: (id) => `${API_BASE}/clientes/${id}`,
  put: (id) => `${API_BASE}/clientes/${id}`,
  del: (id) => `${API_BASE}/clientes/${id}`,
};

const $ = (s, r = document) => r.querySelector(s);

const userId   = Number(localStorage.getItem("userId"));
const userRole = localStorage.getItem("userRole"); 

const form          = $("#form");
const inputs        = form.querySelectorAll("input");
const btnEditar     = $("#btnEditar");
const btnSalvar     = $("#btnSalvar");
const btnCancelar   = $("#btnCancelar");
const btnExcluir    = $("#btnExcluir");
const btnLogout     = $("#btnLogout");

const toast         = $("#toast");
const toastMsg      = $("#toastMsg");
const lastUpdate    = $("#lastUpdate");
const titleNome     = $("#titleNome");
const subtitleEmail = $("#subtitleEmail");
const idBadge       = $("#idBadge");

const dlgDelete     = $("#confirmDelete");
const btnDelCancel  = $("#cancelDel");
const btnDelOk      = $("#okDel");

const f = {
  rg:         $("#rg"),
  cpf:        $("#cpf"),
  nome:       $("#nome"),
  endereco:   $("#endereco"),
  profissao:  $("#profissao"),
  empregador: $("#empregador"),
  rendimento: $("#rendimento"),
  email:      $("#email"),
  senha:      $("#senha"),
};

function showToast(msg) {
  toastMsg.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function toNumber(val) {
  if (val == null) return 0;
  const n = Number(String(val).replace(".", "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function setEditMode(on) {
  inputs.forEach((i) => (i.disabled = !on));
  btnEditar.style.display  = on ? "none" : "inline-block";
  btnSalvar.style.display  = on ? "inline-block" : "none";
  btnCancelar.style.display= on ? "inline-block" : "none";
}

function fillForm(cli) {
  f.rg.value         = cli.rg ?? "";
  f.cpf.value        = cli.cpf ?? "";
  f.nome.value       = cli.nome ?? "";
  f.endereco.value   = cli.endereco ?? "";
  f.profissao.value  = cli.profissao ?? "";
  f.empregador.value = cli.empregador ?? "";
  f.rendimento.value = cli.rendimento != null ? String(cli.rendimento) : "";
  f.email.value      = cli.email ?? "";
  f.senha.value      = ""; 

  titleNome.textContent     = cli.nome ?? "Meu Perfil";
  subtitleEmail.textContent = cli.email ?? "—";
  idBadge.textContent       = `ID: ${cli.id ?? "—"}`;
  lastUpdate.textContent    = new Date().toLocaleString("pt-BR");
}

if (!userId || userRole !== "cliente") {
  alert("Faça login como cliente para acessar o perfil.");
  window.location.href = "../Index.html";
}

async function fetchJSON(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${await r.text()}`);
  return r.json();
}

async function carregarPerfil() {
  try {
    const data = await fetchJSON(EP.get(userId), { headers: { Accept: "application/json" } });
    fillForm(data);
    setEditMode(false);
  } catch (e) {
    console.error(e);
    showToast("Não foi possível carregar seu perfil.");
  }
}
btnEditar.addEventListener("click", () => {
  setEditMode(true);
  f.nome.focus();
});

btnCancelar.addEventListener("click", () => {
  carregarPerfil();
});

btnSalvar.addEventListener("click", async () => {
  const payload = {
    rg:         f.rg.value.trim(),
    cpf:        f.cpf.value.trim(),
    nome:       f.nome.value.trim(),
    endereco:   f.endereco.value.trim(),
    profissao:  f.profissao.value.trim(),
    empregador: f.empregador.value.trim(),
    rendimento: toNumber(f.rendimento.value),
    email:      f.email.value.trim(),
    ...(f.senha.value ? { senha: f.senha.value } : {}),
  };

  if (!payload.nome || !payload.email) {
    showToast("Nome e e-mail são obrigatórios.");
    return;
  }

  const old = btnSalvar.textContent;
  btnSalvar.disabled = true;
  btnSalvar.textContent = "Salvando...";

  try {
    const updated = await fetchJSON(EP.put(userId), {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    fillForm(updated);
    setEditMode(false);
    showToast("Perfil atualizado com sucesso!");
  } catch (e) {
    console.error(e);
    showToast("Erro ao salvar perfil.");
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.textContent = old;
  }
});

btnExcluir.addEventListener("click", () => {
  if (!dlgDelete) {
    if (confirm("Excluir sua conta permanentemente? Essa ação não pode ser desfeita.")) doDelete();
    return;
  }
  dlgDelete.showModal();
});

btnDelCancel?.addEventListener("click", () => dlgDelete.close());
btnDelOk?.addEventListener("click", async () => {
  await doDelete();
  dlgDelete.close();
});

async function doDelete() {
  try {
    const r = await fetch(EP.del(userId), { method: "DELETE" });
    if (!r.ok && r.status !== 204) throw new Error(`${r.status} ${r.statusText} — ${await r.text()}`);
    showToast("Conta excluída. Redirecionando...");
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "../Index.html";
    }, 1200);
  } catch (e) {
    console.error(e);
    showToast("Erro ao excluir conta.");
  }
}
btnLogout?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../Index.html";
});

carregarPerfil();
