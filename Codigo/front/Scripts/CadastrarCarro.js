const API = 'https://sistema-de-aluguel-de-carros-l02h.onrender.com';

const EP = {
  criar:        `${API}/carro/cadastro`,
  listar:       `${API}/carro`,
  excluir:      (placa)   => `${API}/carro/${encodeURIComponent(placa)}`,
  fotosList:    (id)      => `${API}/carros/${id}/fotos`,
  fotoContent:  (fotoId)  => `${API}/carros/fotos/${fotoId}/conteudo`,
  // Solicitações
  pendentes:    (propId)  => `${API}/aluguel/proprietario/${propId}/pendentes`,
  aprovar:      (aluguelId) => `${API}/aluguel/aprovar/${aluguelId}`,
  rejeitar:     (aluguelId) => `${API}/aluguel/rejeitar/${aluguelId}`
};

const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const fmtBRL = (n) =>
  (typeof n === 'number' && !Number.isNaN(n))
    ? n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' })
    : '—';

const toNumber = (v) => {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const getProprietarioId = () => Number(localStorage.getItem('userId'));

async function fetchJSON(url, init) {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${await r.text()}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

function statusChip(status) {
  const v = String(status || '').toUpperCase();
  if (v === 'ALUGADO')                     return { text:'Alugado',    cls:'chip chip-bad'  };
  if (v === 'RESERVADO' || v === 'EM ABERTO' || v === 'PENDENTE')
                                           return { text:'Reservado',  cls:'chip chip-warn' };
  return                                          { text:'Disponível', cls:'chip chip-ok'   };
}

// ---------- elementos ----------
const cardsEl   = $('#cards');
const overlay   = $('#overlay');
const carModal  = $('#carModal');       // modal de cadastro de carro 
const form      = $('#carForm');
const btnAdd    = $('#btnAdd');
const btnClose  = $('#btnClose');
const btnCancel = $('#btnCancel');

// modal de solicitações 
let solicitacoesDialog = null;

// ---------- estado ----------
let cars = [];                      // carros do proprietário logado
let pendentesByCarId = new Map();   // Map<carroId, Array<AluguelResumoDTO>>

// ---------- normalização ----------
function mapFromDTO(x) {
  return {
    id: x.id ?? null,
    placa: (x.placa ?? '').toUpperCase(),
    modelo: x.modelo ?? '',
    fabricante: x.fabricante ?? '',
    diaria: typeof x.diaria === 'number' ? x.diaria : null,
    status: x.status ?? 'DISPONIVEL',
    proprietarioId: x.proprietarioId ?? x.proprietario?.id ?? null,
    proprietarioNome: x.proprietarioNome ?? x.proprietario?.nome ?? null,
    imagemUrl: null
  };
}

// ---------- render ----------
function cardHTML(c) {
  const st = statusChip(c.status);
  const diariaTxt = c.diaria != null ? `${fmtBRL(c.diaria)}/dia` : '—';
  const solicitacoes = (pendentesByCarId.get(c.id) || []).length;

  return `
    <article class="card" data-id="${c.id}" data-placa="${c.placa}">
      <img class="thumb"
           src="${c.imagemUrl || `https://picsum.photos/seed/${encodeURIComponent(c.placa || c.id || Math.random())}/640/360`}"
           alt="${c.fabricante} ${c.modelo}"
           loading="lazy" />
      <div class="card-content">
        <h3>${c.fabricante} ${c.modelo}</h3>
        <div class="specs">
          <div class="row"><div class="k">Modelo</div><div class="v">${c.modelo}</div></div>
          <div class="row"><div class="k">Placa</div><div class="v">${c.placa}</div></div>
          <div class="row"><div class="k">Fabricante</div><div class="v">${c.fabricante}</div></div>
          <div class="row"><div class="k">Diária</div><div class="v">${diariaTxt}</div></div>
          <div class="row"><div class="k">Status</div><div class="v"><span class="${st.cls}">${st.text}</span></div></div>
        </div>
        <div class="actions">
          ${solicitacoes > 0
            ? `<button class="btn warn" data-action="solicitacoes">Solicitações (${solicitacoes})</button>`
            : ''}
          <button class="btn danger" data-action="delete">Excluir</button>
        </div>
      </div>
    </article>
  `;
}

function render() {
  cardsEl.innerHTML = cars.length
    ? cars.map(cardHTML).join('')
    : '<p class="empty">Nenhum carro cadastrado.</p>';
}

// ---------- carregamento ----------
async function loadCarsAndPhotos() {
  const propId = getProprietarioId();
  if (!propId) throw new Error('Proprietário não autenticado.');

  // 1) busca todos e filtra por proprietário logado
  const data = await fetchJSON(EP.listar, { headers:{ Accept:'application/json' } });
  if (!Array.isArray(data)) throw new Error('Resposta inesperada de /carro.');
  cars = data.map(mapFromDTO).filter(c => c.proprietarioId === propId);

  render();

  // 2) fotos de capa
  for (const c of cars) {
    if (!c.id) continue;
    try {
      const metas = await fetchJSON(EP.fotosList(c.id), { headers:{ Accept:'application/json' } });
      if (!Array.isArray(metas) || metas.length === 0) continue;
      const capa = metas.find(f => f.capa) || metas[0];
      c.imagemUrl = EP.fotoContent(capa.id);
      const img = cardsEl.querySelector(`.card[data-id="${c.id}"] img.thumb`);
      if (img) img.src = c.imagemUrl;
    } catch {/* ignora por carro */}
  }
}

async function loadPendentes() {
  const propId = getProprietarioId();
  if (!propId) return;
  try {
    const lista = await fetchJSON(EP.pendentes(propId), { headers:{ Accept:'application/json' } });
    // lista: Array<AluguelResumoDTO> — agrupamos por carroId
    pendentesByCarId = new Map();
    (lista || []).forEach(a => {
      const k = a.carroId;
      if (!pendentesByCarId.has(k)) pendentesByCarId.set(k, []);
      pendentesByCarId.get(k).push(a);
    });
  } catch (e) {
    console.warn('Falha ao carregar pendentes:', e.message);
    pendentesByCarId = new Map();
  }
}


// ---------- criação / exclusão ----------
async function cadastrar(dto) {
  const created = await fetchJSON(EP.criar, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', Accept:'application/json' },
    body: JSON.stringify(dto)
  });
  return mapFromDTO({
    id: created.id,
    placa: created.placa,
    modelo: created.modelo,
    fabricante: created.fabricante,
    diaria: created.diaria,
    status: created.status,
    proprietarioId: created.proprietario?.id ?? dto.proprietarioId,
    proprietarioNome: created.proprietario?.nome ?? null
  });
}

async function excluir(placa) {
  const r = await fetch(EP.excluir(placa), { method:'DELETE' });
  if (r.ok) return { ok:true };
  if (r.status === 404) return { ok:false, notFound:true };
  throw new Error(await r.text() || `Erro ${r.status}`);
}

// ---------- modal de solicitações ----------
function ensureSolicDialog() {
  if (solicitacoesDialog) return solicitacoesDialog;
  const dlg = document.createElement('dialog');
  dlg.id = 'solicitacoesDialog';
  dlg.innerHTML = `
    <form method="dialog" class="sol-modal">
      <header>
        <h3>Solicitações</h3>
        <button class="icon" value="close" aria-label="Fechar">✕</button>
      </header>
      <div class="body">
        <div class="sol-list"></div>
      </div>
      <footer>
        <button class="btn" value="close">Fechar</button>
      </footer>
    </form>
  `;
  document.body.appendChild(dlg);
  solicitacoesDialog = dlg;
  return dlg;
}

function solicitacaoItemHTML(a) {
  // a: AluguelResumoDTO
  return `
    <article class="sol-item" data-id="${a.id}">
      <div class="sol-row"><strong>Cliente:</strong> ${a.clienteNome} (ID ${a.clienteId})</div>
      <div class="sol-row"><strong>Dias:</strong> ${a.dias}</div>
      <div class="sol-row"><strong>Status:</strong> ${a.status}</div>
      <div class="sol-row"><strong>Valor:</strong> ${fmtBRL(Number(a.valor))}</div>
      <div class="sol-actions">
        <button class="btn ok" data-action="aprovar">Aprovar</button>
        <button class="btn danger" data-action="rejeitar">Rejeitar</button>
      </div>
    </article>
  `;
}

async function abrirSolicitacoesParaCarro(carroId) {
  const dlg = ensureSolicDialog();
  const listEl = dlg.querySelector('.sol-list');
  const arr = pendentesByCarId.get(Number(carroId)) || [];
  listEl.innerHTML = arr.length ? arr.map(solicitacaoItemHTML).join('') : '<p>Sem solicitações pendentes.</p>';

  dlg.showModal();

  // ações aprovar/rejeitar
  listEl.onclick = async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const card = btn.closest('.sol-item');
    const id = Number(card.dataset.id);
    const action = btn.dataset.action;
    try {
      btn.disabled = true;
      if (action === 'aprovar') {
        await fetchJSON(EP.aprovar(id), { method:'PUT' });
        alert('Solicitação aprovada!');
      } else {
        await fetchJSON(EP.rejeitar(id), { method:'PUT' });
        alert('Solicitação rejeitada!');
      }
      dlg.close();
      // recarrega pendentes + carros (status pode ter mudado)
      await loadPendentes();
      await loadCarsAndPhotos();
      render();
    } catch (err) {
      console.error(err);
      alert('Falha ao atualizar solicitação:\n' + err.message);
    } finally {
      btn.disabled = false;
    }
  };
}

// ---------- boot ----------
(async function boot() {
  // header com nome/id
  const nome = localStorage.getItem('userName') || '';
  const role = (localStorage.getItem('userRole') || '').toLowerCase();
  const id   = getProprietarioId();
  const alvo = $('#empresa-logada');
  if (alvo && (role === 'empresa' || role === 'banco') && id) {
    alvo.textContent = `Proprietário logado: ${nome || '(sem nome)'} • ID ${id}`;
  }

  try {
    await loadCarsAndPhotos();
    await loadPendentes();
    render();
  } catch (e) {
    console.error(e);
    cardsEl.innerHTML = `<p style="color:#f99">Erro ao carregar: ${e.message}</p>`;
  }
})();

// ---------- modal de cadastro ----------
function openCarModal() {
  overlay.hidden = false;
  overlay.classList.add('active');
  carModal.showModal();
  form.reset();
  form.modelo?.focus();
}
function closeCarModal() {
  carModal.close();
  overlay.classList.remove('active');
  setTimeout(() => (overlay.hidden = true), 150);
}

btnAdd?.addEventListener('click', openCarModal);
btnClose?.addEventListener('click', closeCarModal);
btnCancel?.addEventListener('click', closeCarModal);
overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeCarModal(); });

// ---------- submit cadastro ----------
form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fd  = new FormData(form);
  const idProprietario = getProprietarioId();
  if (!idProprietario) return alert('Faça login como Empresa/Banco para cadastrar.');

  const dto = {
    modelo:     String(fd.get('modelo') || '').trim(),
    placa:      String(fd.get('placa') || '').toUpperCase().trim(),
    fabricante: String(fd.get('fabricante') || '').trim(),
    diaria:     toNumber(fd.get('diaria')),
    proprietarioId: idProprietario
  };

  if (!dto.modelo || !dto.placa || !dto.fabricante || dto.diaria == null) {
    alert('Preencha modelo, placa, fabricante e diária.');
    return;
  }

  const submitBtn = form.querySelector('[type="submit"]');
  const old = submitBtn?.textContent;
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Salvando…'; }

  try {
    const novo = await cadastrar(dto);
    cars.unshift(novo);
    render();
    closeCarModal();
    alert('Carro cadastrado com sucesso!');
  } catch (err) {
    console.error(err);
    alert('Erro ao cadastrar:\n' + err.message);
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = old; }
  }
});

// ---------- ações dos cards ----------
cardsEl?.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const card  = e.target.closest('.card');
  const placa = card?.dataset.placa;
  const idCar = Number(card?.dataset.id);

  if (btn.dataset.action === 'delete') {
    const idx = cars.findIndex(c => c.placa === placa);
    if (idx === -1) return;
    const car = cars[idx];
    if (!confirm(`Excluir ${car.fabricante} ${car.modelo} (${car.placa})?`)) return;

    try {
      const res = await excluir(placa);
      cars.splice(idx, 1);
      render();
      if (res.notFound) console.warn(`Carro ${placa} não existia (404). Removido só na UI.`);
      alert('Carro excluído.');
    } catch (err) {
      console.error(err);
      alert('Falha ao excluir:\n' + err.message);
    }
  }

  if (btn.dataset.action === 'solicitacoes') {
    abrirSolicitacoesParaCarro(idCar);
  }
});
