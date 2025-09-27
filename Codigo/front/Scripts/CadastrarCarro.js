const API = 'http://127.0.0.1:8080';
const EP = {
  criar:       `${API}/carro/cadastro`,                        
  listar:      `${API}/carro`,                                 
  excluir:     (placa)  => `${API}/carro/${encodeURIComponent(placa)}`,
  fotosList:   (id)     => `${API}/carros/${id}/fotos`,        
  fotoUpload:  (id)     => `${API}/carros/${id}/fotos`,        
  fotoContent: (fotoId) => `${API}/carros/fotos/${fotoId}/conteudo` 
};

const $ = (sel, root=document) => root.querySelector(sel);
const fmtBRL = (n) =>
  (typeof n === 'number' && !Number.isNaN(n))
    ? n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' })
    : '—';
const toNumber = (v) => {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const getProprietarioId = () => Number(localStorage.getItem('userId'));

async function fetchJSON(url, init){
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${await r.text()}`);
  const txt = await r.text();
  return txt ? JSON.parse(txt) : null;
}

const disponibilidade = (status) =>
  String(status || '').toLowerCase() === 'alugado' ? 'Indisponível' : 'Disponível';

const cardsEl  = $('#cards');
const overlay  = $('#overlay');
const modal    = $('#carModal');
const form     = $('#carForm');
const btnAdd   = $('#btnAdd');
const btnClose = $('#btnClose');
const btnCancel= $('#btnCancel');

let cars = []; 
function cardHTML(c){
  const disp = disponibilidade(c.status);
  const chipClass = disp === 'Disponível' ? 'chip chip-ok' : 'chip chip-bad';
  const diariaTxt = c.diaria != null ? `${fmtBRL(c.diaria)}/dia` : '—';
  const placa = (c.placa || '').toUpperCase();
  const imgSrc = c.imagemUrl || `https://picsum.photos/seed/${encodeURIComponent(placa || c.id || Math.random())}/640/360`;

  return `
  <article class="card" data-placa="${placa}">
    <img class="thumb" src="${imgSrc}" alt="${c.fabricante} ${c.modelo}" loading="lazy" />
    <div class="card-content">
      <h3>${c.fabricante} ${c.modelo}</h3>
      <div class="specs">
        <div class="row"><div class="k">Modelo</div><div class="v">${c.modelo}</div></div>
        <div class="row"><div class="k">Placa</div><div class="v">${placa}</div></div>
        <div class="row"><div class="k">Fabricante</div><div class="v">${c.fabricante}</div></div>
        <div class="row"><div class="k">Diária</div><div class="v">${diariaTxt}</div></div>
        <div class="row"><div class="k">Disponibilidade</div><div class="v"><span class="${chipClass}">${disp}</span></div></div>
      </div>
      <div class="actions">
        <button class="btn danger" data-action="delete">Excluir</button>
      </div>
    </div>
  </article>`;
}

function render(){
  cardsEl.innerHTML = cars.length ? cars.map(cardHTML).join('') : '<p class="empty">Nenhum carro cadastrado.</p>';
}

function mapFromDTO(x){
  return {
    id: x.id ?? null,
    placa: x.placa ?? '',                    
    modelo: x.modelo ?? '',
    fabricante: x.fabricante ?? '',
    diaria: typeof x.diaria === 'number' ? x.diaria : null,
    status: x.status ?? 'Disponível',
    proprietarioId: x.proprietarioId ?? null,
    proprietarioNome: x.proprietarioNome ?? null,
    proprietarioTipo: x.proprietarioTipo ?? null,
    imagemUrl: null
  };
}

async function listar(){
  const data = await fetchJSON(EP.listar, { headers:{ Accept:'application/json' } });
  if (!Array.isArray(data)) throw new Error('Resposta inesperada de /carro');
  cars = data.map(mapFromDTO);
  render();

  for (const car of cars){
    if (!car.id) continue;
    try{
      const metas = await fetchJSON(EP.fotosList(car.id), { headers: { Accept:'application/json' } });
      if (!Array.isArray(metas) || metas.length === 0) continue;
      const capa = metas.find(f => f.capa) || metas[0];
      car.imagemUrl = EP.fotoContent(capa.id);
      const img = cardsEl.querySelector(`.card[data-placa="${(car.placa || '').toUpperCase()}"] img.thumb`);
      if (img) img.src = car.imagemUrl;
    }catch{}
  }
}

async function cadastrar(dto){
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
    proprietarioNome: created.proprietario?.nome ?? null,
    proprietarioTipo: null
  });
}

async function excluir(placa){
  const r = await fetch(EP.excluir(placa), { method:'DELETE' });
  if (r.ok) return { ok:true };
  if (r.status === 404) return { ok:false, notFound:true };
  throw new Error(await r.text() || `Erro ${r.status}`);
}

(async function boot(){
  const nome = localStorage.getItem('userName') || '';
  const role = (localStorage.getItem('userRole') || '').toLowerCase();
  const id   = getProprietarioId();
  const alvo = $('#empresa-logada');
  if (alvo && (role === 'empresa' || role === 'banco') && id){
    alvo.textContent = `Proprietário logado: ${nome || '(sem nome)'} • ID ${id}`;
  }

  try{
    await listar();
  }catch(e){
    console.error(e);
    cardsEl.innerHTML = `<p style="color:#f99">Erro ao carregar carros: ${e.message}</p>`;
  }
})();

function openModal(){
  overlay.hidden = false;
  overlay.classList.add('active');
  modal.showModal();
  form.reset();
  form.modelo?.focus();
}
function closeModal(){
  modal.close();
  overlay.classList.remove('active');
  setTimeout(()=> overlay.hidden = true, 150);
}

btnAdd?.addEventListener('click', openModal);
btnClose?.addEventListener('click', closeModal);
btnCancel?.addEventListener('click', closeModal);
overlay?.addEventListener('click', (e)=>{ if (e.target === overlay) closeModal(); });

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fd  = new FormData(form);
  const idProprietario = getProprietarioId();
  if (!idProprietario){
    alert('Faça login como Empresa/Banco para cadastrar.');
    return;
  }

  const dto = {
    modelo:     String(fd.get('modelo') || '').trim(),
    placa:      String(fd.get('placa') || '').toUpperCase().trim(),
    fabricante: String(fd.get('fabricante') || '').trim(),
    diaria:     toNumber(fd.get('diaria')),
    proprietarioId: idProprietario
  };

  if (!dto.modelo || !dto.placa || !dto.fabricante || dto.diaria == null){
    alert('Preencha modelo, placa, fabricante e diária.');
    return;
  }

  const submitBtn = form.querySelector('[type="submit"]');
  const old = submitBtn?.textContent;
  if (submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Salvando…'; }

  try{
    const novo = await cadastrar(dto);
    cars.unshift(novo);
    render();
    closeModal();
    alert('Carro cadastrado com sucesso!');
  }catch(err){
    console.error(err);
    alert('Erro ao cadastrar:\n' + err.message);
  }finally{
    if (submitBtn){ submitBtn.disabled = false; submitBtn.textContent = old; }
  }
});

cardsEl?.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action="delete"]');
  if (!btn) return;

  const card  = e.target.closest('.card');
  const placa = card?.dataset.placa;
  if (!placa) return;

  const idx = cars.findIndex(c => (c.placa || '').toUpperCase() === placa);
  if (idx === -1) return;

  const car = cars[idx];
  if (!confirm(`Excluir ${car.fabricante} ${car.modelo} (${car.placa})?`)) return;

  try{
    const res = await excluir(placa);
    cars.splice(idx, 1);
    render();
    if (res.notFound) console.warn(`Carro ${placa} não existia no backend (404). Removido só na UI.`);
    alert('Carro excluído.');
  }catch(err){
    console.error(err);
    alert('Falha ao excluir:\n' + err.message);
  }
});
