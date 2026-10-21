/**
 * TurboTab - Background Service Worker
 * Geliştirici: codum.tr (https://codum.tr)
 * Chromium motor seviyesinde sekme yönetimi, bellek geri kazanımı ve ağ optimizasyonu.
 */

const DEFAULT_SETTINGS = {
  prefetchEnabled: true,
  dnsPrefetchEnabled: true,
  tabSuspendEnabled: true,
  renderBoostEnabled: true,
  bloatBlockerEnabled: true,
  suspendMinutes: 10,
  whitelist: [
    "youtube.com",
    "spotify.com",
    "twitch.tv",
    "netflix.com",
    "mail.google.com",
    "web.whatsapp.com"
  ],
  stats: {
    prefetchedCount: 0,
    discardedTabsCount: 0,
    savedRamMb: 0
  }
};

// Memory map of tabId -> last interaction timestamp
const tabLastActive = new Map();

// Initialize on installation or startup
chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(null);
  const toSet = {};

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (current[key] === undefined) {
      toSet[key] = value;
    }
  }

  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }

  // Enforce Chrome internal network prediction
  enableBrowserNetworkPredictor();

  // Run idle tab cleaner every 2 minutes for tight memory control
  chrome.alarms.create("turboTabIdleAlarm", { periodInMinutes: 2 });
  console.log("TurboTab (codum.tr) Service Worker devrede. Derin optimizasyon motoru aktif.");
});

// Force enable Chromium network prediction service
function enableBrowserNetworkPredictor() {
  if (chrome.privacy && chrome.privacy.network && chrome.privacy.network.networkPredictionEnabled) {
    chrome.privacy.network.networkPredictionEnabled.set({ value: true }, () => {
      if (chrome.runtime.lastError) {
        // Controlled by policy or unsupported
      } else {
        console.log("Native Chrome Network Predictor activated.");
      }
    });
  }
}

// Ensure settings applied on browser restart
chrome.runtime.onStartup.addListener(() => {
  enableBrowserNetworkPredictor();
});

// Alarm trigger
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "turboTabIdleAlarm") {
    cleanIdleTabs();
  }
});

// Track active tab changes
chrome.tabs.onActivated.addListener(({ tabId }) => {
  tabLastActive.set(tabId, Date.now());
});

// Free tab entry on removal
chrome.tabs.onRemoved.addListener((tabId) => {
  tabLastActive.delete(tabId);
});

// Auto-clean idle tabs to release RAM and CPU for the active tab
async function cleanIdleTabs() {
  const settings = await chrome.storage.local.get([
    "tabSuspendEnabled",
    "suspendMinutes",
    "whitelist",
    "stats"
  ]);

  if (!settings.tabSuspendEnabled) return;

  const maxIdleMs = (settings.suspendMinutes || 10) * 60 * 1000;
  const now = Date.now();
  const tabs = await chrome.tabs.query({});
  const whitelist = settings.whitelist || [];

  let count = 0;

  for (const tab of tabs) {
    if (!isTabEligibleForDiscard(tab, whitelist)) continue;

    const lastSeen = tabLastActive.get(tab.id) || now;
    if (now - lastSeen >= maxIdleMs) {
      try {
        await chrome.tabs.discard(tab.id);
        count++;
      } catch (e) {
        // Tab busy or pinned
      }
    }
  }

  if (count > 0) {
    const stats = settings.stats || { prefetchedCount: 0, discardedTabsCount: 0, savedRamMb: 0 };
    stats.discardedTabsCount += count;
    stats.savedRamMb += count * 90; // ~90MB per Chromium process
    await chrome.storage.local.set({ stats });
  }
}

function isTabEligibleForDiscard(tab, whitelist) {
  if (tab.active) return false;
  if (tab.discarded) return false;
  if (tab.pinned) return false;
  if (tab.audible) return false; // Never pause background music / video
  if (!tab.url) return false;

  const urlLower = tab.url.toLowerCase();
  if (
    urlLower.startsWith("chrome://") ||
    urlLower.startsWith("edge://") ||
    urlLower.startsWith("chrome-extension://") ||
    urlLower.startsWith("about:") ||
    urlLower.startsWith("devtools://")
  ) {
    return false;
  }

  try {
    const parsed = new URL(tab.url);
    const host = parsed.hostname.toLowerCase();
    for (const item of whitelist) {
      if (host.includes(item.toLowerCase())) return false;
    }
  } catch {
    return false;
  }

  return true;
}

// Immediate Turbo Boost
async function executeImmediateBoost() {
  const settings = await chrome.storage.local.get(["whitelist", "stats"]);
  const whitelist = settings.whitelist || [];
  const tabs = await chrome.tabs.query({});

  let count = 0;
  for (const tab of tabs) {
    if (isTabEligibleForDiscard(tab, whitelist)) {
      try {
        await chrome.tabs.discard(tab.id);
        count++;
      } catch (e) {}
    }
  }

  const stats = settings.stats || { prefetchedCount: 0, discardedTabsCount: 0, savedRamMb: 0 };
  stats.discardedTabsCount += count;
  stats.savedRamMb += count * 95;
  await chrome.storage.local.set({ stats });

  return { freedTabs: count, freedRamMb: count * 95 };
}

// Handle incoming messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "TURBO_BOOST") {
    executeImmediateBoost().then(sendResponse);
    return true;
  }

  if (message.action === "RECORD_PREFETCH") {
    chrome.storage.local.get("stats").then((res) => {
      const stats = res.stats || { prefetchedCount: 0, discardedTabsCount: 0, savedRamMb: 0 };
      stats.prefetchedCount += (message.count || 1);
      chrome.storage.local.set({ stats });
    });
    sendResponse({ ok: true });
    return false;
  }

  if (message.action === "TOGGLE_BLOAT_BLOCKER") {
    const enable = !!message.enabled;
    chrome.declarativeNetRequest.updateEnabledRulesets({
      [enable ? "enableRulesetIds" : "disableRulesetIds"]: ["ruleset_1"]
    }).then(() => sendResponse({ ok: true }));
    return true;
  }
});
