(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var backdrop = document.getElementById("nav-backdrop");

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

  var desktopMq = window.matchMedia("(min-width: 1024px)");
  var snapSections = document.querySelectorAll(".snap-section");
  var snapObserver = null;

  function initSnapScroll() {
    var root = document.documentElement;

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
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
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

  var wa = document.getElementById("wa-placeholder");
  if (wa) {
    wa.addEventListener("click", function (e) {
      e.preventDefault();
      alert("Укажите ссылку wa.me в index.html для кнопки WhatsApp.");
    });
  }

  var form = document.getElementById("order-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var telegramUser = (btn && btn.getAttribute("data-telegram")) || "your_username";
    telegramUser = telegramUser.replace(/^@/, "");

    var fd = new FormData(form);
    var name = String(fd.get("name") || "").trim();
    var contact = String(fd.get("contact") || "").trim();
    var type = String(fd.get("type") || "").trim();
    var details = String(fd.get("details") || "").trim();

    if (!name || !contact || !type || !details) {
      alert("Заполните все поля формы.");
      return;
    }

    var text =
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

    var url = "https://t.me/" + encodeURIComponent(telegramUser) + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener,noreferrer");
  });
})();
