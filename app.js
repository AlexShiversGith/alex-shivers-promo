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

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const backdrop = document.getElementById("nav-backdrop");

  function setNavOpen(open) {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    if (backdrop) {
      backdrop.hidden = !open;
      backdrop.classList.toggle("is-visible", open);
    }
  }

  const desktopMq = window.matchMedia("(min-width: 1024px)");
  const snapSections = document.querySelectorAll(".snap-section");
  let snapObserver = null;

  function initSnapScroll() {
    const root = document.documentElement;

    if (!desktopMq.matches || !snapSections.length) {
      root.classList.remove("snap-desktop");
      snapSections.forEach(function (section) {
        section.classList.remove("is-inview");
      });
      if (snapObserver) {
        snapObserver.disconnect();
        snapObserver = null;
      }
      return;
    }

    root.classList.add("snap-desktop");

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
  }

  const wa = document.getElementById("wa-placeholder");
  if (wa) {
    wa.addEventListener("click", function (e) {
      e.preventDefault();
      alert("Укажите ссылку wa.me в index.html для кнопки WhatsApp.");
    });
  }

  const form = document.getElementById("order-form");
  const typeSelect = form && form.querySelector('[name="type"]');
  const serviceCards = document.querySelectorAll(".card--pickable[data-task-type]");
  const orderSection = document.getElementById("order");

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

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    let telegramUser = (btn && btn.getAttribute("data-telegram")) || "your_username";
    telegramUser = telegramUser.replace(/^@/, "");

    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const contact = String(fd.get("contact") || "").trim();
    const type = String(fd.get("type") || "").trim();
    const details = String(fd.get("details") || "").trim();

    if (!name || !contact || !type || !details) {
      alert("Заполните все поля формы.");
      return;
    }

    const text =
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
      details;

    const url =
      "https://t.me/" + encodeURIComponent(telegramUser) + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener,noreferrer");
  });
})();
