(() => {
  const replace = value => typeof value === "string"
    ? value.replace(/World of ClaudeCraft/g, "Forgotten Lands")
           .replace(/ClaudeCraft/g, "Forgotten Lands")
    : value;
  const attrs = ["title", "aria-label", "alt", "content", "placeholder"];
  function patch(el) {
    if (!el) return;
    if (el.nodeType === Node.TEXT_NODE) {
      const next = replace(el.nodeValue);
      if (next !== el.nodeValue) el.nodeValue = next;
      return;
    }
    if (el.nodeType !== Node.ELEMENT_NODE && el.nodeType !== Node.DOCUMENT_NODE) return;
    if (el.nodeType === Node.ELEMENT_NODE) {
      for (const name of attrs) {
        if (el.hasAttribute(name)) {
          const old = el.getAttribute(name), next = replace(old);
          if (next !== old) el.setAttribute(name, next);
        }
      }
      if (el.tagName === "TITLE") el.textContent = replace(el.textContent);
    }
    for (const child of el.childNodes) patch(child);
  }
  patch(document.documentElement);
  const hideOldFooterLinks = root => {
    const patterns = [/wishlist on steam/i, /open source project/i, /join the discord/i, /^donate$/i];
    const nodes = root && root.querySelectorAll ? root.querySelectorAll("a,button,[role='link']") : [];
    for (const node of nodes) {
      const label = (node.innerText || node.textContent || "").trim().replace(/\\s+/g, " ");
      if (patterns.some(pattern => pattern.test(label))) {
        const target = node.closest("li, .footer-link, .footer-item, .social-link, .nav-item") || node;
        target.style.display = "none";
      }
    }
  };
  hideOldFooterLinks(document);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "characterData") patch(record.target);
      else if (record.type === "attributes") patch(record.target);
      else for (const node of record.addedNodes) {
        patch(node);
        if (node.nodeType === Node.ELEMENT_NODE) hideOldFooterLinks(node);
      }
      hideOldFooterLinks(document);
    }
  });
  observer.observe(document.documentElement, {
    subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: attrs
  });
  document.title = replace(document.title);
})();