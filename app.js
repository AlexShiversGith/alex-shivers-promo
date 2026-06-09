(function () {
  const root = document.documentElement;
  const viewportMobileMq = window.matchMedia("(max-width: 767px)");
  const viewportTabletMq = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
  const touchMq = window.matchMedia("(pointer: coarse)");

  function updateViewportClass() {
    root.classList.remove("viewport-mobile", "viewport-tablet", "viewport-desktop");

    if (viewportMobileMq.matches) {
      root.classList.add("viewport-mobile");
    } else if (viewportTabletMq.matches) {
      root.classList.add("viewport-tablet");
    } else {
      root.classList.add("viewport-desktop");
    }

    root.classList.toggle("device-touch", touchMq.matches);
  }

  updateViewportClass();
  viewportMobileMq.addEventListener("change", updateViewportClass);
  viewportTabletMq.addEventListener("change", updateViewportClass);
  touchMq.addEventListener("change", updateViewportClass);

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const scrollProgressBar = document.getElementById("scroll-progress-bar");
  const scrollProgressRoot = document.querySelector(".header-scroll-progress");

  function updateScrollProgress() {
    if (!scrollProgressBar) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;

    scrollProgressBar.style.width = percent + "%";

    if (scrollProgressRoot) {
      scrollProgressRoot.setAttribute("aria-valuenow", String(Math.round(percent)));
    }
  }

  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const backdrop = document.getElementById("nav-backdrop");
  let navFocusTrap = false;

  function getNavFocusable() {
    if (!nav) return [];
    return Array.from(
      nav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
  }

  function setNavOpen(open) {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", open  ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    navFocusTrap = open;
    if (backdrop) {
      backdrop.hidden = !open;
      backdrop.classList.toggle("is-visible", open);
    }
    if (open) {
      const links = getNavFocusable();
      if (links[0]) links[0].focus();
    } else {
      navToggle.focus();
    }
  }

  const desktopMq = window.matchMedia("(min-width: 1024px)");
  const snapSections = document.querySelectorAll(".snap-section");
  let snapObserver = null;

  function initSnapScroll() {
    const docRoot = document.documentElement;

    if (!desktopMq.matches || !snapSections.length) {
      docRoot.classList.remove("snap-desktop");
      snapSections.forEach(function (section) {
        section.classList.remove("is-inview");
      });
      if (snapObserver) {
        snapObserver.disconnect();
        snapObserver = null;
      }
      return;
    }

    docRoot.classList.add("snap-desktop");

    if (!snapObserver) {
      snapObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.intersectionRatio >= 0.45) {
              entry.target.classList.add("is-inview");
            } else if (entry.intersectionRatio < 0.2) {
              entry.target.classList.remove("is-inview");
            }
          });
        },
        { threshold: [0, 0.2, 0.45, 0.65] }
      );
    } else {
      snapObserver.disconnect();
    }

    snapSections.forEach(function (section) {
      snapObserver.observe(section);
      if (section.getBoundingClientRect().top < window.innerHeight * 0.6) {
        section.classList.add("is-inview");
      }
    });
  }

  initSnapScroll();
  desktopMq.addEventListener("change", initSnapScroll);

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setNavOpen(!isOpen);
    });

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setNavOpen(false);
      });
    }

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setNavOpen(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setNavOpen(false);
      }

      if (!navFocusTrap || e.key !== "Tab") return;

      const focusable = getNavFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  const form = document.getElementById("order-form");
  const typeSelect = form && form.querySelector('[name="type"]');
  const serviceCards = document.querySelectorAll(".card--pickable[data-task-type]");
  const orderSection = document.getElementById("order");
  const formError = document.getElementById("form-error");
  const copyOrderBtn = document.getElementById("copy-order");
  let lastOrderText = "";

  const fieldLabels = {
    name: "Имя",
    contact: "Контакт",
    type: "Тип задачи",
    details: "Описание задачи",
  };

  function setActiveServiceCard(card) {
    serviceCards.forEach(function (item) {
      const isActive = card !== null && item === card;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function selectService(card) {
    const taskType = card.getAttribute("data-task-type");
    if (!taskType) return;

    setActiveServiceCard(card);

    if (typeSelect) {
      typeSelect.value = taskType;
    }

    if (orderSection) {
      orderSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  serviceCards.forEach(function (card) {
    card.addEventListener("click", function () {
      selectService(card);
    });

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectService(card);
      }
    });
  });

  if (typeSelect) {
    typeSelect.addEventListener("change", function () {
      const value = typeSelect.value;
      let matched = false;

      serviceCards.forEach(function (card) {
        if (card.getAttribute("data-task-type") === value) {
          setActiveServiceCard(card);
          matched = true;
        }
      });

      if (!matched) {
        setActiveServiceCard(null);
      }
    });
  }

  function clearFormErrors() {
    if (formError) {
      formError.hidden = true;
      formError.textContent = "";
    }
    if (!form) return;
    form.querySelectorAll(".field--invalid").forEach(function (field) {
      field.classList.remove("field--invalid");
    });
    form.querySelectorAll(".field-error").forEach(function (el) {
      el.hidden = true;
      el.textContent = "";
    });
  }

  function showFormErrors(errors) {
    if (formError && errors.length) {
      formError.hidden = false;
      formError.textContent = errors.length === 1 ? errors[0].message : "Заполните обязательные поля.";
    }

    errors.forEach(function (err) {
      const field = form && form.querySelector('[data-field="' + err.name + '"]');
      if (!field) return;
      field.classList.add("field--invalid");
      const fieldError = field.querySelector(".field-error");
      if (fieldError) {
        fieldError.hidden = false;
        fieldError.textContent = err.message;
      }
    });

    const firstInvalid = form && form.querySelector(".field--invalid input, .field--invalid select, .field--invalid textarea");
    if (firstInvalid) firstInvalid.focus();
  }

  function validateForm() {
    if (!form) return [];

    const fd = new FormData(form);
    const errors = [];

    ["name", "contact", "type", "details"].forEach(function (name) {
      const value = String(fd.get(name) || "").trim();
      if (!value) {
        errors.push({
          name: name,
          message: "Укажите «" + (fieldLabels[name] || name) + "»",
        });
      }
    });

    return errors;
  }

  function buildOrderText(name, contact, type, details) {
    return (
      "Новая заявка с сайта\n\n" +
      "Имя: " +
      name +
      "\n" +
      "Контакт: " +
      contact +
      "\n" +
      "Тип: " +
      type +
      "\n\n" +
      details
    );
  }

  function openTelegram(url, text) {
    lastOrderText = text;
    if (copyOrderBtn) copyOrderBtn.hidden = false;

    const opened = window.open(url, "_blank", "noopener,noreferrer");

    if (!opened && viewportMobileMq.matches) {
      window.location.href = url;
      return;
    }

    if (!opened && formError) {
      formError.hidden = false;
      formError.textContent =
        "Не удалось открыть Telegram. Нажмите «Скопировать текст заявки» и отправьте вручную.";
    }
  }

  if (copyOrderBtn) {
    copyOrderBtn.addEventListener("click", function () {
      if (!lastOrderText) return;

      navigator.clipboard.writeText(lastOrderText).then(
        function () {
          copyOrderBtn.textContent = "Скопировано!";
          setTimeout(function () {
            copyOrderBtn.textContent = "Скопировать текст заявки";
          }, 2000);
        },
        function () {
          if (formError) {
            formError.hidden = false;
            formError.textContent = "Скопируйте текст вручную из открытого окна Telegram.";
          }
        }
      );
    });
  }

  if (form) {
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", clearFormErrors);
      el.addEventListener("change", clearFormErrors);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFormErrors();

      const errors = validateForm();
      if (errors.length) {
        showFormErrors(errors);
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      let telegramUser = (btn && btn.getAttribute("data-telegram")) || "your_username";
      telegramUser = telegramUser.replace(/^@/, "");

      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const contact = String(fd.get("contact") || "").trim();
      const type = String(fd.get("type") || "").trim();
      const details = String(fd.get("details") || "").trim();

      const text = buildOrderText(name, contact, type, details);
      const url =
        "https://t.me/" + encodeURIComponent(telegramUser) + "?text=" + encodeURIComponent(text);

      openTelegram(url, text);
    });
  }

  const gmailLink = document.getElementById("gmail-contact");

  function isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function isMobileGmailDevice() {
    return viewportMobileMq.matches || touchMq.matches;
  }

  function buildGmailUrls(to, subject) {
    const webUrl =
      "https://mail.google.com/mail/?view=cm&fs=1&to=" +
      encodeURIComponent(to) +
      "&su=" +
      encodeURIComponent(subject);
    const mailtoUrl =
      "mailto:" + encodeURIComponent(to) + "?subject=" + encodeURIComponent(subject);
    const iosAppUrl =
      "googlegmail:///co?to=" +
      encodeURIComponent(to) +
      "&subject=" +
      encodeURIComponent(subject);
    const androidIntentUrl =
      "intent://send?to=" +
      encodeURIComponent(to) +
      "&subject=" +
      encodeURIComponent(subject) +
      "#Intent;scheme=mailto;package=com.google.android.gm;S.browser_fallback_url=" +
      encodeURIComponent(webUrl) +
      ";end";

    return { webUrl: webUrl, mailtoUrl: mailtoUrl, iosAppUrl: iosAppUrl, androidIntentUrl: androidIntentUrl };
  }

  function openWithAppFallback(appUrl, fallbackUrl, delayMs) {
    let timerId = null;
    let cancelled = false;

    function cancelFallback() {
      if (cancelled) return;
      cancelled = true;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    }

    function onVisibilityChange() {
      if (document.hidden) cancelFallback();
    }

    function onPageHide() {
      cancelFallback();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    window.location.href = appUrl;

    timerId = setTimeout(function () {
      timerId = null;
      if (!cancelled && !document.hidden) {
        window.location.href = fallbackUrl;
      }
      cancelFallback();
    }, delayMs || 1200);
  }

  function openGmailContact(link) {
    const to = link.getAttribute("data-gmail-to") || "";
    const subject = link.getAttribute("data-gmail-subject") || "";
    const urls = buildGmailUrls(to, subject);

    if (!isMobileGmailDevice()) {
      window.open(urls.webUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (isAndroid()) {
      window.location.href = urls.androidIntentUrl;
      return;
    }

    if (isIOS()) {
      openWithAppFallback(urls.iosAppUrl, urls.webUrl, 1200);
      return;
    }

    openWithAppFallback(urls.mailtoUrl, urls.webUrl, 800);
  }

  if (gmailLink) {
    gmailLink.addEventListener("click", function (e) {
      e.preventDefault();
      openGmailContact(gmailLink);
    });
  }
})();
