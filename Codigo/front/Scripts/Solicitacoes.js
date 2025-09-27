(function () {
  const $ = (s, r = document) => r.querySelector(s);

  function discoverApiBase() {
    if (window.API_BASE) return String(window.API_BASE).replace(/\/+$/, "");

    const { protocol, hostname } = location;

    const sameOriginCandidates = ["/api", "/backend"];
    const trySameOrigin = async (paths) => {
      for (const p of paths) {
        try {
          const res = await fetch(p + "/_ping", { method: "HEAD" });
          if (res.ok || res.status === 404) return p;
        } catch {}
      }
      return null;
    };
    const portUrl = `${protocol}//${hostname}:8080`;

    return (async () => {
      const proxied = await trySameOrigin(sameOriginCandidates);
      if (proxied) return proxied;
      return portUrl; 
    })();
  }
  const banner = document.createElement("div");
  banner.style.cssText =
    "position:fixed;inset:auto 16px 16px 16px;z-index:9999;padding:10px 12px;border-radius:10px;background:#7f1d1d;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.35);display:none";
  banner.textContent = "Não foi possível conectar ao backend. Verifique se a API está online e o CORS está habilitado.";
  document.body.appendChild(banner);
  const showBackendDown = (show) => { banner.style.display = show ? "block" : "none"; };

  const tbody     = $("#tbody");
  const ownerInfo = $("#owner-info");
  const rowTpl    = $("#row-tpl");

  const ownerId   = Number(localStorage.getItem("userId")); 
  const ownerName = localStorage.getItem("userName") || "";
  const role      = (localStorage.getItem("userRole") || "").toLowerCase();

  if (!ownerId || (role !== "empresa" && role !== "banco")) {
    alert("Faça login como Empresa ou Banco para ver as solicitações.");
    location.href = "../Pages/Login.html";
    return;
  }

  if (ownerInfo) {
    ownerInfo.textContent = `Proprietário: ${ownerName || "(sem nome)"} • ID ${ownerId}`;
  }

  async function fetchJSON(url, init = {}) {
    const headers = { Accept: "application/json", ...(init.headers || {}) };
    const finalInit = { ...init, headers };

    const resp = await fetch(url, finalInit);
    const ctype = resp.headers.get("content-type") || "";
    const text = await resp.text().catch(() => "");

    if (!resp.ok) {
      const hint =
        location.protocol === "https:" && url.startsWith("http://")
          ? " — possí­vel bloqueio de conteúdo não seguro (mixed content) em HTTPS."
          : "";
      throw new Error((text && text.substring(0, 500)) || `${resp.status} ${resp.statusText}${hint}`);
    }
    if (!text) return null;
    if (ctype.includes("application/json")) {
      try { return JSON.parse(text); } catch {}
    }
    try { return JSON.parse(text); } catch { return null; }
  }

  const fmtBRL = (v) =>
    v == null ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const parseLocalDate = (s) => (s ? new Date(`${s}T12:00:00`) : null);
  function diffDaysInclusive(a, b) {
    const A = parseLocalDate(a), B = parseLocalDate(b);
    if (!A || !B) return null;
    const ms = B - A;
    return Math.max(1, Math.ceil(ms / 86400000));
  }

  (async () => {
    const apiBaseResolved = await discoverApiBase();
    const API = typeof apiBaseResolved === "string" ? apiBaseResolved : String(apiBaseResolved || "").replace(/\/+$/, "");

    const EP = {
      pendentes: (agenteId) => `${API}/reservas/pendentes?agenteId=${agenteId}`,
      decidir:   (id)       => `${API}/reservas/${id}/status`
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

        if (rowTpl?.content) {
          tbody.innerHTML = "";
          const frag = document.createDocumentFragment();
          list.forEach((s) => {
            const node = rowFromTemplate(s) ?? htmlRow(s);
            frag.appendChild(node);
          });
          tbody.appendChild(frag);
        } else {
          tbody.innerHTML = list.map((s) => rowHTMLString(s)).join("");
        }
      } catch (err) {
        console.error("Erro ao carregar pendentes:", err);
        showBackendDown(true);
        tbody.innerHTML = `<tr><td colspan="7" class="muted">Erro ao carregar: ${err.message}</td></tr>`;
      }
    }

    function rowHTMLString(solic) {
      const id          = solic.id;
      const modelo      = solic.carroModelo ?? "—";
      const fabricante  = solic.carroFabricante ?? "";
      const placa       = solic.placa ?? "—";
      const clienteNome = solic.clienteNome ?? "—";
      const inicio      = solic.dataInicio ?? "—";
      const fim         = solic.dataFim ?? "—";
      const diaria      = fmtBRL(solic.diaria);
      const total       = fmtBRL(solic.total);
      const dias        = diffDaysInclusive(solic.dataInicio, solic.dataFim);

      return `
        <tr data-id="${id}">
          <td>${id}</td>
          <td>
            <div>${modelo}</div>
            <small class="muted">${fabricante}</small>
          </td>
          <td>${placa}</td>
          <td>${clienteNome}</td>
          <td>
            <div>${inicio} → ${fim}</div>
            <small class="muted">${dias != null ? `${dias} dia(s)` : "—"}</small>
          </td>
          <td>
            <div><strong>${total}</strong></div>
            <small class="muted">Diária: ${diaria}</small>
          </td>
          <td class="actions">
            <button type="button" class="btn btn-aceitar">Aceitar</button>
            <button type="button" class="btn btn-recusar">Recusar</button>
          </td>
        </tr>
      `;
    }

    function htmlRow(solic) {
      const tpl = document.createElement("template");
      tpl.innerHTML = rowHTMLString(solic).trim();
      return tpl.content.firstElementChild;
    }

    function rowFromTemplate(solic) {
      const tpl = rowTpl?.content?.firstElementChild;
      if (!tpl) return null;
      const node = tpl.cloneNode(true);
      node.dataset.id = String(solic.id);

      node.querySelector(".col-idx")?.append(String(solic.id));
      node.querySelector(".carro-modelo")?.append(solic.carroModelo ?? "—");
      node.querySelector(".carro-fabricante")?.append(solic.carroFabricante ?? "");
      node.querySelector(".col-placa")?.append(solic.placa ?? "—");
      node.querySelector(".col-cliente")?.append(solic.clienteNome ?? "—");

      const dias = diffDaysInclusive(solic.dataInicio, solic.dataFim);
      node.querySelector(".inicio")?.append(solic.dataInicio ?? "—");
      node.querySelector(".fim")?.append(solic.dataFim ?? "—");
      node.querySelector(".dias")?.append(dias != null ? `${dias} dia(s)` : "—");

      node.querySelector(".total")?.append(fmtBRL(solic.total));
      node.querySelector(".diaria")?.append(`Diária: ${fmtBRL(solic.diaria)}`);

      return node;
    }

    async function decidir(id, status) {
      await fetchJSON(EP.decidir(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    }

    tbody.addEventListener("click", async (ev) => {
      const btn = ev.target.closest("button");
      if (!btn) return;
      const tr = btn.closest("tr[data-id]");
      if (!tr) return;

      const id = Number(tr.getAttribute("data-id"));
      const isAceitar = btn.classList.contains("btn-aceitar") || btn.classList.contains("btn-approve");
      const isRecusar = btn.classList.contains("btn-recusar") || btn.classList.contains("btn-reject");
      if (!isAceitar && !isRecusar) return;

      try {
        showBackendDown(false);
        if (isAceitar) {
          if (!confirm(`Aceitar solicitação #${id}?`)) return;
          await decidir(id, "ACEITA");
        } else if (isRecusar) {
          if (!confirm(`Recusar solicitação #${id}?`)) return;
          await decidir(id, "RECUSADA");
        }

        tr.remove();
        if (!tbody.querySelector("tr[data-id]")) {
          tbody.innerHTML = `<tr><td colspan="7" class="muted">Nenhuma solicitação pendente.</td></tr>`;
        }
      } catch (err) {
        console.error("Erro ao atualizar status:", err);
        showBackendDown(true);
        alert("Falha ao atualizar status: " + err.message);
      }
    });


    window.addEventListener("online", loadPendentes);
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "r" && (e.ctrlKey || e.metaKey)) setTimeout(loadPendentes, 50);
    });

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadPendentes);
    } else {
      loadPendentes();
    }
  })();
})();
