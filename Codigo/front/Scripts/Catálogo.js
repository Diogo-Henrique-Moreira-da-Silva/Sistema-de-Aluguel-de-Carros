(function initCatalog() {
  const API = "http://localhost:8080";
  const EP = {
    listar: `${API}/carro`,                           
    fotosList:   (id)     => `${API}/carros/${id}/fotos`,
    fotoContent: (fotoId) => `${API}/carros/fotos/${fotoId}/conteudo`,
    criarReserva: `${API}/reservas`                    
  };

  const PLACEHOLDER = "../Assets/fundo-locadora.jpg";

  const $ = (s, r = document) => r.querySelector(s);

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const overlay    = $(".rent-overlay");
  const modal      = $(".rent-modal");
  const closeBtn   = $(".rent-close");
  const cancelBtn  = $(".rent-cancel");
  const form       = $("#rent-form");
  const carNameEl  = $("#rent-car-name");
  const startInput = $("#rent-start");
  const endInput   = $("#rent-end");

  const daysEl     = $("#sum-days");
  const totalEl    = $("#sum-total");
  const dailyEl    = $("#rent-daily");
  const confirmBtn = $(".rent-confirm");

  let lastFocused = null;
  let selectedCar = { id: null, name: "", year: "", model: "", brand: "", price: 0 };

  function todayISO() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
  }
  const parseLocalDate = (s) => new Date(`${s}T12:00:00`);
  function diffDaysInclusive(a, b) {
    const ms = parseLocalDate(b) - parseLocalDate(a);
    return Math.max(1, Math.ceil(ms / 86400000));
  }
  const fmtBRL = (n) =>
    typeof n === "number" && !Number.isNaN(n)
      ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "—";

  function updateSummary() {
    const s = startInput?.value;
    const e = endInput?.value;
    const valid = !!(s && e && e >= s);
    if (confirmBtn) confirmBtn.disabled = !valid;

    if (!valid) {
      if (daysEl)  daysEl.textContent  = "—";
      if (totalEl) totalEl.textContent = "—";
      return;
    }
    const d = diffDaysInclusive(s, e);
    const total = d * (selectedCar.price || 0);
    if (daysEl)  daysEl.textContent  = String(d);
    if (totalEl) totalEl.textContent = fmtBRL(total);
  }

  function openModalFromCard(cardEl) {
    if (!overlay || !modal || !form) return;

    lastFocused = document.activeElement;

    const title = cardEl.querySelector(".title")?.textContent?.trim() || "Veículo";
    const dd    = cardEl.querySelectorAll(".specs dd");
    const year  = dd[0]?.textContent?.trim() ?? "";
    const model = dd[1]?.textContent?.trim() ?? "";
    const brand = dd[2]?.textContent?.trim() ?? "";
    const price = Number(cardEl.dataset.price || "0") || 0;
    const id    = cardEl.getAttribute("data-id");

    selectedCar = { id, name: title, year, model, brand, price };

    if (carNameEl) carNameEl.textContent = `${title} • ${model}${year ? ` (${year})` : ""}`;
    if (dailyEl)   dailyEl.textContent   = fmtBRL(price);

    const min = todayISO();
    if (startInput) { startInput.min = min; startInput.value = ""; }
    if (endInput)   { endInput.min   = min; endInput.value   = ""; }

    updateSummary();

    overlay.hidden = false;
    modal.hidden   = false;
    setTimeout(() => startInput?.focus(), 0);

    document.addEventListener("keydown", onEsc, true);
    document.addEventListener("focus", trapFocus, true);
  }

  function closeModal() {
    overlay.hidden = true;
    modal.hidden   = true;
    document.removeEventListener("keydown", onEsc, true);
    document.removeEventListener("focus", trapFocus, true);
    if (lastFocused?.focus) lastFocused.focus();
  }

  function onEsc(e) { if (e.key === "Escape") { e.preventDefault(); closeModal(); } }
  function trapFocus(e) {
    if (modal.hidden) return;
    if (!modal.contains(e.target)) { e.stopPropagation(); (closeBtn || modal).focus(); }
  }

  overlay?.addEventListener("click", closeModal);
  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  startInput?.addEventListener("input", () => {
    if (endInput && startInput.value) {
      endInput.min = startInput.value;
      if (endInput.value && endInput.value < startInput.value) {
        endInput.value = startInput.value;
      }
    }
    updateSummary();
  });
  endInput?.addEventListener("input", updateSummary);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const s  = startInput?.value;
    const e2 = endInput?.value;
    if (!s || !e2) return alert("Selecione as datas de retirada e devolução.");
    if (e2 < s)    return alert("A devolução não pode ser antes da retirada.");

    const clienteId = Number(localStorage.getItem("userId")); 
    if (!clienteId) return alert("Faça login para reservar.");

    const dias  = diffDaysInclusive(s, e2);
    const total = dias * (selectedCar.price || 0);

    const payload = {
      clienteId,
      carroId: Number(selectedCar.id),
      dataInicio: s, 
      dataFim:    e2,
      diaria:     selectedCar.price,
      total,
      status:     "PENDENTE"
    };

    try {
      const r = await fetch(EP.criarReserva, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${await r.text()}`);

      closeModal();
      window.location.href = "/Pages/solicitacoes.html";
    } catch (err) {
      console.error(err);
      alert("Falha ao criar a reserva. Tente novamente.");
    }
  });

  window.openRentModal = openModalFromCard;

  const container = $("#cards") || document;
  const bound = new WeakSet();

  function makeCard(car) {
    const daily = typeof car.diaria === "number" ? car.diaria : null;
    const priceText = daily != null ? `${fmtBRL(daily)}/dia` : "";

    return `
      <article class="card" role="link" tabindex="0"
               data-id="${car.id ?? ""}" data-price="${daily ?? ""}" data-href="#">
        <div class="glow" aria-hidden="true"></div>
        <div class="card-content">
          <img class="thumb"
               src="${car.imagemUrl || PLACEHOLDER}"
               alt="${car.fabricante} ${car.modelo}"
               loading="lazy"
               onerror="this.onerror=null;this.src='${PLACEHOLDER}'" />
          <header>
            <h2 class="title">${car.fabricante} ${car.modelo}</h2>
          </header>

          <dl class="specs">
            <div><dt>Ano</dt><dd>${car.ano ?? ""}</dd></div>
            <div><dt>Modelo</dt><dd>${car.modelo}</dd></div>
            <div><dt>Marca</dt><dd>${car.fabricante}</dd></div>
          </dl>

          ${priceText ? `<p class="price">${priceText}</p>` : ""}

          <a class="cta" href="#" aria-label="Alugar ${car.fabricante} ${car.modelo}">Alugar</a>
        </div>
      </article>
    `;
  }

  function bindCard(card) {
    if (!card || bound.has(card)) return;
    bound.add(card);

    const glow = card.querySelector(".glow");
    const content = card.querySelector(".card-content");

    card.addEventListener("click", (e) => {
      if (e.target.closest(".cta")) return;
      const href = card.getAttribute("data-href");
      if (href && href !== "#") window.open(href, "_blank", "noopener,noreferrer");
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const href = card.getAttribute("data-href");
        if (href && href !== "#") window.open(href, "_blank", "noopener,noreferrer");
      }
    });
    card.querySelector(".cta")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModalFromCard(card);
    });

    if (!reduceMotion) {
      let rafId = null;
      function onMove(ev) {
        const rect = card.getBoundingClientRect();
        const t = ev.touches?.[0];
        const clientX = ev.clientX ?? t?.clientX;
        const clientY = ev.clientY ?? t?.clientY;
        if (clientX == null || clientY == null) return;

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const px = (x - cx) / cx;
        const py = -((y - cy) / cy);

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = `perspective(1000px) rotateY(${px * 10}deg) rotateX(${py * 10}deg)`;
          if (content) content.style.transform = `translateZ(50px)`;
          if (glow) {
            glow.style.opacity = "1";
            glow.style.backgroundImage =
              `radial-gradient(circle at ${x}px ${y}px, #ffffff44, #00000010 35%, transparent 60%)`;
          }
        });
      }
      function onLeave() {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
        if (content) content.style.transform = "translateZ(0px)";
        if (glow) glow.style.opacity = "0";
      }
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("touchstart", onMove, { passive: true });
      card.addEventListener("touchmove", onMove, { passive: true });
      card.addEventListener("touchend", onLeave, { passive: true });
    }
  }

  function render(list) {
    container.innerHTML = list.map(makeCard).join("");
    container.querySelectorAll(".card").forEach(bindCard);
  }

  const mo = new MutationObserver((muts) => {
    muts.forEach((m) => {
      m.addedNodes?.forEach((n) => {
        if (!(n instanceof HTMLElement)) return;
        if (n.classList?.contains("card")) bindCard(n);
        n.querySelectorAll?.(".card")?.forEach(bindCard);
      });
    });
  });
  mo.observe(container, { childList: true, subtree: true });

  async function fetchJSON(url) {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${await r.text()}`);
    return r.json();
  }

  function normalizeFromBackend(it) {
    if ("modelo" in it && "fabricante" in it) {
      return {
        id: it.id ?? null, 
        placa: it.placa ?? "—",
        modelo: it.modelo ?? "—",
        fabricante: it.fabricante ?? "—",
        diaria: typeof it.diaria === "number" ? it.diaria : null,
        status: it.status ?? "Disponivel",
        proprietarioNome: it.proprietarioNome ?? "—",
        imagemUrl: null, 
      };
    }
    return {
      id: it.id ?? null,
      placa: it.placa ?? "—",
      modelo: it.modelo ?? "—",
      fabricante: it.fabricante ?? "—",
      diaria: typeof it.diaria === "number" ? it.diaria : null,
      status: it.status ?? "Disponivel",
      proprietarioNome: it.proprietario?.nome ?? "—",
      imagemUrl: null,
    };
  }

  async function loadCars() {
    try {
      const raw = await fetchJSON(EP.listar);
      const cars = (Array.isArray(raw) ? raw : []).map(normalizeFromBackend);

      if (!cars.length) {
        container.innerHTML = `<p class="no-cars">Nenhum carro cadastrado.</p>`;
        return;
      }

      render(cars);

      for (const car of cars) {
        if (!car.id) continue; 
        try {
          const metas = await fetchJSON(EP.fotosList(car.id));
          const capa  = (metas || []).find((f) => f.capa) || (metas || [])[0];
          if (!capa) continue;

          car.imagemUrl = EP.fotoContent(capa.id);
          const img = container.querySelector(`.card[data-id="${car.id}"] img.thumb`);
          if (img) img.src = car.imagemUrl;
        } catch {
        }
      }
    } catch (err) {
      console.error(err);
      container.innerHTML = `<p class="no-cars">Falha ao carregar carros. Verifique o backend.</p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", loadCars);
})();
