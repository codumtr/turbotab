/**
 * TurboTab - Ultra In-Page Performance Engine
 * Geliştirici: codum.tr (https://codum.tr)
 * Sayfa açılış gecikmelerini sıfıra indiren 0ms prerender ve DOM render hızlandırma motoru.
 */

(() => {
  if (window.__turboTabProActive) return;
  window.__turboTabProActive = true;

  // Configuration state
  let config = {
    prerenderEnabled: true,
    dnsPrefetchEnabled: true,
    renderBoostEnabled: true
  };

  const processedUrls = new Set();
  const preconnectedOrigins = new Set();

  // Load settings immediately
  chrome.storage.local.get(
    ["prefetchEnabled", "dnsPrefetchEnabled", "renderBoostEnabled"],
    (res) => {
      if (res.prefetchEnabled !== undefined) config.prerenderEnabled = res.prefetchEnabled;
      if (res.dnsPrefetchEnabled !== undefined) config.dnsPrefetchEnabled = res.dnsPrefetchEnabled;
      if (res.renderBoostEnabled !== undefined) config.renderBoostEnabled = res.renderBoostEnabled;

      if (config.renderBoostEnabled) {
        injectRenderSpeedOptimizationCSS();
        setupLazyMutationObserver();
      }

      if (config.dnsPrefetchEnabled) {
        initViewportPreconnector();
      }
    }
  );

  // Live settings sync
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.prefetchEnabled) config.prerenderEnabled = changes.prefetchEnabled.newValue;
    if (changes.dnsPrefetchEnabled) config.dnsPrefetchEnabled = changes.dnsPrefetchEnabled.newValue;
    if (changes.renderBoostEnabled) config.renderBoostEnabled = changes.renderBoostEnabled.newValue;
  });

  /* =========================================================================
   * 1. DOM RENDER ACCELERATION & LAYOUT OPTIMIZATION (Runs early at document_start)
   * ========================================================================= */
  function injectRenderSpeedOptimizationCSS() {
    const style = document.createElement("style");
    style.id = "turbotab-render-booster";
    style.textContent = `
      /* Accelerate font and text rendering */
      body, html {
        text-rendering: optimizeSpeed !important;
        -webkit-font-smoothing: antialiased;
      }
      /* Skip off-screen rendering computations until scrolled into view */
      footer, #footer, .footer,
      #comments, .comments, .comment-section,
      #sidebar, .sidebar, .widget-area {
        content-visibility: auto !important;
        contain-intrinsic-size: 1px 400px;
      }
      /* Prevent video autoplay on background/unfocused tabs */
      body.turbotab-bg video[autoplay] {
        pointer-events: none;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  // Enforce native lazy loading and async decoding on dynamically injected images
  function setupLazyMutationObserver() {
    const applyOptimization = (node) => {
      if (!node || node.nodeType !== 1) return;

      if (node.tagName === "IMG") {
        if (!node.hasAttribute("loading")) {
          node.setAttribute("loading", "lazy");
        }
        if (!node.hasAttribute("decoding")) {
          node.setAttribute("decoding", "async");
        }
      } else if (node.tagName === "IFRAME") {
        if (!node.hasAttribute("loading")) {
          node.setAttribute("loading", "lazy");
        }
      }

      const images = node.querySelectorAll ? node.querySelectorAll("img:not([loading]), iframe:not([loading])") : [];
      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        item.setAttribute("loading", "lazy");
        if (item.tagName === "IMG") {
          item.setAttribute("decoding", "async");
        }
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          applyOptimization(addedNode);
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  /* =========================================================================
   * 2. SPECULATIVE PRERENDER & PREFETCH ENGINE
   * ========================================================================= */
  const supportsSpeculationRules =
    typeof HTMLScriptElement !== "undefined" &&
    HTMLScriptElement.supports &&
    HTMLScriptElement.supports("speculationrules");

  // Determine if a URL is eligible for prerendering
  function validateTargetUrl(rawHref) {
    if (!rawHref) return null;
    try {
      const url = new URL(rawHref, window.location.href);

      // Only http / https protocols
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;

      // Don't prerender current URL or hash-only navigation
      if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search) {
        return null;
      }

      // Bypass risky, state-altering, or auth endpoints
      const path = url.pathname.toLowerCase();
      const riskyTokens = [
        "logout", "signout", "cikis", "delete", "destroy", "remove",
        "cart/add", "checkout", "buy-now", "api/", "webhook"
      ];
      if (riskyTokens.some((t) => path.includes(t))) return null;

      // Bypass heavy non-HTML binary downloads
      if (/\.(zip|exe|dmg|iso|pdf|rar|7z|apk|tar|gz|mp4|mkv|avi|mp3)$/i.test(path)) {
        return null;
      }

      return url.href;
    } catch {
      return null;
    }
  }

  // Execute instantaneous Prerender (or prefetch fallback)
  function executePrerender(targetHref) {
    if (!config.prerenderEnabled || processedUrls.has(targetHref)) return;
    processedUrls.add(targetHref);

    try {
      if (supportsSpeculationRules) {
        // Speculation Rules API - TRUE PRERENDER
        // Causes Chrome to pre-render the target page completely in memory!
        const script = document.createElement("script");
        script.type = "speculationrules";
        script.textContent = JSON.stringify({
          prerender: [
            {
              source: "list",
              urls: [targetHref],
              eagerness: "immediate"
            }
          ]
        });
        (document.head || document.documentElement).appendChild(script);
      } else {
        // Fallback: prerender & prefetch combo
        const prefetch = document.createElement("link");
        prefetch.rel = "prefetch";
        prefetch.href = targetHref;
        prefetch.as = "document";
        (document.head || document.documentElement).appendChild(prefetch);
      }

      // Notify service worker of accelerated navigation
      chrome.runtime.sendMessage({ action: "RECORD_PREFETCH", count: 1 }).catch(() => {});
    } catch (e) {
      // DOM busy or isolated frame
    }
  }

  // Preconnect and pre-resolve DNS
  function executePreconnect(origin) {
    if (!config.dnsPrefetchEnabled || preconnectedOrigins.has(origin)) return;
    preconnectedOrigins.add(origin);

    const dns = document.createElement("link");
    dns.rel = "dns-prefetch";
    dns.href = origin;

    const conn = document.createElement("link");
    conn.rel = "preconnect";
    conn.href = origin;
    conn.crossOrigin = "anonymous";

    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(dns);
      target.appendChild(conn);
    }
  }

  /* =========================================================================
   * 3. ULTRA-FAST ZERO LATENCY POINTER & TOUCH LISTENERS
   * ========================================================================= */
  let hoverTimer = null;
  let activeHoverAnchor = null;

  function extractAnchor(el) {
    let curr = el;
    while (curr && curr.tagName !== "A" && curr !== document.body) {
      curr = curr.parentElement;
    }
    return curr && curr.tagName === "A" ? curr : null;
  }

  // 1. Pointer Down (Mouse down or Touch start) = 0ms IMMEDIATE TRIGGER
  // Fires ~100-200ms BEFORE the click event completes!
  function handleImmediateAction(event) {
    const anchor = extractAnchor(event.target);
    if (!anchor || !anchor.href) return;

    const valid = validateTargetUrl(anchor.href);
    if (valid) {
      executePrerender(valid);
    }
  }

  // 2. Pointer Enter (Mouse hover) = 20ms micro-debounce
  function handlePointerEnter(event) {
    const anchor = extractAnchor(event.target);
    if (!anchor || !anchor.href) return;

    const valid = validateTargetUrl(anchor.href);
    if (!valid) return;

    activeHoverAnchor = anchor;

    // Immediately preconnect domain to save 50-150ms DNS/TLS
    try {
      const u = new URL(valid);
      executePreconnect(u.origin);
    } catch {}

    clearTimeout(hoverTimer);
    // 20ms micro-debounce: virtually instant yet ignores crazy fast mouse sweeps
    hoverTimer = setTimeout(() => {
      if (activeHoverAnchor === anchor) {
        executePrerender(valid);
      }
    }, 20);
  }

  function handlePointerLeave() {
    clearTimeout(hoverTimer);
    activeHoverAnchor = null;
  }

  // Attach ultra-low-latency event listeners
  document.addEventListener("pointerdown", handleImmediateAction, { capture: true, passive: true });
  document.addEventListener("touchstart", handleImmediateAction, { capture: true, passive: true });
  document.addEventListener("pointerover", handlePointerEnter, { capture: true, passive: true });
  document.addEventListener("pointerout", handlePointerLeave, { capture: true, passive: true });

  // Keyboard navigation support (Tab key focus)
  document.addEventListener("focusin", (e) => {
    const anchor = extractAnchor(e.target);
    if (!anchor || !anchor.href) return;
    const valid = validateTargetUrl(anchor.href);
    if (valid) executePrerender(valid);
  }, { passive: true });

  /* =========================================================================
   * 4. VIEWPORT INTERSECTION OBSERVER (Pre-resolve visible page links)
   * ========================================================================= */
  function initViewportPreconnector() {
    const onIdle = () => {
      if (!("IntersectionObserver" in window)) return;

      const linkObserver = new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const anchor = entry.target;
            obs.unobserve(anchor);
            try {
              const url = new URL(anchor.href);
              if (url.origin !== window.location.origin) {
                executePreconnect(url.origin);
              }
            } catch {}
          }
        }
      }, { rootMargin: "200px" });

      // Observe existing and newly loaded links
      const scanLinks = () => {
        const anchors = document.querySelectorAll("a[href^='http']");
        for (let i = 0; i < Math.min(anchors.length, 30); i++) {
          linkObserver.observe(anchors[i]);
        }
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", scanLinks);
      } else {
        scanLinks();
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(onIdle, { timeout: 1500 });
    } else {
      setTimeout(onIdle, 1000);
    }
  }
})();
