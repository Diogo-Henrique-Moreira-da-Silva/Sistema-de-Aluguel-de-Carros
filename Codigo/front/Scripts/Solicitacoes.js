// Solicitações.js
(function () {
  // ---------- helpers básicos ----------
  const $ = (s, r = document) => r.querySelector(s);
  const fmtBRL = (v) =>
    v == null ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const parseLocalDate = (s) => (s ? new Date(`${s}T12:00:00`) : null);
  const diffDaysInclusive = (a, b) => {
    const A = parseLocalDate(a), B = parseLocalDate(b);
    if (!A || !B) return null;
    const ms = B - A;
    return Math.max(1, Math.ceil(ms / 86400000));
  };

  // ---------- descoberta de API (corrigida) ----------
  async function discoverApiBase() {
    if (window.API_BASE) return String(window.API_BASE).replace(/\/+$/, "");
    const { protocol, hostname } = location;

    // Só considera proxy válido se _ping responder OK
    const trySameOrigin = async (paths) => {
      for (const p of paths) {
        try {
          const res = await fetch(p + "/_ping", { method: "HEAD" });
          if (res.ok) return p; // <- aceita só 2xx
        } catch {}
      }
      return null;
    };

    const proxied = await trySameOrigin(["/api", "/backend"]);
    return proxied || `${protocol}//${hostname}:8080`; // fallback Spring Boot local
  }

  // ---------- banner de erro de backend ----------
  const banner = document.createElement("div");
  banner.style.cssText =
    "position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;padding:10px 12px;border-radius:10px;background:#7f1d1d;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.35);display:none";
  banner.textContent =
    "Não foi possível conectar ao backend. Verifique se a API está online e o CORS está habilitado.";
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(banner));
  const showBackendDown = (show) => (banner.style.display = show ? "block" : "none");

  // ---------- elementos da página ----------
  const tbody = $("#tbody");
  const ownerInfo = $("#owner-info");

  // ---------- autenticação local ----------
  const ownerId = Number(localStorage.getItem("userId"));
  const ownerName = localStorage.getItem("userName") || "";
  const role = (localStorage.getItem("userRole") || "").toLowerCase();

  if (!ownerId || (role !== "empresa" && role !== "banco")) {
    alert("Faça login como Empresa ou Banco para ver as solicitações.");
    location.href = "../Pages/Login.html";
    return;
  }
  if (ownerInfo) ownerInfo.textContent = `Proprietario: ${ownerName || "(sem nome)"} • ID ${ownerId}`;

  // ---------- fetch util ----------
  async function fetchJSON(url, init = {}) {
    const resp = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...(init.headers || {}) },
    });
    const text = await resp.text().catch(() => "");
    if (!resp.ok) {
      const hint =
        location.protocol === "https:" && url.startsWith("http://")
          ? " — possível bloqueio de conteúdo não seguro (HTTPS)."
          : "";
      throw new Error((text && text.slice(0, 400)) || `${resp.status} ${resp.statusText}${hint}`);
    }
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  // ---------- app ----------
  (async function boot() {
    const API = await discoverApiBase();
    const EP = {
      pendentes: (agenteId) => `${API}/aluguel/proprietario/${agenteId}/pendentes`,
      aprovar: (id) => `${API}/aluguel/aprovar/${id}`,
      rejeitar: (id) => `${API}/aluguel/rejeitar/${id}`,
    };

    async function loadPendentes() {
      tbody.innerHTML = `<tr><td colspan="7" class="muted">Carregando…</td></tr>`;
      try {
        showBackendDown(false);
        const list = await fetchJSON(EP.pendentes(ownerId));
        if (!Array.isArray(list) || list.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" class="muted">Nenhuma solicitação pendente.</td></tr>`;
          return;
        }
        tbody.innerHTML = list.map(rowHTML).join("");
      } catch (err) {
        console.error(err);
        showBackendDown(true);
        tbody.innerHTML = `<tr><td colspan="7" class="muted">Erro ao carregar: ${err.message}</td></tr>`;
      }
    }

    function rowHTML(s) {
      // espere que o back retorne algo como:
      // { id, dias, status, valor, carro:{modelo,fabricante,placa,diaria}, locatario:{id,nome}, dataInicio?, dataFim? }
      const id = s.id;
      const carro = s.carro || {};
      const loc = s.locatario || {};
      const modelo = carro.modelo ?? "—";
      const fabricante = carro.fabricante ?? "";
      const placa = carro.placa ?? "—";
      const clienteNome = `${loc.nome ?? "—"}${loc.id ? ` (ID ${loc.id})` : ""}`;
      const diaria = carro.diaria ?? null;

      // se o DTO não enviar inicio/fim, calcula período pelos dias
      const periodo =
        s.dataInicio && s.dataFim
          ? `${s.dataInicio} → ${s.dataFim} · ${diffDaysInclusive(s.dataInicio, s.dataFim) ?? s.dias} dia(s)`
          : `${s.dias} dia(s)`;

      const total = s.valor ?? (typeof diaria === "number" && typeof s.dias === "number" ? diaria * s.dias : null);

      return `
        <tr data-id="${id}">
          <td>${id}</td>
          <td>
            <div>${modelo}</div>
            <small class="muted">${fabricante}</small>
          </td>
          <td>${placa}</td>
          <td>${clienteNome}</td>
          <td>${periodo}</td>
          <td>
            <div><strong>${fmtBRL(total)}</strong></div>
            <small class="muted">Diária: ${fmtBRL(diaria)}</small>
          </td>
          <td class="actions">
            <button type="button" class="btn btn-approve">Aceitar</button>
            <button type="button" class="btn btn-reject">Recusar</button>
          </td>
        </tr>
      `;
    }

    async function aprovar(id) {
      await fetchJSON(EP.aprovar(id), { method: "PUT" });
    }
    async function rejeitar(id) {
      await fetchJSON(EP.rejeitar(id), { method: "PUT" });
    }

    // ações dos botões
    tbody.addEventListener("click", async (ev) => {
      const btn = ev.target.closest("button");
      if (!btn) return;
      const tr = btn.closest("tr[data-id]");
      if (!tr) return;
      const id = Number(tr.dataset.id);

      try {
        showBackendDown(false);
        if (btn.classList.contains("btn-approve")) {
          if (!confirm(`Aceitar solicitação #${id}?`)) return;
          await aprovar(id);
        } else if (btn.classList.contains("btn-reject")) {
          if (!confirm(`Recusar solicitação #${id}?`)) return;
          await rejeitar(id);
        } else {
          return;
        }
        // remove da lista
        tr.remove();
        if (!tbody.querySelector("tr[data-id]")) {
          tbody.innerHTML = `<tr><td colspan="7" class="muted">Nenhuma solicitação pendente.</td></tr>`;
        }
        // popup simples
        const ok = document.createElement("div");
        ok.textContent = "Solicitação atualizada!";
        ok.style.cssText =
          "position:fixed;right:16px;bottom:16px;background:#065f46;color:#fff;padding:10px 12px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.35);z-index:9999";
        document.body.appendChild(ok);
        setTimeout(() => ok.remove(), 1800);
      } catch (err) {
        console.error(err);
        showBackendDown(true);
        alert("Falha ao atualizar: " + err.message);
      }
    });

    // recarrega em Ctrl/Cmd+R (atualização suave)
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "r" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        loadPendentes();
      }
    });
    window.addEventListener("online", loadPendentes);

    // start
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadPendentes);
    } else {
      loadPendentes();
    }
  })();
})();
