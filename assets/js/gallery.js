/* ==========================================================================
   ARK FURNITURE — PHOTO GALLERIES
   --------------------------------------------------------------------------
   1) Collection pages: builds an adaptive "masonry" gallery from the photos
      found in assets/images/products/<folder>/. Every photo keeps its own
      original shape (portrait, landscape, square, panorama) — nothing is
      cropped or stretched — and clicking one opens the ORIGINAL file.
   2) Homepage: fills each collection tile with that collection's first photo.

   Photo counts / names come from collections.js. Photo formats are handled
   by image-loader.js.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.body.dataset.root || "";
  if (document.querySelector("[data-gallery-page]")) initGalleryPage(root);
  if (document.querySelector("[data-cover]")) initCovers(root);
});

/* ---------------------------------------------------------------- gallery */
function initGalleryPage(root) {
  const collection = ARK_COLLECTIONS.find(c => c.slug === document.body.dataset.collection);
  const galleryEl = document.querySelector("[data-gallery-page]");
  const statusEl = document.querySelector(".gallery-status");
  const sentinel = document.querySelector(".gallery-sentinel");
  if (!collection || !galleryEl) return;

  const TOTAL_SLOTS = collection.photos + collection.spare;
  const BATCH = 6;              // photos fetched per step
  const LOOKAHEAD_PX = 1100;    // start fetching the next batch this early

  let cursor = 1;               // next photo number to look for
  let loading = false;
  let columns = [];
  let columnCount = 0;
  const items = [];             // placed photo cards, in order

  /* ---- columns: 3 on desktop, 2 on tablet, 1 on phone (same as before) ---- */
  const wantedColumns = () => (window.innerWidth > 1024 ? 3 : window.innerWidth > 720 ? 2 : 1);

  function buildColumns(n) {
    galleryEl.textContent = "";
    galleryEl.style.setProperty("--cols", n);
    columns = Array.from({ length: n }, () => {
      const col = document.createElement("div");
      col.className = "gallery-col";
      galleryEl.appendChild(col);
      return col;
    });
    columnCount = n;
  }

  /* Put a card in the currently shortest column (keeps columns balanced
     no matter what shape each photo is). */
  function place(card) {
    let target = columns[0];
    let shortest = Infinity;
    columns.forEach(col => {
      const h = col.offsetHeight;
      if (h < shortest) { shortest = h; target = col; }
    });
    target.appendChild(card);
  }

  function relayoutIfNeeded() {
    const n = wantedColumns();
    if (n === columnCount) return;
    buildColumns(n);
    items.forEach(place);
  }

  /* ---- one photo card ---- */
  function makeCard(photo, number) {
    const label = `${collection.name} ${number}`;

    const card = document.createElement("figure");
    card.className = "photo-card is-new";

    const link = document.createElement("a");
    link.className = "photo-link";
    link.href = photo.url;                       // the original file
    link.dataset.gallery = collection.slug;
    link.dataset.full = photo.url;
    link.dataset.name = label;
    link.dataset.number = number;                // keeps the viewer in photo order
    link.setAttribute("aria-label", `View ${label}`);

    const img = photo.img;                       // already loaded — reuse it
    img.alt = `${label} — ARK Furniture`;
    img.width = photo.w;
    img.height = photo.h;
    img.draggable = false;
    link.appendChild(img);

    const info = document.createElement("figcaption");
    info.className = "photo-info";
    const title = document.createElement("h3");
    title.textContent = label;
    const enquire = document.createElement("a");
    enquire.className = "btn btn-sm";
    enquire.target = "_blank";
    enquire.rel = "noopener";
    enquire.href = arkWhatsappUrl(
      `Hello ARK Furniture, I am interested in ${label}. Please share more details.`
    );
    enquire.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Enquire';
    info.append(title, enquire);

    card.append(link, info);
    return card;
  }

  /* ---- load photos in order, a few at a time ---- */
  async function loadBatch() {
    if (loading || cursor > TOTAL_SLOTS) return;
    loading = true;
    const from = cursor;
    const to = Math.min(cursor + BATCH - 1, TOTAL_SLOTS);
    cursor = to + 1;

    const numbers = [];
    for (let n = from; n <= to; n++) numbers.push(n);
    const results = await Promise.all(
      numbers.map(n => arkFindPhoto(arkPhotoBase(root, collection, n), collection.slug, root))
    );

    relayoutIfNeeded();
    results.forEach((photo, i) => {
      if (!photo) return;                        // empty slot — stays hidden
      const card = makeCard(photo, numbers[i]);
      items.push(card);
      place(card);
    });

    loading = false;
    if (cursor > TOTAL_SLOTS) finish();
    else maybeLoadMore();
  }

  function finish() {
    if (items.length === 0) {
      statusEl.className = "gallery-status is-empty";
      statusEl.innerHTML =
        '<i class="fa-regular fa-image"></i>' +
        `<h3>${collection.name} photos are coming soon</h3>` +
        "<p>Message us on WhatsApp and we will share the latest designs with you.</p>" +
        `<a href="${arkWhatsappUrl()}" target="_blank" rel="noopener" class="btn"><i class="fa-brands fa-whatsapp"></i> Chat With Us</a>`;
    } else {
      statusEl.className = "gallery-status is-done";
      statusEl.textContent = `${items.length} ${items.length === 1 ? "photo" : "photos"}`;
    }
  }

  function maybeLoadMore() {
    if (loading || cursor > TOTAL_SLOTS) return;
    const top = sentinel.getBoundingClientRect().top;
    if (top - window.innerHeight < LOOKAHEAD_PX) loadBatch();
  }

  // Let the lightbox ask for more photos while someone flips through them.
  window.arkGalleryPending = () => loading || cursor <= TOTAL_SLOTS;
  window.addEventListener("ark-need-more", () => { if (!loading) loadBatch(); });

  window.addEventListener("scroll", maybeLoadMore, { passive: true });
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { relayoutIfNeeded(); maybeLoadMore(); }, 150);
  });

  buildColumns(wantedColumns());
  statusEl.className = "gallery-status is-loading";
  statusEl.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Loading photos…</span>';
  loadBatch();
}

/* ------------------------------------------------------- homepage covers */
function initCovers(root) {
  document.querySelectorAll("[data-cover]").forEach(async tile => {
    const collection = ARK_COLLECTIONS.find(c => c.slug === tile.dataset.cover);
    if (!collection) return;

    // The cover is the collection's first photo (tries photo 1, 2, 3).
    let photo = null;
    for (let n = 1; n <= 3 && !photo; n++) {
      photo = await arkFindPhoto(arkPhotoBase(root, collection, n), collection.slug, root);
    }

    if (!photo) { tile.classList.add("no-photo"); return; }

    // Soft blurred copy fills the tile; the full photo sits on top, uncropped.
    const bg = document.createElement("div");
    bg.className = "cover-bg";
    bg.style.backgroundImage = `url("${photo.url}")`;

    const img = photo.img;
    img.alt = `${collection.name} collection`;
    img.draggable = false;

    tile.prepend(bg, img);
    requestAnimationFrame(() => tile.classList.add("has-photo"));
  });
}
