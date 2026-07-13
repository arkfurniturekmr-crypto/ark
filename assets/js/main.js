/* ==========================================================================
   ARK FURNITURE — MAIN SITE SCRIPT
   Sections: 1) Inject WhatsApp/contact links  2) Mobile nav
   3) Header shadow on scroll  4) Scroll reveal animations
   5) Scroll-to-top button  6) Hero slider  7) Button ripple
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  injectContactDetails();
  initMobileNav();
  initHeaderScroll();
  initRevealAnimations();
  initScrollToTop();
  initHeroSlider();
  initButtonRipple();
  initBreadcrumbActiveNav();
});

/* 1) Fill in every element that references contact info from config.js,
      so phone numbers / email / WhatsApp / social links only need editing
      in ONE place (assets/js/config.js). */
function injectContactDetails() {
  document.querySelectorAll("[data-whatsapp-link]").forEach(el => {
    el.href = arkWhatsappUrl();
  });
  document.querySelectorAll("[data-email-link]").forEach(el => {
    el.href = `mailto:${ARK_CONFIG.email}`;
    if (el.dataset.emailLink === "text") el.textContent = ARK_CONFIG.email;
  });
  document.querySelectorAll("[data-instagram-link]").forEach(el => (el.href = ARK_CONFIG.instagramUrl));
  document.querySelectorAll("[data-facebook-link]").forEach(el => (el.href = ARK_CONFIG.facebookUrl));
  document.querySelectorAll("[data-maps-link]").forEach(el => (el.href = ARK_CONFIG.googleMapsLinkUrl));
  document.querySelectorAll("[data-maps-embed]").forEach(el => (el.src = ARK_CONFIG.googleMapsEmbedUrl));

  document.querySelectorAll("[data-address-text]").forEach(el => (el.textContent = ARK_CONFIG.address));

  document.querySelectorAll("[data-phone-list]").forEach(container => {
    container.innerHTML = ARK_CONFIG.phones
      .map(p => `<a href="tel:${p.replace(/\s+/g, "")}">${p}</a>`)
      .join("");
  });
}

/* 2) Mobile hamburger menu */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("is-open");
    nav.classList.toggle("is-open");
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      toggle.classList.remove("is-open");
      nav.classList.remove("is-open");
    });
  });
}

/* 3) Add shadow / compact header once the page scrolls */
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.style.boxShadow = window.scrollY > 20
      ? "0 4px 18px rgba(0,0,0,0.08)"
      : "0 2px 10px rgba(0,0,0,0.05)";
  });
}

/* 4) Fade/slide up elements as they enter the viewport */
function initRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach(el => observer.observe(el));
}

/* 5) Scroll-to-top floating button */
function initScrollToTop() {
  const btn = document.querySelector(".fab-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("is-visible", window.scrollY > 500);
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* 6) Hero Slider — cinematic fade + Ken Burns zoom, autoplay, arrows, dots,
      pause on hover, swipe on mobile. Images live in
      assets/images/hero-slider/ — just add/replace files there. */
function initHeroSlider() {
  const slider = document.querySelector(".hero-slider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dotsWrap = slider.querySelector(".hero-dots");
  const prevBtn = slider.querySelector(".hero-arrow.prev");
  const nextBtn = slider.querySelector(".hero-arrow.next");
  let current = 0;
  let timer = null;
  const AUTOPLAY_MS = 5500;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add("is-active");
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function restartKenBurns(slide) {
    const img = slide.querySelector("img");
    if (!img) return;
    img.style.animation = "none";
    // eslint-disable-next-line no-unused-expressions
    img.offsetHeight; // force reflow to restart animation
    img.style.animation = "";
  }

  function goTo(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    restartKenBurns(slides[current]);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function play() { timer = setInterval(next, AUTOPLAY_MS); }
  function stop() { clearInterval(timer); }

  prevBtn.addEventListener("click", () => { prev(); stop(); play(); });
  nextBtn.addEventListener("click", () => { next(); stop(); play(); });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", play);

  // Touch swipe support
  let touchStartX = 0;
  slider.addEventListener("touchstart", e => (touchStartX = e.touches[0].clientX), { passive: true });
  slider.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { dx > 0 ? prev() : next(); stop(); play(); }
  }, { passive: true });

  restartKenBurns(slides[0]);
  play();
}

/* 7) Ripple effect on .btn clicks */
function initButtonRipple() {
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });
}

/* Highlight the current page in the nav based on file name */
function initBreadcrumbActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(link => {
    const href = link.getAttribute("href");
    if (href && href.split("/").pop() === path) {
      link.classList.add("active");
    }
  });
}
