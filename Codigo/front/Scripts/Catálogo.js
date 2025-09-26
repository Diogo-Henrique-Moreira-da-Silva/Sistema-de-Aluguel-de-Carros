(function initCards(){
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cards = Array.from(document.querySelectorAll(".card"));

  cards.forEach(card => {
    const glow = card.querySelector(".glow");
    const content = card.querySelector(".card-content");

    // Clique na área do card (evita duplicar quando clica no botão)
    card.addEventListener("click", (e) => {
      if (e.target.closest(".cta")) return;
      const href = card.getAttribute("data-href");
      if (href && href !== "#") window.open(href, "_blank", "noopener,noreferrer");
    });

    // Acessibilidade: Enter/Espaço abre o link
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const href = card.getAttribute("data-href");
        if (href && href !== "#") window.open(href, "_blank", "noopener,noreferrer");
      }
    });

    // Tilt + Glow
    let rafId = null;
    function onMove(ev){
      if (reduceMotion) return;
      const rect = card.getBoundingClientRect();
      const clientX = ev.clientX ?? (ev.touches && ev.touches[0].clientX);
      const clientY = ev.clientY ?? (ev.touches && ev.touches[0].clientY);
      if (clientX == null || clientY == null) return;

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const percentX = (x - cx) / cx;    // -1..1
      const percentY = -((y - cy) / cy); // -1..1

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateY(${percentX * 10}deg) rotateX(${percentY * 10}deg)`;
        if (content) content.style.transform = `translateZ(50px)`;
        if (glow){
          glow.style.opacity = "1";
          glow.style.backgroundImage = `radial-gradient(circle at ${x}px ${y}px, #ffffff44, #00000010 35%, transparent 60%)`;
        }
      });
    }

    function onLeave(){
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
      if (content) content.style.transform = "translateZ(0px)";
      if (glow) glow.style.opacity = "0";
    }

    // mouse
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);

    // toque (opcional)
    card.addEventListener("touchstart", (e) => { if (!reduceMotion) onMove(e); }, {passive:true});
    card.addEventListener("touchmove", (e) => { if (!reduceMotion) onMove(e); }, {passive:true});
    card.addEventListener("touchend", onLeave, {passive:true});
  });
})();
