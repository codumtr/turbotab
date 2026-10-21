/**
 * TurboTab PRO - Popup Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  // UI Elements
  const statPrefetched = document.getElementById("statPrefetched");
  const statDiscarded = document.getElementById("statDiscarded");
  const statRam = document.getElementById("statRam");

  const togglePrefetch = document.getElementById("togglePrefetch");
  const toggleRenderBoost = document.getElementById("toggleRenderBoost");
  const toggleDns = document.getElementById("toggleDns");
  const toggleBloat = document.getElementById("toggleBloat");
  const toggleSuspend = document.getElementById("toggleSuspend");
  const selectSuspendMinutes = document.getElementById("selectSuspendMinutes");
  const suspendTimerRow = document.getElementById("suspendTimerRow");

  const btnBoost = document.getElementById("btnBoost");
  const boostResult = document.getElementById("boostResult");
  const btnWhitelistCurrent = document.getElementById("btnWhitelistCurrent");
  const whitelistBtnText = document.getElementById("whitelistBtnText");

  // Load current settings & stats
  const data = await chrome.storage.local.get([
    "prefetchEnabled",
    "renderBoostEnabled",
    "dnsPrefetchEnabled",
    "tabSuspendEnabled",
    "suspendMinutes",
    "bloatBlockerEnabled",
    "whitelist",
    "stats"
  ]);

  // Set toggle values
  togglePrefetch.checked = data.prefetchEnabled ?? true;
  toggleRenderBoost.checked = data.renderBoostEnabled ?? true;
  toggleDns.checked = data.dnsPrefetchEnabled ?? true;
  toggleBloat.checked = data.bloatBlockerEnabled ?? true;
  toggleSuspend.checked = data.tabSuspendEnabled ?? true;
  selectSuspendMinutes.value = String(data.suspendMinutes ?? 10);

  updateSuspendRowVisibility();
  renderStats(data.stats);

  // Event Listeners for toggles
  togglePrefetch.addEventListener("change", (e) => {
    chrome.storage.local.set({ prefetchEnabled: e.target.checked });
  });

  toggleRenderBoost.addEventListener("change", (e) => {
    chrome.storage.local.set({ renderBoostEnabled: e.target.checked });
  });

  toggleDns.addEventListener("change", (e) => {
    chrome.storage.local.set({ dnsPrefetchEnabled: e.target.checked });
  });

  toggleBloat.addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    chrome.storage.local.set({ bloatBlockerEnabled: isChecked });
    chrome.runtime.sendMessage({ action: "TOGGLE_BLOAT_BLOCKER", enabled: isChecked });
  });

  toggleSuspend.addEventListener("change", (e) => {
    chrome.storage.local.set({ tabSuspendEnabled: e.target.checked });
    updateSuspendRowVisibility();
  });

  selectSuspendMinutes.addEventListener("change", (e) => {
    chrome.storage.local.set({ suspendMinutes: parseInt(e.target.value, 10) });
  });

  function updateSuspendRowVisibility() {
    suspendTimerRow.style.opacity = toggleSuspend.checked ? "1" : "0.4";
    selectSuspendMinutes.disabled = !toggleSuspend.checked;
  }

  function renderStats(stats) {
    const s = stats || { prefetchedCount: 0, discardedTabsCount: 0, savedRamMb: 0 };
    statPrefetched.textContent = s.prefetchedCount.toLocaleString();
    statDiscarded.textContent = s.discardedTabsCount.toLocaleString();

    if (s.savedRamMb >= 1024) {
      statRam.textContent = (s.savedRamMb / 1024).toFixed(1) + " GB";
    } else {
      statRam.textContent = s.savedRamMb + " MB";
    }
  }

  // Turbo Boost button handler
  btnBoost.addEventListener("click", async () => {
    btnBoost.disabled = true;
    const originalText = btnBoost.innerHTML;
    btnBoost.innerHTML = `<span>Hızlandırılıyor...</span>`;

    try {
      const response = await chrome.runtime.sendMessage({ action: "TURBO_BOOST" });
      const freedTabs = response?.freedTabs || 0;
      const freedRamMb = response?.freedRamMb || 0;

      boostResult.classList.remove("hidden");
      if (freedTabs > 0) {
        boostResult.textContent = `🚀 ${freedTabs} arka plan sekmesi uyutuldu, ~${freedRamMb} MB bellek serbest bırakıldı!`;
      } else {
        boostResult.textContent = `⚡ Sekmeler optimize edildi, aktif sekme en yüksek öncelikte.`;
      }

      const refreshed = await chrome.storage.local.get("stats");
      renderStats(refreshed.stats);
    } catch (err) {
      boostResult.classList.remove("hidden");
      boostResult.textContent = "İşlem tamamlandı.";
    } finally {
      setTimeout(() => {
        btnBoost.disabled = false;
        btnBoost.innerHTML = originalText;
      }, 700);
    }
  });

  // Current domain whitelist handling
  let currentDomain = null;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.startsWith("http")) {
      const parsedUrl = new URL(tab.url);
      currentDomain = parsedUrl.hostname.replace(/^www\./, "");
      checkWhitelistStatus(data.whitelist || [], currentDomain);
    } else {
      btnWhitelistCurrent.style.display = "none";
    }
  } catch (e) {
    btnWhitelistCurrent.style.display = "none";
  }

  function checkWhitelistStatus(whitelist, domain) {
    if (!domain) return;
    const isWhitelisted = whitelist.some((item) => domain.includes(item));
    if (isWhitelisted) {
      btnWhitelistCurrent.classList.add("active");
      whitelistBtnText.textContent = `🛡️ ${domain} Korumada (Korumayı Kaldır)`;
    } else {
      btnWhitelistCurrent.classList.remove("active");
      whitelistBtnText.textContent = `🛡️ ${domain} Sitesini Korumaya Al (Asla Uyutma)`;
    }
  }

  btnWhitelistCurrent.addEventListener("click", async () => {
    if (!currentDomain) return;
    const cur = await chrome.storage.local.get("whitelist");
    let list = cur.whitelist || [];

    const isWhitelisted = list.some((item) => currentDomain.includes(item));
    if (isWhitelisted) {
      list = list.filter((item) => !currentDomain.includes(item));
    } else {
      list.push(currentDomain);
    }

    await chrome.storage.local.set({ whitelist: list });
    checkWhitelistStatus(list, currentDomain);
  });

  // codum.tr promotional link handlers
  const openCodum = (e) => {
    if (e) e.preventDefault();
    chrome.tabs.create({ url: "https://codum.tr" });
  };

  const codumPromoLink = document.getElementById("codumPromoLink");
  if (codumPromoLink) {
    codumPromoLink.addEventListener("click", openCodum);
    codumPromoLink.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        openCodum(e);
      }
    });
  }

  const codumFooterLink = document.getElementById("codumFooterLink");
  if (codumFooterLink) {
    codumFooterLink.addEventListener("click", openCodum);
  }
});
