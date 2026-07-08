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
        <button type="button" class="btn btn-outline btn-sm" data-modal="cart">Thêm giỏ hàng</button>
        <a class="btn btn-dark btn-sm" href="products/${p.slug}.html">Mua ngay</a>
      </div>
    </div>
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

/** Nội dung mẫu (placeholder) cho 3 modal: thông báo, giỏ hàng, hỗ trợ. */
const MODAL_CONTENT = {
  notify: `
    <div class="modal-head">
      <h3>Thông báo</h3>
      <button class="modal-close" data-modal-close aria-label="Đóng">×</button>
    </div>
    <div class="modal-notify-item">
      <p>Đơn hàng #SW-1042 đã được duyệt</p>
      <span>2 giờ trước</span>
    </div>
    <div class="modal-notify-item">
      <p>Ưu đãi mới: giảm 20% toàn bộ sản phẩm</p>
      <span>1 ngày trước</span>
    </div>
    <div class="modal-notify-item">
      <p>SwiftHR Attendance vừa cập nhật tính năng xuất phiếu lương</p>
      <span>3 ngày trước</span>
    </div>`,

  cart: `
    <div class="modal-head">
      <h3>Giỏ hàng</h3>
      <button class="modal-close" data-modal-close aria-label="Đóng">×</button>
    </div>
    <div class="modal-cart-item">
      <div>
        <b>SwiftCopy.Drive</b>
        <span>199.000đ</span>
      </div>
      <button class="modal-cart-remove" aria-label="Xoá">×</button>
    </div>
    <div class="modal-cart-item">
      <div>
        <b>SwiftPlanner Wedding</b>
        <span>149.000đ</span>
      </div>
      <button class="modal-cart-remove" aria-label="Xoá">×</button>
    </div>
    <div class="modal-cart-total">
      <span>Tổng cộng</span>
      <span>348.000đ</span>
    </div>
    <button class="btn btn-primary btn-block" style="margin-top:16px;">Tiến hành thanh toán</button>`,

  support: `
    <div class="modal-head">
      <h3>Hỗ trợ</h3>
      <button class="modal-close" data-modal-close aria-label="Đóng">×</button>
    </div>
    <div class="modal-support-row"><b>Email</b><span>support@swiftstreet.vn</span></div>
    <div class="modal-support-row"><b>Hotline / Zalo</b><span>0909 xxx xxx</span></div>
    <div class="modal-support-row"><b>Giờ làm việc</b><span>8:00 – 21:00 (T2 – CN)</span></div>
    <p style="font-size:13px; color:var(--text-muted); margin-top:12px;">Đội ngũ SwiftStreet phản hồi trong vòng 24 giờ.</p>`,
};

let modalOverlayEl = null;

function openModal(name) {
  const content = MODAL_CONTENT[name];
  if (!content || !modalOverlayEl) return;
  const modal = document.getElementById("modal-" + name);
  if (!modal) return;
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
    if (e.key === "Escape") closeModals();
  });

  document.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(btn.dataset.modal);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProductGrid();
  setupNavToggle();
  setupModals();
});
