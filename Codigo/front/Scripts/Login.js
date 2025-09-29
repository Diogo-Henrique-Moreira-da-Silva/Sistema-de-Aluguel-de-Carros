const wrapper      = document.querySelector('.wrapper');
const overlay      = document.querySelector('.overlay');
const loginLink    = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup     = document.querySelector('.btnLogin-popup');
const iconClose    = document.querySelector('.icon-close');

function openModal(view = 'login') {
  if (!wrapper) return;
  if (view === 'register') wrapper.classList.add('active'); else wrapper.classList.remove('active');
  wrapper.classList.add('active-popup');
  if (overlay) { overlay.classList.add('active'); overlay.hidden = false; }
}
function closeModal() {
  if (!wrapper) return;
  wrapper.classList.remove('active-popup', 'active');
  if (overlay) { overlay.classList.remove('active'); setTimeout(() => (overlay.hidden = true), 200); }
}
registerLink?.addEventListener('click', (e) => { e.preventDefault(); wrapper?.classList.add('active'); });
loginLink?.addEventListener('click',    (e) => { e.preventDefault(); wrapper?.classList.remove('active'); });
btnPopup?.addEventListener('click', () => openModal('login'));
iconClose?.addEventListener('click', closeModal);
overlay?.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && wrapper?.classList.contains('active-popup')) closeModal();
});

function setSectionEnabled(section, enabled) {
  if (!section) return;
  section.hidden = !enabled;
  section.querySelectorAll('input, select, textarea, button').forEach(el => {
    if (el.type !== 'hidden') el.disabled = !enabled;
    if (!enabled && el.type !== 'hidden') el.value = '';
  });
}
function setupRoleTabs(scopeEl) {
  if (!scopeEl) return;
  const tabs         = scopeEl.querySelectorAll('.role-tab');
  const hiddenRole   = scopeEl.querySelector('.role-input');
  const roleSections = scopeEl.querySelectorAll('.role-section');
  if (!tabs.length && !roleSections.length) return;

  const activeFromDom = Array.from(tabs).find(t => t.classList.contains('is-active')) || tabs[0];
  const initialRole   = activeFromDom?.dataset.role || 'cliente';

  tabs.forEach(t => {
    const isActive = t.dataset.role === initialRole;
    t.classList.toggle('is-active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  if (hiddenRole) hiddenRole.value = initialRole;
  roleSections.forEach(sec => setSectionEnabled(sec, sec.dataset.role === initialRole));

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const role = tab.dataset.role || 'cliente';
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (hiddenRole) hiddenRole.value = role;
      roleSections.forEach(sec => setSectionEnabled(sec, sec.dataset.role === role));
    });
  });
}
setupRoleTabs(document.querySelector('.form-box.login'));
setupRoleTabs(document.querySelector('.form-box.register'));

const API_CLIENTES = 'https://sistema-de-aluguel-de-carros-l02h.onrender.com/clientes';
const API_EMPRESAS = 'https://sistema-de-aluguel-de-carros-l02h.onrender.com/agentes/empresa';
const API_BANCOS   = 'https://sistema-de-aluguel-de-carros-l02h.onrender.com/agentes/banco';

async function postJson(url, body) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  return resp;
}

document.querySelector('.form-box.login form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form  = e.target;
  const role  = form.querySelector('.role-input')?.value || 'cliente';
  const email = form.email?.value?.trim();
  const senha = form.senha?.value ?? '';

  if (!email || !senha) { alert('Preencha email e senha.'); return; }

  let url;
  switch (role) {
    case 'cliente': url = `${API_CLIENTES}/login`; break;
    case 'empresa': url = `${API_EMPRESAS}/login`; break;
    case 'banco':   url = `${API_BANCOS}/login`;   break;
    default:        url = `${API_CLIENTES}/login`;
  }

  try {
    const resp = await postJson(url, { email, senha });
    if (!resp.ok) {
      const txt = await resp.text();
      alert(`Falha no login: ${resp.status} ${resp.statusText}\n${txt}`);
      return;
    }

    const usuario = await resp.json();

    localStorage.setItem('userId',   usuario.id);
    localStorage.setItem('userName', usuario.nome ?? '');
    localStorage.setItem('userRole', role);

    alert('Login realizado com sucesso!');
    closeModal();

    const target = (role === 'empresa') ? 'CadastrarCarro.html' : 'Catálogo.html';
    window.location.assign(target);

  } catch (err) {
    console.error('Erro de rede ao fazer login:', err);
    alert('Erro ao conectar com o servidor.');
  }
});
document.querySelector('.form-box.register form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const role = form.querySelector('.role-input')?.value || 'cliente';
  const raw  = Object.fromEntries(new FormData(form).entries());

  let url, payload = {};

  if (role === 'cliente') {
    url = `${API_CLIENTES}/cadastro`;
    payload = {
      nome:       (raw.nome ?? '').trim(),
      email:      (raw.email ?? '').trim(),
      cpf:        (raw.cpf ?? '').trim(),
      rg:         (raw.rg ?? '').trim(),
      endereco:   (raw.endereco ?? '').trim(),
      profissao:  (raw.profissao ?? '').trim(),
      empregador: (raw.empregador ?? '').trim(),
      rendimento: raw.rendimento ? Number(raw.rendimento) : 0,
      senha:      raw.senha ?? '',
    };
    if (!payload.email || !payload.senha) { alert('Email e senha são obrigatórios.'); return; }
  }

  if (role === 'empresa') {
    url = `${API_EMPRESAS}/cadastro`;
    payload = {
      nome:     (raw.empresa_nome ?? '').trim(),
      email:    (raw.email ?? '').trim(),
      cnpj:     (raw.empresa_cnpj ?? '').trim(),
      endereco: (raw.empresa_endereco ?? '').trim(),
      senha:    raw.senha ?? '',
    };
    if (!payload.nome || !payload.cnpj || !payload.email || !payload.senha) {
      alert('Preencha nome, CNPJ, email e senha.');
      return;
    }
  }

  if (role === 'banco') {
    url = `${API_BANCOS}/cadastro`;
    payload = {
      nome:     (raw.banco_nome ?? '').trim(),
      email:    (raw.email ?? '').trim(),
      cnpj:     (raw.banco_cnpj ?? '').trim(),
      compe:    raw.banco_compe ? Number(raw.banco_compe) : null,
      endereco: (raw.banco_endereco ?? '').trim(),
      senha:    raw.senha ?? '',
    };
    if (!payload.nome || !payload.cnpj || !payload.email || !payload.senha ||
        payload.compe == null || Number.isNaN(payload.compe)) {
      alert('Preencha nome, CNPJ, COMPE, email e senha.');
      return;
    }
  }

  try {
    const resp = await postJson(url, payload);
    if (!resp.ok) {
      const txt = await resp.text();
      alert(`Erro ao cadastrar: ${resp.status} ${resp.statusText}\n${txt}`);
      return;
    }
    alert('Cadastro realizado com sucesso! Agora você pode fazer login.');
    wrapper?.classList.remove('active');
  } catch (err) {
    console.error('Erro de rede ao cadastrar:', err);
    alert('Erro ao conectar com o servidor.');
  }
});
