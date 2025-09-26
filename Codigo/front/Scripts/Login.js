const wrapper      = document.querySelector('.wrapper');
const overlay      = document.querySelector('.overlay');
const loginLink    = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup     = document.querySelector('.btnLogin-popup');
const iconClose    = document.querySelector('.icon-close');

function openModal(view = 'login') {
  if (!wrapper) return;
  view === 'register' ? wrapper.classList.add('active') : wrapper.classList.remove('active');
  wrapper.classList.add('active-popup');
  if (overlay) { overlay.classList.add('active'); overlay.hidden = false; }
}
function closeModal() {
  if (!wrapper) return;
  wrapper.classList.remove('active-popup', 'active');
  if (overlay) { overlay.classList.remove('active'); setTimeout(() => (overlay.hidden = true), 200); }
}

// Troca login <-> cadastro (links dentro do modal)
registerLink?.addEventListener('click', (e) => { e.preventDefault(); wrapper?.classList.add('active'); });
loginLink?.addEventListener('click',    (e) => { e.preventDefault(); wrapper?.classList.remove('active'); });

btnPopup?.addEventListener('click', () => openModal('login'));
iconClose?.addEventListener('click', closeModal);
overlay?.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && wrapper?.classList.contains('active-popup')) closeModal();
});

function setRequiredInside(el, req) {
  if (!el) return;
  el.querySelectorAll('input').forEach((inp) => {
    if (req) inp.setAttribute('required', '');
    else inp.removeAttribute('required');
  });
}

function setupRoleTabs(scopeEl) {
  if (!scopeEl) return;

  const tabs         = scopeEl.querySelectorAll('.role-tab');
  const hiddenRole   = scopeEl.querySelector('.role-input');
  const roleSections = scopeEl.querySelectorAll('.role-section'); 

  if (!tabs.length && !roleSections.length) return;

  const activeFromDom = Array.from(tabs).find((t) => t.classList.contains('is-active')) || tabs[0];
  const initialRole   = activeFromDom?.dataset.role || 'cliente';

  tabs.forEach((t) => {
    const isActive = t.dataset.role === initialRole;
    t.classList.toggle('is-active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  if (hiddenRole) hiddenRole.value = initialRole;

  if (roleSections.length) {
    roleSections.forEach((sec) => {
      const show = sec.dataset.role === initialRole;
      sec.hidden = !show;
      setRequiredInside(sec, show);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const role = tab.dataset.role || 'cliente';

      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      if (hiddenRole) hiddenRole.value = role;

      if (roleSections.length) {
        roleSections.forEach((sec) => {
          const show = sec.dataset.role === role;
          sec.hidden = !show;
          setRequiredInside(sec, show);
        });
      }
    });
  });
}

setupRoleTabs(document.querySelector('.form-box.login'));
setupRoleTabs(document.querySelector('.form-box.register'));
const API_URL = 'http://localhost:8080/clientes';

document.querySelector('.form-box.login form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form  = e.target;
  const role  = form.querySelector('.role-input')?.value || 'cliente';
  const email = form.email?.value?.trim();
  const senha = form.senha?.value;

  if (!email || !senha) { alert('Preencha email e senha.'); return; }

  if (role !== 'cliente') {
    alert('Login de Empresa/Banco ainda não conectado ao backend.');
    return;
  }

  try {
    const resp = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      alert(`Falha no login: ${resp.status} ${resp.statusText}\n${txt}`);
      return;
    }

    const usuario = await resp.json();
    alert('Login realizado com sucesso!');
    localStorage.setItem('userId',   usuario.id);
    localStorage.setItem('userName', usuario.nome ?? '');

    closeModal();
    window.location.href = '/Pages/Home.html';
  } catch (err) {
    console.error('Erro de rede ao fazer login:', err);
    alert('Erro ao conectar com o servidor.');
  }
});

document.querySelector('.form-box.register form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const role = form.querySelector('.role-input')?.value || 'cliente';

  if (role !== 'cliente') {
    alert('Cadastro de Empresa/Banco ainda não conectado ao backend.');
    return;
  }

  const raw = Object.fromEntries(new FormData(form).entries());

  const payload = {
    nome:       raw.nome?.trim() || '',
    email:      raw.email?.trim() || '',
    cpf:        raw.cpf?.trim() || '',
    rg:         raw.rg?.trim() || '',
    endereco:   raw.endereco?.trim() || '',
    profissao:  raw.profissao?.trim() || '',
    empregador: raw.empregador?.trim() || '',
    rendimento: raw.rendimento ? Number(raw.rendimento) : 0,
    senha:      raw.senha || '',
  };

  if (!payload.email || !payload.senha) {
    alert('Email e senha são obrigatórios.');
    return;
  }

  try {
    const resp = await fetch(`${API_URL}/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      alert(`Erro ao cadastrar: ${resp.status} ${resp.statusText}\n${txt}`);
      return;
    }

    await resp.json();
    alert('Cadastro realizado com sucesso! Agora você pode fazer login.');
    wrapper?.classList.remove('active');
  } catch (err) {
    console.error('Erro de rede ao cadastrar:', err);
    alert('Erro ao conectar com o servidor.');
  }
});
