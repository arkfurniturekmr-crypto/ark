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
      pause on hover, swipe on mobile.
      Slides are built from the files  hero-1, hero-2 ...  in
      assets/images/hero-slider/  (any image format; missing numbers are
      skipped). A photo whose shape does not suit the screen is shown whole
      over a soft blurred copy of itself instead of being cropped. */
function initHeroSlider() {
  const slider = document.querySelector(".hero-slider");
  if (!slider) return;

  const root = document.body.dataset.root || "";
  const dotsWrap = slider.querySelector(".hero-dots");
  const prevBtn = slider.querySelector(".hero-arrow.prev");
  const nextBtn = slider.querySelector(".hero-arrow.next");
  const caption = slider.querySelector(".hero-caption");
  const slides = [];
  const dots = [];
  let current = 0;
  let timer = null;
  const AUTOPLAY_MS = 5500;

  function updateControls() {
    const many = slides.length > 1;
    [prevBtn, nextBtn, dotsWrap].forEach(el => (el.style.display = many ? "" : "none"));
  }
  updateControls();

  /* Wide photos fill the screen; very different shapes are shown whole. */
  function fitSlide(slide, photo) {
    const stageRatio = slider.clientWidth / slider.clientHeight;
    const photoRatio = photo.w / photo.h;
    const mismatch = Math.max(stageRatio / photoRatio, photoRatio / stageRatio);
    slide.classList.toggle("is-contain", mismatch > 1.3);
  }

  function addSlide(photo) {
    const slide = document.createElement("div");
    slide.className = "hero-slide";

    const bg = document.createElement("div");
    bg.className = "hero-bg";
    bg.style.backgroundImage = `url("${photo.url}")`;

    const img = photo.img;
    img.alt = `ARK Furniture showroom slide ${slides.length + 1}`;
    img.draggable = false;

    slide.append(bg, img);
    slider.insertBefore(slide, caption);
    slide._photo = photo;
    fitSlide(slide, photo);

    const index = slides.length;
    slides.push(slide);

    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => { goTo(index); stop(); play(); });
    dotsWrap.appendChild(dot);
    dots.push(dot);

    if (index === 0) {
      slide.classList.add("is-active");
      dot.classList.add("is-active");
      restartKenBurns(slide);
    }
    updateControls();
    if (slides.length === 2) play();
  }

  function restartKenBurns(slide) {
    const img = slide.querySelector("img");
    if (!img) return;
    img.style.animation = "none";
    // eslint-disable-next-line no-unused-expressions
    img.offsetHeight; // force reflow to restart animation
    img.style.animation = "";
  }

  function goTo(index) {
    if (slides.length < 2) return;
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    restartKenBurns(slides[current]);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function play() { stop(); if (slides.length > 1) timer = setInterval(next, AUTOPLAY_MS); }
  function stop() { clearInterval(timer); }

  prevBtn.addEventListener("click", () => { prev(); stop(); play(); });
  nextBtn.addEventListener("click", () => { next(); stop(); play(); });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", play);

  window.addEventListener("resize", () => slides.forEach(s => fitSlide(s, s._photo)));

  // Touch swipe support
  let touchStartX = 0;
  slider.addEventListener("touchstart", e => (touchStartX = e.touches[0].clientX), { passive: true });
  slider.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { dx > 0 ? prev() : next(); stop(); play(); }
  }, { passive: true });

  // Find the photos: first slide immediately, the rest as they arrive (in order).
  const base = n => `${root}${ARK_HERO.folder}/${ARK_HERO.prefix}${n}`;
  (async () => {
    const first = await arkFindPhoto(base(1), "hero", root);
    const rest = [];
    for (let n = 2; n <= ARK_HERO.slots; n++) rest.push(arkFindPhoto(base(n), "hero", root));
    if (first) addSlide(first);
    for (const pending of rest) {
      const photo = await pending;
      if (photo) addSlide(photo);
    }
  })();
}

/* 7) Ripple effect on .btn clicks (delegated, so buttons added later work too) */
function initButtonRipple() {
  document.addEventListener("click", e => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
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
