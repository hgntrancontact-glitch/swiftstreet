// Render lưới sản phẩm từ data/products.js vào trang chủ
function renderProductGrid() {
  const grid = document.getElementById("product-grid");
  if (!grid || typeof PRODUCTS === "undefined") return;

  grid.innerHTML = PRODUCTS.map((p) => `
    <a class="product-card" href="products/${p.slug}.html">
      <div class="product-thumb">
        <span class="badge badge-orange">${p.badge}</span>
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p>${p.shortDesc}</p>
        <div class="product-price">
          <span class="price-current">${p.priceCurrent}</span>
          <span class="price-old">${p.priceOld}</span>
        </div>
      </div>
    </a>
  `).join("");
}

// Bật/tắt menu mobile
function setupNavToggle() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  if (!header || !toggle) return;

  toggle.addEventListener("click", () => {
    header.classList.toggle("nav-open");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProductGrid();
  setupNavToggle();
});
