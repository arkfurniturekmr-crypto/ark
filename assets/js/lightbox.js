/* ==========================================================================
   ARK FURNITURE — LIGHTBOX GALLERY
   --------------------------------------------------------------------------
   Turns any group of links sharing a "data-gallery" attribute into a
   fullscreen viewer showing the ORIGINAL photo (uncropped), with zoom,
   swipe, keyboard navigation, a counter, and an "Enquire" shortcut.
   Restores the page's scroll position when closed.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Photo viewer");
  overlay.innerHTML = `
    <div class="lightbox-stage">
      <button class="lightbox-close" aria-label="Close">&#10005;</button>
      <button class="lightbox-nav prev" aria-label="Previous photo">&#10094;</button>
      <span class="lightbox-spinner" aria-hidden="true"></span>
      <img alt="" />
      <button class="lightbox-nav next" aria-label="Next photo">&#10095;</button>
      <div class="lightbox-meta">
        <span class="lightbox-name"></span>
        <span class="lightbox-counter"></span>
        <a class="lightbox-enquire" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Enquire</a>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const stage = overlay.querySelector(".lightbox-stage");
  const imgEl = overlay.querySelector("img");
  const nameEl = overlay.querySelector(".lightbox-name");
  const counterEl = overlay.querySelector(".lightbox-counter");
  const enquireEl = overlay.querySelector(".lightbox-enquire");
  const closeBtn = overlay.querySelector(".lightbox-close");
  const prevBtn = overlay.querySelector(".lightbox-nav.prev");
  const nextBtn = overlay.querySelector(".lightbox-nav.next");

  let groupKey = "";
  let currentIndex = 0;
  let savedScrollY = 0;

  // Always read the live list (so photos that finish loading later are
  // included), in photo-number order rather than on-screen column order.
  function groupFor(key) {
    return Array.from(document.querySelectorAll("[data-gallery]"))
      .filter(el => el.dataset.gallery === key)
      .sort((a, b) => Number(a.dataset.number || 0) - Number(b.dataset.number || 0));
  }
  function currentGroup() { return groupFor(groupKey); }

  function open(key, index) {
    groupKey = key;
    currentIndex = index;
    savedScrollY = window.scrollY;
    render();
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    imgEl.classList.remove("is-zoomed");
    imgEl.removeAttribute("src");
    window.scrollTo({ top: savedScrollY, behavior: "instant" });
  }

  function render() {
    const group = currentGroup();
    const el = group[currentIndex];
    if (!el) return;
    const fullSrc = el.dataset.full || el.getAttribute("href");
    const name = el.dataset.name || "";

    stage.classList.add("is-loading");
    imgEl.classList.remove("is-zoomed");
    imgEl.alt = name;
    imgEl.onload = () => stage.classList.remove("is-loading");
    imgEl.onerror = () => stage.classList.remove("is-loading");
    imgEl.src = fullSrc;

    nameEl.textContent = name;
    counterEl.textContent = `${currentIndex + 1} / ${group.length}`;
    enquireEl.style.display = name ? "" : "none";
    if (name && typeof arkWhatsappUrl === "function") {
      enquireEl.href = arkWhatsappUrl(
        `Hello ARK Furniture, I am interested in ${name}. Please share more details.`
      );
    }

    // Warm up the next photo, and ask the gallery for more when near the end.
    const next = group[(currentIndex + 1) % group.length];
    if (next && next !== el) new Image().src = next.dataset.full || next.getAttribute("href");
    if (currentIndex >= group.length - 3) window.dispatchEvent(new Event("ark-need-more"));
  }

  function go(delta) {
    const group = currentGroup();
    if (!group.length) return;
    const atEnd = currentIndex === group.length - 1;
    // Still fetching more photos? Wait for them instead of jumping to the start.
    if (delta > 0 && atEnd && window.arkGalleryPending && window.arkGalleryPending()) {
      window.dispatchEvent(new Event("ark-need-more"));
      return;
    }
    currentIndex = (currentIndex + delta + group.length) % group.length;
    render();
  }

  // Delegate clicks: any element with data-gallery opens the lightbox
  document.addEventListener("click", e => {
    const trigger = e.target.closest("[data-gallery]");
    if (!trigger) return;
    e.preventDefault();
    const key = trigger.dataset.gallery;
    open(key, groupFor(key).indexOf(trigger));
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
