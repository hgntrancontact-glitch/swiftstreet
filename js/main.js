/**
 * Icon SVG dùng cho mini-dashboard mô phỏng trong thẻ sản phẩm (không phải ảnh chụp thật).
 */
const DASH_ICONS = {
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.9-10-9.3C.4 8.2 2 4.5 5.6 4a5 5 0 0 1 6.4 2 5 5 0 0 1 6.4-2c3.6.5 5.2 4.2 3.6 7.7C19.5 16.1 12 21 12 21Z"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 5 18.5V20M15 6.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19 20v-1.5a3 3 0 0 0-2-2.8M16 3.7a3 3 0 0 1 0 5.8"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/><path d="M2.5 3h2l2.3 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H5.5"/></svg>',
};

/** Ánh xạ field `type` của sản phẩm (data/products.js) sang icon tương ứng trong DASH_ICONS. */
const PRODUCT_TYPE_ICON = {
  drive: "folder",
  wedding: "heart",
  finance: "trend",
  content: "calendar",
  hr: "users",
  order: "cart",
};

/**
 * Toàn bộ trang HTML đều include js/main.js, nhưng nằm ở 3 cấp thư mục khác
 * nhau (gốc / products / footer-pages) — hàm này trả về tiền tố "../" phù hợp
 * để build đường dẫn tới ảnh/trang khác mà không phải sửa tay từng trang.
 */
function getRootPrefix() {
  const path = location.pathname;
  return path.includes("/products/") || path.includes("/footer-pages/") ? "../" : "";
}

/** Trả về HTML mini-dashboard mô phỏng theo loại sản phẩm (dữ liệu mẫu, không phải số liệu thật). */
function renderDashboard(type) {
  switch (type) {
    case "drive":
      return `
        <div class="dash-title">${DASH_ICONS.folder}<span>Drive Overview</span></div>
        <div class="dash-stats">
          <div class="dash-stat"><span>Tổng file</span><b>12.456</b><em class="up">+12,5%</em></div>
          <div class="dash-stat"><span>Thư mục</span><b>1.248</b><em class="up">+8,3%</em></div>
          <div class="dash-stat"><span>Dung lượng</span><b>256,8GB</b><em class="up">+5,7%</em></div>
        </div>
        <div class="dash-row">
          <div class="dash-donut" style="background:conic-gradient(var(--dash-accent) 0 45%, var(--dash-accent-2) 45% 75%, var(--dash-accent-3) 75% 100%)"></div>
          <ul class="dash-list">
            <li><b>bao-cao-q3.pdf</b><span>2p trước</span></li>
            <li><b>content-plan.xlsx</b><span>10p trước</span></li>
          </ul>
        </div>`;

    case "wedding":
      return `
        <div class="dash-title">${DASH_ICONS.heart}<span>Wedding Planner</span></div>
        <div class="dash-stats">
          <div class="dash-stat"><span>Đếm ngược</span><b>D-120</b></div>
          <div class="dash-stat"><span>Công việc</span><b>32/45</b><em class="up">71%</em></div>
          <div class="dash-stat"><span>Khách mời</span><b>186</b></div>
        </div>
        <div class="dash-row">
          <div class="dash-progress">
            <div class="dash-progress-top"><span>Ngân sách</span><b>45,5tr / 63tr</b></div>
            <div class="dash-progress-track"><div class="dash-progress-fill" style="width:72%"></div></div>
          </div>
        </div>`;

    case "finance":
      return `
        <div class="dash-title">${DASH_ICONS.trend}<span>Finance Tracker</span></div>
        <div class="dash-stats">
          <div class="dash-stat"><span>Tổng thu</span><b>125tr</b><em class="up">+19,2%</em></div>
          <div class="dash-stat"><span>Tổng chi</span><b>78,5tr</b><em class="down">-8,7%</em></div>
          <div class="dash-stat"><span>Lợi nhuận</span><b>46,5tr</b><em class="up">+22,1%</em></div>
        </div>
        <div class="dash-row">
          <div class="dash-donut" style="background:conic-gradient(var(--dash-accent) 0 40%, var(--dash-accent-2) 40% 70%, var(--dash-accent-3) 70% 100%)"></div>
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" style="flex:1; height:44px;">
            <polyline points="0,32 15,26 30,30 45,18 60,22 75,10 100,14" style="fill:none; stroke:var(--dash-accent); stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round;" />
          </svg>
        </div>`;

    case "content": {
      const on = new Set([3, 9, 14, 17]);
      const on2 = new Set([6, 12]);
      let cells = "";
      for (let i = 0; i < 21; i++) {
        const cls = on.has(i) ? "on" : on2.has(i) ? "on2" : "";
        cells += `<i class="${cls}"></i>`;
      }
      return `
        <div class="dash-title">${DASH_ICONS.calendar}<span>Content Planner</span></div>
        <div class="dash-stats">
          <div class="dash-stat"><span>Bài viết</span><b>128</b></div>
          <div class="dash-stat"><span>Đã đăng</span><b>86</b><em class="up">67%</em></div>
          <div class="dash-stat"><span>Lên lịch</span><b>32</b></div>
        </div>
        <div class="dash-calendar">${cells}</div>`;
    }

    case "hr":
      return `
        <div class="dash-title">${DASH_ICONS.users}<span>HR Attendance</span></div>
        <div class="dash-stats">
          <div class="dash-stat"><span>Đi làm</span><b>47</b><em class="up">81%</em></div>
          <div class="dash-stat"><span>Vắng mặt</span><b>6</b><em class="down">10%</em></div>
          <div class="dash-stat"><span>Đi muộn</span><b>5</b><em class="down">9%</em></div>
        </div>
        <div class="dash-row">
          <div class="dash-donut" style="background:conic-gradient(var(--dash-accent) 0 81%, var(--dash-accent-3) 81% 100%)"></div>
          <div class="dash-bars">
            <i style="height:60%"></i><i style="height:80%"></i><i class="muted" style="height:35%"></i>
            <i style="height:90%"></i><i style="height:70%"></i><i style="height:85%"></i><i class="muted" style="height:40%"></i>
          </div>
        </div>`;

    case "order":
      return `
        <div class="dash-title">${DASH_ICONS.cart}<span>Order Management</span></div>
        <div class="dash-stats">
          <div class="dash-stat"><span>Tổng đơn</span><b>235</b></div>
          <div class="dash-stat"><span>Đang xử lý</span><b>68</b></div>
          <div class="dash-stat"><span>Đã huỷ</span><b>25</b><em class="down">11%</em></div>
        </div>
        <div class="dash-table">
          <div class="row"><b>#ORD-1001</b><span class="dash-pill done">Đã giao</span></div>
          <div class="row"><b>#ORD-1002</b><span class="dash-pill pending">Đang xử lý</span></div>
          <div class="row"><b>#ORD-1003</b><span class="dash-pill cancel">Đã huỷ</span></div>
        </div>`;

    default:
      return "";
  }
}

// Render lưới sản phẩm từ data/products.js — mỗi thẻ mô phỏng preview kiểu khung laptop
function renderProductGrid() {
  const grid = document.getElementById("product-grid");
  if (!grid || typeof PRODUCTS === "undefined") return;

  grid.innerHTML = PRODUCTS.map((p) => `
    <div class="product-card">
      <a class="product-card-link" href="products/${p.slug}.html">
        <div class="product-thumb">
          <span class="badge badge-orange">${p.badge}</span>
          <div class="device-screen">
            <div class="device-display">${renderDashboard(p.type)}</div>
          </div>
          <div class="device-base"></div>
        </div>
        <div class="product-body">
          <h3>${p.name}</h3>
          <div class="product-price">
            <span class="price-current">${p.priceCurrent}</span>
            <span class="price-old">${p.priceOld}</span>
          </div>
        </div>
      </a>
      <div class="product-card-actions">
        <button type="button" class="btn btn-outline btn-sm" data-add-to-cart="${p.slug}">Thêm giỏ hàng</button>
        <a class="btn btn-dark btn-sm" href="thanh-toan.html?slug=${p.slug}">Mua ngay</a>
      </div>
    </div>
  `).join("");
}

/**
 * Giỏ hàng dùng localStorage — lưu tạm trên máy khách, không cần đăng nhập/backend.
 * Mỗi phần tử: { slug, name, price, priceOld (số), shortDesc, type, qty, selected }.
 * `selected` quyết định sản phẩm có được tính vào tổng tiền/đưa sang trang
 * thanh toán khi bấm "Mua ngay" trong giỏ hàng hay không (mặc định true).
 */
const CART_STORAGE_KEY = "swiftstreet_cart";

function parsePriceVN(str) {
  return parseInt(String(str).replace(/[^\d]/g, ""), 10) || 0;
}

function formatPriceVN(num) {
  return num.toLocaleString("vi-VN") + "đ";
}

function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const cart = raw ? JSON.parse(raw) : [];
    // selected mặc định true cho giỏ hàng cũ lưu trước khi có field này.
    return Array.isArray(cart) ? cart.map((item) => ({ selected: true, ...item })) : [];
  } catch (e) {
    return [];
  }
}

function setCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  syncCartUI();
}

/**
 * Thêm sản phẩm vào giỏ. Nếu sản phẩm đã có sẵn, KHÔNG tăng số lượng (mỗi sản
 * phẩm luôn chỉ có đúng 1 dòng trong giỏ) — chỉ báo lại bằng bảng trượt trái.
 */
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.slug === product.slug);
  if (existing) {
    showSlideToast("Sản phẩm này đã có trong giỏ hàng");
    return;
  }
  cart.push({
    slug: product.slug,
    name: product.name,
    price: parsePriceVN(product.priceCurrent),
    priceOld: parsePriceVN(product.priceOld),
    shortDesc: product.shortDesc || "",
    type: product.type,
    qty: 1,
    selected: true,
  });
  setCart(cart);
  showSlideToast(`Đã thêm "${product.name}" vào giỏ hàng`);
}

function removeFromCart(slug) {
  setCart(getCart().filter((item) => item.slug !== slug));
}

function toggleCartItemSelected(slug) {
  const cart = getCart();
  const item = cart.find((i) => i.slug === slug);
  if (item) item.selected = !item.selected;
  setCart(cart);
}

function toggleSelectAllCart() {
  const cart = getCart();
  const allSelected = cart.every((item) => item.selected);
  cart.forEach((item) => (item.selected = !allSelected));
  setCart(cart);
}

function updateCartBadge(cart) {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll(".icon-btn .icon-dot").forEach((dot) => {
    if (count > 0) {
      dot.textContent = count > 9 ? "9+" : String(count);
      dot.classList.add("show");
    } else {
      dot.textContent = "";
      dot.classList.remove("show");
    }
  });
}

/** Đồng bộ badge số lượng ở icon giỏ hàng header theo localStorage hiện tại. */
function syncCartUI() {
  updateCartBadge(getCart());
}

/** Gắn sự kiện cho nút "Thêm giỏ hàng" (icon giỏ hàng ở header giờ là link thẳng sang trang thanh toán). */
function setupCartActions() {
  document.body.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add-to-cart]");
    if (addBtn) {
      e.preventDefault();
      const slug = addBtn.dataset.addToCart;
      const product = typeof PRODUCTS !== "undefined" ? PRODUCTS.find((p) => p.slug === slug) : null;
      if (product) addToCart(product);
      return;
    }
  });
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

/** Modal "Hỗ trợ" — thông tin liên hệ + mã QR Zalo (ảnh thật, dùng chung với footer). */
function buildSupportModalHTML() {
  const prefix = getRootPrefix();
  return `
    <div class="modal-head">
      <h3>Thông tin hỗ trợ kỹ thuật</h3>
      <button class="modal-close" data-modal-close aria-label="Đóng">×</button>
    </div>
    <p style="font-size:14px; color:var(--text-muted); margin-bottom:16px;">Đội ngũ Swiftstreet luôn sẵn sàng hỗ trợ bạn qua email hoặc Zalo.</p>
    <div class="modal-support-row"><b>Email</b><span>hgntran.contact@gmail.com</span></div>
    <div class="modal-support-row"><b>Zalo</b><span>Quét mã bên dưới</span></div>
    <div style="display:flex; justify-content:center; margin:16px 0 4px;">
      <img src="${prefix}assets/img/zalo-qr.png" alt="Mã QR Zalo Swiftstreet" style="width:150px; height:150px; border-radius:8px; border:1px solid var(--border-color);" />
    </div>
    <button class="btn btn-dark btn-block" data-modal-close style="margin-top:16px;">Đóng</button>`;
}

/** Modal "FAQ" — bản rút gọn 5 câu hỏi tiêu biểu nhất, link sang trang FAQ đầy đủ. */
function buildFaqModalHTML() {
  const prefix = getRootPrefix();
  const items = [
    ["Mua một lần thì dùng được trong bao lâu?", "Tất cả sản phẩm trên Swiftstreet đều áp dụng mô hình mua một lần, sử dụng trọn đời, không phát sinh phí định kỳ."],
    ["Sau khi thanh toán, tôi nhận sản phẩm như thế nào?", "Chúng tôi gửi thông tin đơn hàng và đường dẫn sử dụng qua email bạn đã đăng ký, ngay sau khi đơn được xác nhận."],
    ["Dữ liệu của tôi có được bảo mật không?", "Mọi dữ liệu nằm trong tài khoản Google Drive của chính bạn — chúng tôi không lưu trữ hay truy cập được."],
    ["Thanh toán bằng cách nào?", "Chuyển khoản ngân hàng qua mã QR hiển thị ngay tại trang thanh toán."],
    ["Tôi có thể yêu cầu hoàn tiền không?", "Có, tuỳ từng trường hợp cụ thể — xem chi tiết tại trang Chính sách đổi trả."],
  ];

  const itemsHTML = items.map(([q, a], i) => `
    <details class="faq-item"${i === 0 ? " open" : ""}>
      <summary>${q}</summary>
      <p>${a}</p>
    </details>
  `).join("");

  return `
    <div class="modal-head">
      <h3>Câu hỏi thường gặp</h3>
      <button class="modal-close" data-modal-close aria-label="Đóng">×</button>
    </div>
    ${itemsHTML}
    <a href="${prefix}footer-pages/cau-hoi-thuong-gap.html" class="btn btn-outline btn-block" style="margin-top:16px;">Xem tất cả câu hỏi</a>`;
}

/** 10 đánh giá giả lập cho modal "Đánh giá Swiftstreet" — email che một phần, sao xen kẽ 4-5. */
const REVIEWS = [
  { email: "tr********ork@gmail.com", rating: 5, comment: "Dùng SwiftCopy.Drive sao chép hồ sơ khách hàng nhanh gấp nhiều lần, tiết kiệm cả buổi làm việc." },
  { email: "an********99@gmail.com", rating: 4, comment: "Giao diện dễ dùng, chỉ mong có thêm hướng dẫn video chi tiết hơn." },
  { email: "mi**********le@gmail.com", rating: 5, comment: "File Wedding Planner rất chi tiết, mình dùng để chuẩn bị đám cưới đỡ rối hẳn." },
  { email: "hu***********an@gmail.com", rating: 5, comment: "Giá hợp lý, mua 1 lần dùng lâu dài, không lo phí gia hạn." },
  { email: "th*******12@gmail.com", rating: 4, comment: "Sản phẩm tốt, nhận file qua email hơi chậm một chút nhưng vẫn ổn." },
  { email: "lin**********rk@gmail.com", rating: 5, comment: "Hỗ trợ nhiệt tình khi mình nhắn Zalo hỏi cách dùng." },
  { email: "kh***********88@gmail.com", rating: 5, comment: "SwiftTrack Finance giúp mình theo dõi chi tiêu rõ ràng hơn hẳn so với ghi tay." },
  { email: "ng************99@gmail.com", rating: 4, comment: "Công cụ hữu ích, cần thêm vài mẫu báo cáo có sẵn thì sẽ hoàn hảo hơn." },
  { email: "ph**********ng@gmail.com", rating: 5, comment: "Đặt hàng xong nhận file rất nhanh, đúng như mô tả." },
  { email: "vu*******an@gmail.com", rating: 4, comment: "Ổn trong tầm giá, sẽ ủng hộ thêm sản phẩm khác của Swiftstreet." },
];

function renderStars(rating) {
  return `<span class="stars"><span class="star-filled">${"★".repeat(rating)}</span><span class="star-empty">${"★".repeat(5 - rating)}</span></span>`;
}

/** Modal "Đánh giá Swiftstreet": danh sách đánh giá giả lập + khu vực để khách tự đánh giá. */
function buildRateModalHTML() {
  const reviewsHTML = REVIEWS.map((r) => `
    <div class="review-item">
      <div class="review-item-head">
        <span class="review-email">${r.email}</span>
        ${renderStars(r.rating)}
      </div>
      <p class="review-comment">${r.comment}</p>
    </div>
  `).join("");

  const starsPicker = [1, 2, 3, 4, 5].map((n) => `<button type="button" class="rate-star-btn" data-star="${n}" aria-label="${n} sao">★</button>`).join("");

  return `
    <div class="modal-head">
      <h3>Đánh giá Swiftstreet</h3>
      <button class="modal-close" data-modal-close aria-label="Đóng">×</button>
    </div>
    <div class="review-list">${reviewsHTML}</div>
    <div class="rate-your-section">
      <p class="rate-your-label">Để lại đánh giá của bạn</p>
      <div class="rate-picker" id="rate-picker">${starsPicker}</div>
      <div class="rate-feedback" id="rate-feedback">
        <label for="rate-feedback-text">Nội dung ý kiến phản hồi</label>
        <textarea id="rate-feedback-text" placeholder="Nhập trải nghiệm thực tế của bạn tại đây..."></textarea>
      </div>
      <div class="rate-actions">
        <button type="button" class="btn btn-cancel-gray" id="rate-cancel-btn">Không phải bây giờ</button>
        <button type="button" class="btn rate-submit-btn" id="rate-submit-btn">Gửi đánh giá</button>
      </div>
    </div>`;
}

/** Gắn tương tác cho modal đánh giá: chọn sao → hiện ô nhập, gửi/bỏ qua → đóng modal. */
function setupRateModalActions() {
  document.body.addEventListener("click", (e) => {
    const starBtn = e.target.closest(".rate-star-btn");
    if (starBtn) {
      const val = parseInt(starBtn.dataset.star, 10);
      document.querySelectorAll(".rate-star-btn").forEach((b) => {
        b.classList.toggle("active", parseInt(b.dataset.star, 10) <= val);
      });
      const feedback = document.getElementById("rate-feedback");
      if (feedback) feedback.classList.add("show");
      return;
    }

    if (e.target.closest("#rate-submit-btn")) {
      closeModals();
      showToast("Cảm ơn bạn đã gửi đánh giá!");
      return;
    }

    if (e.target.closest("#rate-cancel-btn")) {
      closeModals();
    }
  });
}

/** Nội dung modal: hỗ trợ, FAQ rút gọn, đánh giá Swiftstreet. */
const MODAL_CONTENT = {
  support: buildSupportModalHTML(),
  faq: buildFaqModalHTML(),
  rate: buildRateModalHTML(),
};

let modalOverlayEl = null;

/** Đóng dropdown thông báo + menu hỗ trợ nổi (dùng khi mở modal hoặc bấm ra ngoài). */
function closeDropdowns() {
  const notify = document.getElementById("notify-dropdown");
  if (notify) notify.classList.remove("show");
  const supportMenu = document.getElementById("support-fab-menu");
  if (supportMenu) supportMenu.classList.remove("show");
}

function openModal(name) {
  const content = MODAL_CONTENT[name];
  if (!content || !modalOverlayEl) return;
  const modal = document.getElementById("modal-" + name);
  if (!modal) return;
  closeDropdowns();
  modalOverlayEl.classList.add("show");
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModals() {
  if (!modalOverlayEl) return;
  modalOverlayEl.classList.remove("show");
  document.querySelectorAll(".modal.show").forEach((m) => m.classList.remove("show"));
  document.body.style.overflow = "";
}

/** Chèn khung modal vào cuối trang và gắn sự kiện cho các icon/nút liên quan. */
function setupModals() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "modal-overlay";

  const wrap = document.createElement("div");
  wrap.innerHTML = Object.keys(MODAL_CONTENT).map((name) => `
    <div class="modal" id="modal-${name}">${MODAL_CONTENT[name]}</div>
  `).join("");

  document.body.appendChild(overlay);
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  modalOverlayEl = overlay;

  overlay.addEventListener("click", closeModals);
  document.body.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) closeModals();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModals();
      closeDropdowns();
    }
  });

  document.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(btn.dataset.modal);
    });
  });
}

/** Bảng nhỏ trượt từ mép trái, tự ẩn sau 2 giây — dùng cho xác nhận "Thêm giỏ hàng". */
function showSlideToast(message) {
  let toast = document.getElementById("swiftstreet-slide-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "swiftstreet-slide-toast";
    toast.className = "cart-slide-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

/** Toast nhỏ tự ẩn sau vài giây (dùng cho "Báo lỗi"). */
function showToast(message) {
  let toast = document.getElementById("swiftstreet-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "swiftstreet-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

/** Dropdown 3 mục (Hỗ trợ/FAQ/Báo lỗi) khi bấm nút hỗ trợ nổi. */
function setupSupportFab() {
  const trigger = document.getElementById("support-fab-trigger");
  const menu = document.getElementById("support-fab-menu");
  if (!trigger || !menu) return;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const notify = document.getElementById("notify-dropdown");
    if (notify) notify.classList.remove("show");
    menu.classList.toggle("show");
  });

  menu.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => menu.classList.remove("show"));
  });

  const reportBtn = menu.querySelector("[data-report-bug]");
  if (reportBtn) {
    reportBtn.addEventListener("click", () => {
      menu.classList.remove("show");
      showToast("Hiện tại chúng tôi chưa hỗ trợ tính năng này.");
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".support-fab")) menu.classList.remove("show");
  });
}

/** 5 thông báo mẫu: khuyến mãi đang diễn ra, sản phẩm mới, tính năng mới. */
const NOTIFICATIONS = [
  { title: "Giảm 20% toàn bộ sản phẩm — chỉ đến 30/07/2026", time: "Vừa xong" },
  { title: "SwiftOrder Group chính thức ra mắt", time: "1 ngày trước" },
  { title: "SwiftHR Attendance: xuất phiếu lương chỉ 1 click", time: "2 ngày trước" },
  { title: "SwiftCopy.Drive tăng tốc độ sao chép file lớn", time: "3 ngày trước" },
  { title: "SwiftContent Planner có mặt trên Swiftstreet", time: "4 ngày trước" },
];

/** Dropdown thông báo neo dưới icon chuông (không dùng chung hệ modal-overlay). */
function setupNotifyDropdown() {
  const trigger = document.getElementById("notify-trigger");
  const dropdown = document.getElementById("notify-dropdown");
  const list = document.getElementById("notify-dropdown-list");
  if (!trigger || !dropdown || !list) return;

  list.innerHTML = NOTIFICATIONS.map((n) => `
    <div class="notify-item">
      <p>${n.title}</p>
      <span>${n.time}</span>
    </div>
  `).join("");

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const supportMenu = document.getElementById("support-fab-menu");
    if (supportMenu) supportMenu.classList.remove("show");
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".notify-wrap")) dropdown.classList.remove("show");
  });
}

/** Sinh mã đơn hàng ngẫu nhiên (vd "SS4821") — dùng làm nội dung chuyển khoản để admin đối chiếu tay. */
function generateOrderCode() {
  return "SS" + Math.floor(1000 + Math.random() * 9000);
}

/**
 * Danh sách sản phẩm cần thanh toán trên thanh-toan.html:
 * - Có `?slug=` trên URL → mua 1 sản phẩm cụ thể (không qua giỏ hàng, không đổi giỏ hàng thật).
 * - Không có `?slug=` → lấy các sản phẩm đang được TICK CHỌN trong giỏ hàng.
 */
function getCheckoutItems() {
  const slug = new URLSearchParams(location.search).get("slug");
  if (slug) {
    const product = typeof PRODUCTS !== "undefined" ? PRODUCTS.find((p) => p.slug === slug) : null;
    if (!product) return [];
    return [{
      slug: product.slug,
      name: product.name,
      price: parsePriceVN(product.priceCurrent),
      priceOld: parsePriceVN(product.priceOld),
      shortDesc: product.shortDesc || "",
      type: product.type,
      qty: 1,
      selected: true,
    }];
  }
  return getCart().filter((item) => item.selected);
}

/** Chỉ SwiftCopy.Drive đã có trang chi tiết thật — các sản phẩm khác chưa link được. */
const CHECKOUT_LINKABLE_SLUGS = ["swiftcopy-drive"];

/** Render trang thanh-toan.html (chỉ chạy nếu trang hiện tại có #checkout-product-list). */
function setupCheckoutPage() {
  const list = document.getElementById("checkout-product-list");
  if (!list) return;

  const isSingleSlug = !!new URLSearchParams(location.search).get("slug");
  const orderCode = generateOrderCode();
  const orderCodeEl = document.getElementById("checkout-order-code");
  if (orderCodeEl) orderCodeEl.textContent = orderCode;

  const selectAllRow = document.getElementById("checkout-select-all");
  const selectAllCircle = document.getElementById("checkout-select-all-circle");
  if (selectAllRow) selectAllRow.style.display = isSingleSlug ? "none" : "flex";

  function render() {
    // Chế độ nhiều sản phẩm: hiển thị TOÀN BỘ giỏ hàng (kể cả sản phẩm đang bỏ
    // chọn) để khách vẫn thấy và có thể tick lại — chỉ sản phẩm được chọn mới
    // tính vào "Cần thanh toán". Chế độ 1 sản phẩm dùng getCheckoutItems() như cũ.
    const items = isSingleSlug ? getCheckoutItems() : getCart();
    const mainEl = document.getElementById("checkout-main");
    const emptyEl = document.getElementById("checkout-empty");

    if (!items.length) {
      if (mainEl) mainEl.style.display = "none";
      if (emptyEl) emptyEl.style.display = "block";
      return;
    }
    if (mainEl) mainEl.style.display = "";
    if (emptyEl) emptyEl.style.display = "none";

    if (selectAllCircle) selectAllCircle.classList.toggle("checked", items.every((item) => item.selected));

    list.innerHTML = items.map((item) => {
      const nameHTML = CHECKOUT_LINKABLE_SLUGS.includes(item.slug)
        ? `<a href="${getRootPrefix()}products/${item.slug}.html" class="checkout-item-name-link">${item.name}</a>`
        : `<b class="checkout-item-name">${item.name}</b>`;
      return `
      <div class="checkout-item-row${!isSingleSlug && !item.selected ? " is-unselected" : ""}">
        ${isSingleSlug ? "" : `<button class="cart-item-select${item.selected ? " checked" : ""}" data-checkout-toggle-select="${item.slug}" aria-label="Chọn sản phẩm"></button>`}
        <div class="checkout-item-content">
          <div class="checkout-item-name-row">
            ${nameHTML}
            ${isSingleSlug ? "" : `
              <button class="cart-item-delete" data-checkout-remove="${item.slug}" aria-label="Xoá">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7"/></svg>
              </button>`}
          </div>
          ${item.shortDesc ? `<p class="cart-item-desc">${item.shortDesc}</p>` : ""}
          <div class="item-price-stack">
            <span class="cart-price-current">${formatPriceVN(item.price)}</span>
            ${item.priceOld > item.price ? `<span class="cart-price-old">${formatPriceVN(item.priceOld)}</span>` : ""}
          </div>
        </div>
      </div>`;
    }).join("");

    const calcItems = items.filter((item) => item.selected);
    const subtotalOld = calcItems.reduce((sum, item) => sum + (item.priceOld > item.price ? item.priceOld : item.price) * item.qty, 0);
    const total = calcItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = subtotalOld - total;

    const subtotalEl = document.getElementById("checkout-subtotal");
    const discountEl = document.getElementById("checkout-discount");
    const totalEl = document.getElementById("checkout-total");
    if (subtotalEl) subtotalEl.textContent = formatPriceVN(subtotalOld);
    if (discountEl) discountEl.textContent = "-" + formatPriceVN(discount);
    if (totalEl) totalEl.textContent = formatPriceVN(total);
  }

  render();

  list.addEventListener("click", (e) => {
    const removeBtn = e.target.closest("[data-checkout-remove]");
    if (removeBtn) {
      removeFromCart(removeBtn.dataset.checkoutRemove);
      render();
      return;
    }
    const selectBtn = e.target.closest("[data-checkout-toggle-select]");
    if (selectBtn) {
      toggleCartItemSelected(selectBtn.dataset.checkoutToggleSelect);
      render();
    }
  });

  if (selectAllRow) {
    selectAllRow.addEventListener("click", () => {
      toggleSelectAllCart();
      render();
    });
  }

  const voucherToggle = document.getElementById("voucher-toggle");
  const voucherWrap = document.getElementById("voucher-input-wrap");
  if (voucherToggle && voucherWrap) {
    voucherToggle.addEventListener("click", () => {
      voucherWrap.classList.toggle("show");
      voucherToggle.classList.toggle("open");
    });
  }

  const paidBtn = document.getElementById("checkout-paid-btn");
  if (paidBtn) {
    paidBtn.addEventListener("click", () => {
      showToast("Đã ghi nhận! Đơn hàng đang chờ admin xác nhận qua email.");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderProductGrid();
  setupNavToggle();
  setupModals();
  setupCartActions();
  syncCartUI();
  setupSupportFab();
  setupNotifyDropdown();
  setupRateModalActions();
  setupCheckoutPage();
});
