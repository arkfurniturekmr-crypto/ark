/* ==========================================================================
   ARK FURNITURE — LIGHTBOX GALLERY
   --------------------------------------------------------------------------
   Turns any group of images sharing a "data-gallery" attribute into a
   fullscreen lightbox with zoom, swipe, keyboard nav, and a close button.
   Restores the page's scroll position when closed.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <div class="lightbox-stage">
      <button class="lightbox-close" aria-label="Close">&#10005;</button>
      <button class="lightbox-nav prev" aria-label="Previous image">&#10094;</button>
      <img src="" alt="Product image" />
      <button class="lightbox-nav next" aria-label="Next image">&#10095;</button>
      <div class="lightbox-counter"></div>
    </div>`;
  document.body.appendChild(overlay);

  const stage = overlay.querySelector(".lightbox-stage");
  const imgEl = overlay.querySelector("img");
  const counterEl = overlay.querySelector(".lightbox-counter");
  const closeBtn = overlay.querySelector(".lightbox-close");
  const prevBtn = overlay.querySelector(".lightbox-nav.prev");
  const nextBtn = overlay.querySelector(".lightbox-nav.next");

  let currentGroup = [];
  let currentIndex = 0;
  let savedScrollY = 0;

  function groupsOnPage() {
    const groups = {};
    document.querySelectorAll("[data-gallery]").forEach(el => {
      const key = el.dataset.gallery;
      (groups[key] = groups[key] || []).push(el);
    });
    return groups;
  }

  function open(groupKey, index) {
    const groups = groupsOnPage();
    currentGroup = groups[groupKey] || [];
    currentIndex = index;
    savedScrollY = window.scrollY;
    render();
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    imgEl.classList.remove("is-zoomed");
    window.scrollTo({ top: savedScrollY });
  }

  function render() {
    const el = currentGroup[currentIndex];
    const fullSrc = el.dataset.full || el.getAttribute("href") || el.querySelector("img")?.src;
    imgEl.src = fullSrc;
    imgEl.classList.remove("is-zoomed");
    counterEl.textContent = `${currentIndex + 1} / ${currentGroup.length}`;
  }

  function go(delta) {
    currentIndex = (currentIndex + delta + currentGroup.length) % currentGroup.length;
    render();
  }

  // Delegate clicks: any element with data-gallery opens the lightbox
  document.addEventListener("click", e => {
    const trigger = e.target.closest("[data-gallery]");
    if (!trigger) return;
    e.preventDefault();
    const groups = groupsOnPage();
    const key = trigger.dataset.gallery;
    const index = groups[key].indexOf(trigger);
    open(key, index);
  });

  closeBtn.addEventListener("click", close);
  nextBtn.addEventListener("click", () => go(1));
  prevBtn.addEventListener("click", () => go(-1));
  overlay.addEventListener("click", e => {
    if (e.target === overlay) close();
  });

  imgEl.addEventListener("click", () => imgEl.classList.toggle("is-zoomed"));

  // Keyboard support
  document.addEventListener("keydown", e => {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  });

  // Touch swipe support
  let touchStartX = 0;
  stage.addEventListener("touchstart", e => (touchStartX = e.touches[0].clientX), { passive: true });
  stage.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) go(dx > 0 ? -1 : 1);
  }, { passive: true });
});
