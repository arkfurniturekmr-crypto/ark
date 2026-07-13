/* ==========================================================================
   ARK FURNITURE — PRODUCT PAGINATION
   --------------------------------------------------------------------------
   Paginates any .product-grid at PAGE_SIZE products per page.
   TO ADD MORE PRODUCTS LATER: just copy an existing .product-card block
   inside the .product-grid on a category page and edit its content —
   this script will automatically re-paginate and add extra page buttons.
   ========================================================================== */

const PAGE_SIZE = 12;

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".product-grid");
  const paginationEl = document.querySelector(".pagination");
  if (!grid || !paginationEl) return;

  const cards = Array.from(grid.children);
  const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
  let page = 1;

  function renderPage() {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    cards.forEach((card, i) => {
      card.style.display = i >= start && i < end ? "" : "none";
    });
    renderPagination();
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderPagination() {
    paginationEl.innerHTML = "";

    const prev = document.createElement("button");
    prev.textContent = "‹ Prev";
    prev.disabled = page === 1;
    prev.addEventListener("click", () => { page--; renderPage(); });
    paginationEl.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === page) btn.classList.add("is-active");
      btn.addEventListener("click", () => { page = i; renderPage(); });
      paginationEl.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "Next ›";
    next.disabled = page === totalPages;
    next.addEventListener("click", () => { page++; renderPage(); });
    paginationEl.appendChild(next);
  }

  if (totalPages <= 1) {
    paginationEl.style.display = "none";
  }
  renderPage();
});
