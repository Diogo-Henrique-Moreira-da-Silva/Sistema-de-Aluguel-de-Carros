// localStorage
const STORAGE_KEY = 'carros';

const initialCars = [
  {
    id: crypto.randomUUID(), modelo: 'Corolla Altis', placa: 'ABC-1D23',
    fabricante: 'Toyota', proprietario: 'Toyota Fleet',
    imagemUrl: 'images/cars/corolla-2020.jpg'
  },
  {
    id: crypto.randomUUID(), modelo: 'Civic Touring', placa: 'XYZ-9K88',
    fabricante: 'Honda', proprietario: 'Honda Leasing',
    imagemUrl: 'images/cars/civic-2019.jpg'
  },
  {
    id: crypto.randomUUID(), modelo: 'Mustang GT', placa: 'MUS-7T21',
    fabricante: 'Ford', proprietario: 'Ford Rentals',
    imagemUrl: 'images/cars/mustang-2021.jpg'
  },
  {
    id: crypto.randomUUID(), modelo: 'Onix Premier', placa: 'ONX-2A22',
    fabricante: 'Chevrolet', proprietario: 'Chevy Fleet',
    imagemUrl: 'images/cars/onix-2022.jpg'
  },
  {
    id: crypto.randomUUID(), modelo: 'Gol 1.6 MSI', placa: 'GOL-2B18',
    fabricante: 'Volkswagen', proprietario: 'VW Fleet',
    imagemUrl: 'images/cars/gol-2018.jpg'
  },
  {
    id: crypto.randomUUID(), modelo: 'Argo Trekking', placa: 'ARG-3C23',
    fabricante: 'Fiat', proprietario: 'Fiat Fleet',
    imagemUrl: 'images/cars/argo-2023.jpg'
  },
];

function loadCars(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...initialCars];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [...initialCars];
  }catch{ return [...initialCars]; }
}
function saveCars(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

// Render
const cardsEl   = document.getElementById('cards');
let cars = loadCars();

function cardHTML(car){
  const img = car.imagemUrl && car.imagemUrl.trim() ? car.imagemUrl : 'images/cars/placeholder.jpg';
  return `
  <article class="card" data-id="${car.id}">
    <img class="thumb" src="${img}" alt="${car.modelo}" loading="lazy" onerror="this.src='images/cars/placeholder.jpg'">
    <div class="card-content">
      <h3>${car.fabricante} ${car.modelo}</h3>
      <div class="specs">
        <div class="row"><div class="k">Modelo</div><div class="v">${car.modelo}</div></div>
        <div class="row"><div class="k">Placa</div><div class="v">${car.placa}</div></div>
        <div class="row"><div class="k">Fabricante</div><div class="v">${car.fabricante}</div></div>
        <div class="row"><div class="k">Proprietário</div><div class="v">${car.proprietario}</div></div>
      </div>
      <div class="actions">
        <button class="btn primary" data-action="rent">Alugar</button>
        <button class="btn danger" data-action="delete">Excluir</button>
      </div>
    </div>
  </article>`;
}

function render(){
  cardsEl.innerHTML = cars.map(cardHTML).join('');
}
render();

// Adicionar (modal)
const fab        = document.getElementById('btnAdd');
const overlay    = document.getElementById('overlay');
const modal      = document.getElementById('carModal');
const form       = document.getElementById('carForm');
const btnClose   = document.getElementById('btnClose');
const btnCancel  = document.getElementById('btnCancel');

function openModal(){
  overlay.hidden = false;
  overlay.classList.add('active');
  modal.showModal();
  form.reset();
  form.modelo.focus();
}
function closeModal(){
  modal.close();
  overlay.classList.remove('active');
  setTimeout(()=> overlay.hidden = true, 200);
}

fab.addEventListener('click', openModal);
btnClose.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

// salvar
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  const newCar = {
    id: crypto.randomUUID(),
    modelo: data.modelo.trim(),
    placa: (data.placa || '').toUpperCase().trim(),
    fabricante: data.fabricante.trim(),
    proprietario: data.proprietario.trim(),
    imagemUrl: data.imagemUrl?.trim() || ''
  };

  // validação
  if (!newCar.modelo || !newCar.placa || !newCar.fabricante || !newCar.proprietario){
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  cars.unshift(newCar);   
  saveCars(cars);
  render();
  closeModal();
});

//  Alugar e Excluir
cardsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const card = e.target.closest('.card');
  const id = card?.dataset.id;
  if (!id) return;

  const car = cars.find(c => c.id === id);

  if (btn.dataset.action === 'rent'){
    alert(`Reservando: ${car.fabricante} ${car.modelo} (${car.placa})`);
  }
  if (btn.dataset.action === 'delete'){
    if (confirm(`Excluir ${car.fabricante} ${car.modelo}?`)){
      cars = cars.filter(c => c.id !== id);
      saveCars(cars);
      render();
    }
  }
});
