(function () {
  var cfg =
    typeof window.SITE_CONFIG === "object" && window.SITE_CONFIG !== null
      ? window.SITE_CONFIG
      : {
          serverIp: "mc.rslover521minecraftserver.pro",
          liveMapUrl: "http://rslover521.duckdns.org:3876",
          blueMapUrl: "http://bluemap.rslover521minecraftserver.pro:12009/",
          discordUrl: "https://discord.gg/zJguWKyjDt",
          modpackUrl: "#",
          minecraftVersion: "1.20.1",
          forgeVersion: "47.4.0",
          liveMapImageSrc: "images/live-map.png",
        };

  function normalizeEmbedUrl(url) {
    if (!url) return "";
    var cleaned = String(url).trim();
    if (!cleaned) return "";

    // Avoid mixed-content blocking (https page embedding http iframe).
    if (window.location && window.location.protocol === "https:" && cleaned.indexOf("http://") === 0) {
      return "https://" + cleaned.slice("http://".length);
    }
    return cleaned;
  }

  function applySiteConfig() {
    var ip = cfg.serverIp || "";
    document.querySelectorAll(".js-server-ip").forEach(function (el) {
      el.textContent = ip;
    });

    var verLabel = document.querySelector(".js-version-label");
    if (verLabel && cfg.minecraftVersion && cfg.forgeVersion) {
      verLabel.textContent = "Minecraft " + cfg.minecraftVersion + ", Forge " + cfg.forgeVersion;
    }

    var mcBadge = document.querySelector(".js-mc-badge");
    if (mcBadge && cfg.minecraftVersion) {
      mcBadge.textContent = cfg.minecraftVersion;
    }
    var forgeBadge = document.querySelector(".js-forge-badge");
    if (forgeBadge && cfg.forgeVersion) {
      forgeBadge.textContent = cfg.forgeVersion;
    }

    var linkMap = {
      "live-map": cfg.liveMapUrl,
      "blue-map": cfg.blueMapUrl,
      discord: cfg.discordUrl,
      modpack: cfg.modpackUrl,
    };
    document.querySelectorAll("[data-link]").forEach(function (el) {
      var key = el.getAttribute("data-link");
      if (key && linkMap[key]) {
        el.setAttribute("href", linkMap[key]);
      }
    });

    var mapImg = document.querySelector("[data-live-map-img]");
    if (mapImg && cfg.liveMapImageSrc) {
      mapImg.src = cfg.liveMapImageSrc;
    }

    var blueMapEmbed = document.querySelector("[data-blue-map-embed]");
    var blueMapFallback = document.querySelector("[data-blue-map-fallback]");
    if (blueMapEmbed) {
      var url = normalizeEmbedUrl(cfg.blueMapUrl);
      if (url) {
        if (blueMapFallback) blueMapFallback.hidden = false;

        blueMapEmbed.addEventListener(
          "load",
          function () {
            if (blueMapFallback) blueMapFallback.hidden = true;
          },
          { once: true }
        );

        blueMapEmbed.setAttribute("src", url);
      }
    }
  }

  function initLiveMapFallback() {
    var img = document.querySelector("[data-live-map-img]");
    var fallback = document.querySelector("[data-live-map-fallback]");
    var frame = document.querySelector("[data-live-map-frame]");
    if (!img || !fallback || !frame) return;

    function showFallback() {
      img.style.display = "none";
      fallback.hidden = false;
      frame.classList.add("live-map-frame--fallback");
    }

    img.addEventListener("error", showFallback);
    if (img.complete && img.naturalWidth === 0) {
      showFallback();
    }
  }

  function copyServerIp(triggerBtn) {
    var ip = (cfg.serverIp || "").trim();
    if (!ip) return;

    function feedback() {
      if (!triggerBtn) return;
      var prev = triggerBtn.getAttribute("data-prev-label") || triggerBtn.textContent;
      if (!triggerBtn.hasAttribute("data-prev-label")) {
        triggerBtn.setAttribute("data-prev-label", prev);
      }
      triggerBtn.textContent = "Copied!";
      triggerBtn.classList.add("copied");
      window.setTimeout(function () {
        triggerBtn.textContent = triggerBtn.getAttribute("data-prev-label") || "Copy IP";
        triggerBtn.classList.remove("copied");
      }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ip).then(feedback).catch(function () {
        window.prompt("Copy this address:", ip);
      });
    } else {
      window.prompt("Copy this address:", ip);
    }
  }

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  applySiteConfig();
  initLiveMapFallback();

  document.querySelectorAll(".js-copy-ip").forEach(function (btn) {
    btn.addEventListener("click", function () {
      copyServerIp(btn);
    });
  });

  var carousels = document.querySelectorAll("[data-carousel]");
  if (carousels.length) {
    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    carousels.forEach(function (root) {
      var track = root.querySelector("[data-carousel-track]");
      var slides = root.querySelectorAll(".carousel-slide");
      var btnPrev = root.querySelector("[data-carousel-prev]");
      var btnNext = root.querySelector("[data-carousel-next]");
      var dots = root.querySelectorAll("[data-carousel-dot]");
      var counterCurrent = root.querySelector(".carousel-counter-current");
      var counterTotal = root.querySelector(".carousel-counter-total");
      var total = slides.length;
      if (!track || total === 0) return;

      var i = 0;
      var autoplayMs = 6500;
      var timer = null;

      if (counterTotal) {
        counterTotal.textContent = String(total);
      }

      track.style.width = total * 100 + "%";
      slides.forEach(function (slide) {
        slide.style.flex = "0 0 " + 100 / total + "%";
      });

      function setAria() {
        slides.forEach(function (slide, idx) {
          slide.setAttribute("aria-hidden", idx === i ? "false" : "true");
        });
        dots.forEach(function (dot, idx) {
          if (idx === i) {
            dot.setAttribute("aria-current", "true");
          } else {
            dot.removeAttribute("aria-current");
          }
        });
      }

      function apply() {
        track.style.transform = "translateX(-" + (100 * i) / total + "%)";
        if (counterCurrent) {
          counterCurrent.textContent = String(i + 1);
        }
        setAria();
      }

      function go(delta) {
        i = (i + delta + total) % total;
        apply();
      }

      function goTo(index) {
        i = ((index % total) + total) % total;
        apply();
      }

      function stopAutoplay() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      function startAutoplay() {
        stopAutoplay();
        if (reduceMotion || total < 2) return;
        timer = window.setInterval(function () {
          go(1);
        }, autoplayMs);
      }

      if (btnPrev)
        btnPrev.addEventListener("click", function () {
          go(-1);
          stopAutoplay();
          startAutoplay();
        });
      if (btnNext)
        btnNext.addEventListener("click", function () {
          go(1);
          stopAutoplay();
          startAutoplay();
        });

      dots.forEach(function (dot, idx) {
        dot.addEventListener("click", function () {
          goTo(idx);
          stopAutoplay();
          startAutoplay();
        });
      });

      root.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
          stopAutoplay();
          startAutoplay();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
          stopAutoplay();
          startAutoplay();
        }
      });

      root.setAttribute("tabindex", "0");
      root.addEventListener("focusin", stopAutoplay);
      root.addEventListener("focusout", function () {
        window.setTimeout(startAutoplay, 0);
      });
      root.addEventListener("mouseenter", stopAutoplay);
      root.addEventListener("mouseleave", startAutoplay);

      apply();
      startAutoplay();
    });
  }
})();
