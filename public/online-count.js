(() => {
  const INTERVAL_MS = 15000;
  const STATUS_URL = "/api/status";
  const BADGE_ID = "forgotten-lands-online-count";

  function ensureBadge() {
    let badge = document.getElementById(BADGE_ID);
    if (badge) return badge;
    const intro = document.querySelector(".website-intro");
    if (!intro) return null;
    badge = document.createElement("div");
    badge.id = BADGE_ID;
    badge.setAttribute("role", "status");
    badge.setAttribute("aria-live", "polite");
    badge.innerHTML = '<span class="fl-online-dot" aria-hidden="true"></span><span class="fl-online-label">Players online</span><strong class="fl-online-number">—</strong>';
    const style = document.createElement("style");
    style.textContent = `
      #${BADGE_ID}{display:flex;align-items:center;justify-content:center;gap:.6rem;width:max-content;max-width:100%;margin:1rem auto 1.25rem;padding:.65rem 1rem;border:1px solid rgba(226,190,105,.55);border-radius:999px;background:rgba(7,13,25,.82);color:#f6e6bb;font:500 14px/1.2 system-ui,sans-serif;box-shadow:0 5px 22px rgba(0,0,0,.28)}
      #${BADGE_ID} .fl-online-dot{width:9px;height:9px;flex:0 0 9px;border-radius:50%;background:#d8ad56;box-shadow:0 0 10px currentColor}
      #${BADGE_ID}[data-state="live"] .fl-online-dot{background:#55e59b;color:#55e59b}
      #${BADGE_ID} .fl-online-number{font-size:1.08rem;color:#fff;font-variant-numeric:tabular-nums}
      #${BADGE_ID} .fl-online-label{white-space:nowrap}
      @media(max-width:480px){#${BADGE_ID}{font-size:13px;padding:.58rem .85rem;margin:.85rem auto 1rem}}
    `;
    document.head.appendChild(style);
    intro.insertAdjacentElement("afterend", badge);
    return badge;
  }

  async function refresh() {
    const badge = ensureBadge();
    if (!badge) return;
    const number = badge.querySelector(".fl-online-number");
    try {
      const response = await fetch(STATUS_URL, { cache: "no-store", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Status unavailable");
      const data = await response.json();
      const count = Number(data.players_online);
      if (!Number.isFinite(count) || count < 0) throw new Error("Invalid player count");
      number.textContent = Math.floor(count).toLocaleString();
      badge.dataset.state = "live";
      badge.title = "Live count of players connected to the online game server";
    } catch {
      number.textContent = "—";
      badge.dataset.state = "unavailable";
      badge.title = "Player count temporarily unavailable";
    }
  }

  function start() {
    ensureBadge();
    refresh();
    window.setInterval(refresh, INTERVAL_MS);
    const observer = new MutationObserver(() => ensureBadge());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();