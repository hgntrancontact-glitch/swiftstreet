/** Dấu tích SVG dùng chung cho mọi ô tích chọn (giỏ hàng/trang thanh toán) — vòng 27. */
const CHECK_ICON_SVG = '<svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';

/** Ảnh thu nhỏ mô phỏng "file sheet" cho mỗi sản phẩm trong danh sách thanh toán (vòng 27, mô phỏng bằng code, không phải ảnh thật). */
const THUMB_SHEET_HTML = '<div class="thumb-sheet"><span></span><span></span><span></span><span></span><span></span><span></span></div>';

/**
 * Icon SVG dùng cho mini-dashboard mô phỏng trong thẻ sản phẩm (không phải ảnh chụp thật).
 */
const DASH_ICONS = {
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.9-10-9.3C.4 8.2 2 4.5 5.6 4a5 5 0 0 1 6.4 2 5 5 0 0 1 6.4-2c3.6.5 5.2 4.2 3.6 7.7C19.5 16.1 12 21 12 21Z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/><path d="M2.5 3h2l2.3 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H5.5"/></svg>',
  /** Vòng 41: thêm mới cho Swift Travel Planner (map pin). */
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  /** Vòng 41: thêm mới cho Swift Hotel & Homestay Manager (nhà/toà nhà). */
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V9l8-5 8 5v12"/><path d="M9 21v-6h6v6"/></svg>',
};

/** Ánh xạ field `type` của sản phẩm (data/products.js) sang icon tương ứng trong DASH_ICONS. */
const PRODUCT_TYPE_ICON = {
  drive: "folder",
  wedding: "heart",
  content: "calendar",
  travel: "pin",
  shop: "cart",
  hotel: "building",
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

/**
 * Bắt mã giới thiệu CTV (`?ref=CTV0042`) ngay khi trang tải — vd khách bấm vào link CTV
 * chia sẻ, link dẫn về `index.html?ref=CTV0042` hoặc thẳng 1 trang sản phẩm. Lưu vào
 * `sessionStorage` (KHÔNG dùng cookie dài hạn — đúng thiết kế đã chốt, xem
 * docs/firestore/03b-ctv-auth-phuong-an-b.md mục "2 cách kiếm hoa hồng", cách (a)): chỉ
 * tính công nếu khách THANH TOÁN TRONG CÙNG PHIÊN TRUY CẬP đó — đóng hết tab/mở lại bằng
 * link thường (không `?ref=`) thì phiên mới, không còn mã, không tính công.
 */
const REF_CTV_STORAGE_KEY = "swiftstreet_ref_ctv";

function luuMaGioiThieuTuUrl() {
  const ref = new URLSearchParams(location.search).get("ref");
  if (!ref) return;
  try {
    sessionStorage.setItem(REF_CTV_STORAGE_KEY, ref);
  } catch (e) {
    /* sessionStorage có thể bị chặn (vd chế độ duyệt riêng tư khắt khe) — bỏ qua, không vỡ trang */
  }
}

/** Đọc lại mã giới thiệu đã lưu — gọi lúc tạo đơn hàng thật (`taoDonHang`) để gắn `ctvId`. */
function layMaGioiThieuDaLuu() {
  try {
    return sessionStorage.getItem(REF_CTV_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

luuMaGioiThieuTuUrl(); // chạy ngay khi file này load, không chờ DOMContentLoaded

/**
 * Header/footer/support-fab dùng chung — vòng "database hoá" (Phần 8): trước đây HTML của
 * 3 khối này được COPY-PASTE y hệt vào từng trang (~12 file), khiến mỗi lần đổi nội dung
 * (vd thêm cột footer, đổi link sản phẩm...) phải sửa tay từng file — đã gây lỗi thực tế 2
 * lần (bỏ sót trang khi xoá/thêm sản phẩm). Giờ mỗi trang HTML chỉ còn 2 mount point rỗng
 * (`#site-header-mount`/`#site-footer-mount`), nội dung thật dựng ở đây rồi thay thế bằng
 * `outerHTML` ngay khi tải trang — sửa nội dung chỉ cần sửa 3 hàm này, không đụng HTML nữa.
 */
const NAV_LINKS = [
  { href: "index.html", label: "Trang chủ" },
  { href: "san-pham.html", label: "Sản phẩm" },
  { href: "khuyen-mai.html", label: "Khuyến mãi" },
  { href: "kiem-tien.html", label: "Kiếm Tiền" },
];

/**
 * Mục nào trong menu đang được xem — tự tính theo URL thay vì phải nhớ gắn tay
 * `class="active"` ở từng trang HTML mới nhân bản (rủi ro đã ghi trong CLAUDE.md).
 * `index.html` cố ý không có mục nào active (đúng yêu cầu khách từ đầu dự án).
 */
function getActiveNavHref() {
  const path = location.pathname;
  if (path.includes("/products/")) return "san-pham.html";
  if (/san-pham\.html$/.test(path)) return "san-pham.html";
  if (/khuyen-mai\.html$/.test(path)) return "khuyen-mai.html";
  if (/kiem-tien\.html$/.test(path)) return "kiem-tien.html";
  return null;
}

function renderHeaderHTML() {
  const prefix = getRootPrefix();
  const activeHref = getActiveNavHref();
  const navHTML = NAV_LINKS.map(
    (item) => `<a href="${prefix}${item.href}"${activeHref === item.href ? ' class="active"' : ""}>${item.label}</a>`
  ).join("\n        ");

  return `
  <header class="site-header">
    <div class="container">
      <a href="${prefix}index.html" class="brand">
        <img src="${prefix}assets/img/logo-header.png" alt="Swiftstreet" />
        <span>Swiftstreet</span>
      </a>

      <nav class="main-nav">
        ${navHTML}
      </nav>

      <div class="header-actions">
        <div class="notify-wrap">
          <button class="icon-btn" aria-label="Thông báo" id="notify-trigger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          </button>
          <div class="notify-dropdown" id="notify-dropdown">
            <div class="notify-dropdown-head">Thông báo</div>
            <div class="notify-dropdown-list" id="notify-dropdown-list"></div>
          </div>
        </div>
        <a class="icon-btn" aria-label="Giỏ hàng" href="${prefix}thanh-toan.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/><path d="M2.5 3h2l2.3 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H5.5"/></svg>
          <span class="icon-dot"></span>
        </a>
        <button class="nav-toggle" aria-label="Mở menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>`;
}

function renderFooterHTML() {
  const prefix = getRootPrefix();
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="${prefix}index.html" class="brand">
            <img src="${prefix}assets/img/logo-header.png" alt="Swiftstreet" />
            <span>Swiftstreet</span>
          </a>
          <p>Cửa hàng công cụ &amp; file số nhỏ gọn, giúp công việc của bạn nhanh và gọn hơn mỗi ngày.</p>
        </div>

        <div class="footer-col">
          <h4>Giới thiệu</h4>
          <ul>
            <li><a href="${prefix}footer-pages/ve-chung-toi.html">Về chúng tôi</a></li>
            <li><a href="${prefix}footer-pages/cau-hoi-thuong-gap.html">Câu hỏi thường gặp</a></li>
            <li><a href="${prefix}footer-pages/huong-dan-mua-hang.html">Hướng dẫn mua hàng</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Sản phẩm</h4>
          <ul>
            <li><a href="${prefix}products/swiftcopy-drive.html">SwiftCopy.Drive</a></li>
            <li><a href="${prefix}thanh-toan.html?slug=swift-wedding-planner">Swift Wedding Planner</a></li>
            <li><a href="${prefix}san-pham.html">Nhiều sản phẩm khác...</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="${prefix}footer-pages/dieu-khoan-su-dung.html">Điều khoản sử dụng</a></li>
            <li><a href="${prefix}footer-pages/chinh-sach-doi-tra.html">Chính sách đổi trả</a></li>
            <li><a href="${prefix}footer-pages/kiem-tien-ctv.html">Kiếm tiền CTV</a></li>
          </ul>
        </div>

        <div class="footer-col footer-contact">
          <h4>Liên hệ</h4>
          <p class="footer-email">hgntran.contact@gmail.com</p>
          <p class="footer-zalo-label">Quét mã Zalo kết nối</p>
          <div class="footer-qr">
            <img src="${prefix}assets/img/zalo-qr.png" alt="Mã QR Zalo Swiftstreet" />
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <span class="footer-copy">© ${year} Swiftstreet. All rights reserved.</span>
        <div class="footer-social">
          <a href="https://www.facebook.com/swiftstreet.vn/" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.16 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.78 8.44-4.94 8.44-9.94Z"/></svg></a>
          <a href="https://www.tiktok.com/@by.swiftstreet?lang=en" target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 2h-3v13.6a3 3 0 1 1-2.6-2.98v-3.1a6 6 0 1 0 5.6 5.98V9.1a7.5 7.5 0 0 0 4.4 1.4V7.4A4.5 4.5 0 0 1 16.5 2Z"/></svg></a>
          <a href="#" data-platform-dev="Instagram" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg></a>
          <a href="#" data-platform-dev="Threads" aria-label="Threads"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3.2c-4.6 0-7.3 2.9-7.3 7.4v2.8c0 4.3 2.6 7.4 7.3 7.4 4.2 0 6.7-2.2 6.7-5.6 0-2.6-1.6-4-4-4-2.1 0-3.6 1.1-3.6 2.7 0 1.2 1 2.1 2.3 2.1.9 0 1.7-.4 2.1-1.1"/></svg></a>
          <a href="#" data-platform-dev="YouTube" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" stroke-width="1.8"/><path d="M10 9l5 3-5 3V9Z" fill="currentColor"/></svg></a>
        </div>
        <span class="footer-made">Made with care in Vietnam</span>
      </div>
    </div>
  </footer>`;
}

function renderSupportFabHTML() {
  return `
    <div class="support-fab-menu" id="support-fab-menu">
      <button type="button" data-modal="support">Hỗ trợ</button>
      <button type="button" data-modal="faq">FAQ</button>
      <button type="button" data-report-bug>Báo lỗi</button>
    </div>
    <button class="support-fab-trigger" aria-label="Hỗ trợ" id="support-fab-trigger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2" y="13" width="5" height="7" rx="2"/><rect x="17" y="13" width="5" height="7" rx="2"/></svg>
      <span class="fab-label">Hỗ trợ</span>
    </button>`;
}

/** Chèn header/footer/support-fab thật vào 2 mount point + body — PHẢI chạy TRƯỚC mọi
 * hàm setup khác (setupNavToggle/setupModals/setupSupportFab/setupNotifyDropdown...) vì
 * chúng query thẳng vào các phần tử nằm bên trong 3 khối này. */
function renderSiteChrome() {
  const headerMount = document.getElementById("site-header-mount");
  if (headerMount) headerMount.outerHTML = renderHeaderHTML();

  const footerMount = document.getElementById("site-footer-mount");
  if (footerMount) footerMount.outerHTML = renderFooterHTML();

  if (!document.querySelector(".support-fab")) {
    document.body.insertAdjacentHTML("beforeend", `<div class="support-fab">${renderSupportFabHTML()}</div>`);
  }
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

    case "travel":
      return `
        <div class="dash-title">${DASH_ICONS.pin}<span>Travel Planner</span></div>
        <div class="dash-stats">
          <div class="dash-stat"><span>Chuyến đi</span><b>12</b><em class="up">+3</em></div>
          <div class="dash-stat"><span>Địa điểm lưu</span><b>48</b></div>
          <div class="dash-stat"><span>Ngân sách</span><b>18,5tr</b><em class="up">72%</em></div>
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

    case "hotel":
      return `
        <div class="dash-title">${DASH_ICONS.building}<span>Hotel &amp; Homestay</span></div>
        <div class="dash-stats">
          <div class="dash-stat"><span>Phòng đã đặt</span><b>18/24</b><em class="up">75%</em></div>
          <div class="dash-stat"><span>Đang dọn phòng</span><b>4</b></div>
          <div class="dash-stat"><span>Khách check-in</span><b>32</b><em class="up">+6</em></div>
        </div>
        <div class="dash-row">
          <div class="dash-donut" style="background:conic-gradient(var(--dash-accent) 0 75%, var(--dash-accent-3) 75% 100%)"></div>
          <div class="dash-bars">
            <i style="height:60%"></i><i style="height:80%"></i><i class="muted" style="height:35%"></i>
            <i style="height:90%"></i><i style="height:70%"></i><i style="height:85%"></i><i class="muted" style="height:40%"></i>
          </div>
        </div>`;

    case "shop":
      return `
        <div class="dash-title">${DASH_ICONS.cart}<span>Shop Admin</span></div>
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

/** % giảm tự tính từ priceCurrent/priceOld (vòng 42) — dùng chung cho hàng giá thứ 2 trong thẻ sản phẩm. */
function computeDiscountPercent(priceCurrentStr, priceOldStr) {
  const current = parsePriceVN(priceCurrentStr);
  const old = parsePriceVN(priceOldStr);
  if (!old || old <= current) return 0;
  return Math.round(((old - current) / old) * 100);
}

// Render lưới sản phẩm từ data/products.js — mỗi thẻ mô phỏng preview kiểu khung laptop
function renderProductGrid() {
  const grid = document.getElementById("product-grid");
  if (!grid || typeof PRODUCTS === "undefined") return;

  grid.innerHTML = PRODUCTS.map((p) => {
    const discountPercent = computeDiscountPercent(p.priceCurrent, p.priceOld);
    // Vòng 46: "Mua ngay" đổi sang trỏ TRANG CHI TIẾT sản phẩm (không còn đi
    // thẳng checkout nữa) — áp dụng chung cho mọi sản phẩm SAU NÀY, nhưng chỉ
    // slug đã có trang thật (`CHECKOUT_LINKABLE_SLUGS`) mới trỏ được, kẻo 404.
    // 5 sản phẩm chưa có trang chi tiết tạm thời vẫn đi thẳng checkout như cũ.
    const buyHref = CHECKOUT_LINKABLE_SLUGS.includes(p.slug) ? `products/${p.slug}.html` : `thanh-toan.html?slug=${p.slug}`;
    // Vòng 52: 2 badge trang trí MỚI, KHÔNG thay thế badge vàng "loại sản phẩm"
    // có sẵn — `bestSeller` (đỏ, góc trên-trái) và `updated` (xanh lá) — xem
    // field tương ứng trong `data/products.js`.
    // Vòng 53: đổi icon 🔥 emoji sang SVG "Minimalist Outline" (khách yêu cầu) —
    // hình lửa đơn giản, chỉ có đường viền (stroke), không tô đặc.
    // Vòng 57 — THIẾT KẾ LẠI THEO ĐÚNG YÊU CẦU CUỐI CÙNG (bỏ hẳn shape ruy
    // băng chéo góc `rotate(-45deg)` của vòng 56 — khách xác nhận SAI): "Cập
    // nhật" quay LẠI xếp CHỒNG ngay dưới badge danh mục ở góc PHẢI (giống cấu
    // trúc vòng 52-54, nhưng shape/màu khác — xem CSS `.badge-update`) — badge
    // danh mục LUÔN là phần tử ĐẦU TIÊN trong `.product-badges-right` nên vị
    // trí của nó không phụ thuộc "Cập nhật" có tồn tại hay không (đảm bảo yêu
    // cầu "độ cao cố định trên mọi card"). "Bán chạy" đứng riêng ở góc trên-
    // trái, flush đúng góc (`top:0;left:0`) để border-radius của nó khớp liền
    // mạch với border-radius của `.product-card`.
    const bestSellerHTML = p.bestSeller ? `<span class="badge badge-bestseller"><svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3C8 8 6 11 6 14a6 6 0 0 0 12 0c0-3-2-6-6-11Z"/></svg>Bán chạy</span>` : "";
    // Vòng 100: khách yêu cầu — thẻ có "Cập nhật" thì BỎ HẲN nhãn danh mục,
    // "Cập nhật" đứng riêng đè lên góc trên-phải khung mockup, giống hệt cách
    // "Bán chạy" hoạt động (loại bỏ hẳn vấn đề 2 nhãn khác hình phải ghép vừa
    // nhau — nguồn gốc của rất nhiều lần sửa qua lại trước đó).
    const updatedHTML = p.updated ? `<span class="badge badge-update">Cập nhật</span>` : "";
    const categoryBadgeHTML = p.updated ? "" : `<span class="badge badge-orange">${p.badge}</span>`;
    return `
    <div class="product-card">
      <a class="product-card-link" href="products/${p.slug}.html">
        <div class="product-thumb">
          <div class="product-badges-right">
            ${categoryBadgeHTML}
          </div>
          <div class="device-screen">
            ${bestSellerHTML}
            ${updatedHTML}
            <div class="device-display">${renderDashboard(p.type)}</div>
          </div>
          <div class="device-base"></div>
        </div>
        <div class="product-body">
          <h3>${p.name}</h3>
          <div class="product-price">
            <div class="price-row price-row-current">
              <span class="price-current">${p.priceCurrent}</span>
              ${p.priceNote ? `<span class="price-note">(${p.priceNote})</span>` : ""}
            </div>
            ${p.priceOld ? `
            <div class="price-row price-row-old">
              <span class="price-old">${p.priceOld}</span>
              ${discountPercent ? `<span class="price-discount">-${discountPercent}%</span>` : ""}
            </div>` : ""}
          </div>
        </div>
      </a>
      <div class="product-card-actions">
        <button type="button" class="btn btn-outline btn-sm" data-add-to-cart="${p.slug}">Thêm giỏ hàng</button>
        <a class="btn btn-dark btn-sm" href="${buyHref}">Mua ngay</a>
      </div>
    </div>
  `;
  }).join("");
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
 * Slug của các sản phẩm có NHIỀU gói giá (vòng 46) — khi thêm vào giỏ, chưa
 * biết chọn gói nào nên `plan` để `null`, và trang thanh toán phải chặn
 * thanh toán + hiện nút "Yêu cầu chọn gói" thay vì giá, cho tới khi khách
 * chọn gói qua modal (xem `openPlanPicker()`/`resolvePlanPickForCart()`).
 */
const PLAN_REQUIRED_SLUGS = ["swiftcopy-drive"];

/** true nếu item này CẦN chọn gói mà CHƯA chọn (giá hiện tại chưa xác định). */
function productNeedsPlan(item) {
  return PLAN_REQUIRED_SLUGS.includes(item.slug) && !item.plan;
}

/**
 * Thêm sản phẩm vào giỏ. Nếu sản phẩm đã có sẵn, KHÔNG tăng số lượng (mỗi sản
 * phẩm luôn chỉ có đúng 1 dòng trong giỏ) — chỉ báo lại bằng bảng trượt phải.
 */
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.slug === product.slug);
  if (existing) {
    // Vòng 50: sản phẩm nhiều gói (PLAN_REQUIRED_SLUGS) — nếu ĐÃ có trong giỏ
    // nhưng CHƯA thanh toán, bấm "Thêm giỏ hàng" LẠI phải reset về trạng thái
    // "chưa chọn gói" (hiện lại "Yêu cầu chọn gói"), KHÔNG được nhớ lựa chọn
    // gói đã chọn ở lần trước — khách yêu cầu rõ, tránh trường hợp khách lỡ
    // tưởng đã chọn xong gói từ trước rồi bỏ qua bước chọn lại.
    if (PLAN_REQUIRED_SLUGS.includes(product.slug)) {
      existing.name = product.name;
      existing.price = parsePriceVN(product.priceCurrent);
      existing.priceOld = parsePriceVN(product.priceOld);
      existing.shortDesc = product.shortDesc || "";
      existing.plan = null;
      delete existing.planMode;
      setCart(cart);
    }
    showSlideToast("Sản phẩm này đã có trong giỏ hàng", "duplicate");
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
    plan: PLAN_REQUIRED_SLUGS.includes(product.slug) ? null : undefined,
  });
  setCart(cart);
  showSlideToast(`Đã thêm "${product.name}" vào giỏ hàng`, "added");
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

    // Icon mạng xã hội chưa có link thật (Instagram/Threads/YouTube) — báo đang phát triển (vòng 27).
    const devBtn = e.target.closest("[data-platform-dev]");
    if (devBtn) {
      e.preventDefault();
      showToast(`Nền tảng ${devBtn.dataset.platformDev} hiện đang trong quá trình phát triển.`);
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

/**
 * Ghi đè email hỗ trợ + FAQ rút gọn khi đọc được từ Firestore (`cau_hinh/ho_tro`, xem
 * js/firestore-content.js) — `null` = chưa có/lỗi, giữ nguyên nội dung tĩnh mặc định bên
 * dưới. Gán trong `syncFirestoreContent()`, đọc lại trong `buildSupportModalHTML()`/
 * `buildFaqModalHTML()` — 2 hàm này CHỈ được gọi (qua `buildModalContentMap()`) SAU khi
 * `syncFirestoreContent()` đã chạy xong, xem thứ tự trong `DOMContentLoaded`.
 */
let _hoTroOverride = null;

/** Modal "Hỗ trợ" — thông tin liên hệ + mã QR Zalo (ảnh thật, dùng chung với footer). */
function buildSupportModalHTML() {
  const prefix = getRootPrefix();
  const email = (_hoTroOverride && _hoTroOverride.email) || "hgntran.contact@gmail.com";
  return `
    <div class="modal-head">
      <h3>Thông tin hỗ trợ kỹ thuật</h3>
      <button class="modal-close" data-modal-close aria-label="Đóng">×</button>
    </div>
    <p style="font-size:14px; color:var(--text-muted); margin-bottom:16px;">Đội ngũ Swiftstreet luôn sẵn sàng hỗ trợ bạn qua email hoặc Zalo.</p>
    <div class="modal-support-row"><b>Email</b><span>${email}</span></div>
    <div class="modal-support-row"><b>Zalo</b><span>Quét mã bên dưới</span></div>
    <div style="display:flex; justify-content:center; margin:16px 0 4px;">
      <img src="${prefix}assets/img/zalo-qr.png" alt="Mã QR Zalo Swiftstreet" style="width:150px; height:150px; border-radius:8px; border:1px solid var(--border-color);" />
    </div>
    <button class="btn btn-dark btn-block" data-modal-close style="margin-top:16px;">Đóng</button>`;
}

/** Modal "FAQ" — bản rút gọn 5 câu hỏi tiêu biểu nhất, link sang trang FAQ đầy đủ. */
function buildFaqModalHTML() {
  const prefix = getRootPrefix();
  const defaultItems = [
    ["Mua một lần thì dùng được trong bao lâu?", "Tất cả sản phẩm trên Swiftstreet đều áp dụng mô hình mua một lần, sử dụng trọn đời, không phát sinh phí định kỳ."],
    ["Sau khi thanh toán, tôi nhận sản phẩm như thế nào?", "Chúng tôi gửi thông tin đơn hàng và đường dẫn sử dụng qua email bạn đã đăng ký, ngay sau khi đơn được xác nhận."],
    ["Dữ liệu của tôi có được bảo mật không?", "Mọi dữ liệu nằm trong tài khoản Google Drive của chính bạn — chúng tôi không lưu trữ hay truy cập được."],
    ["Thanh toán bằng cách nào?", "Chuyển khoản ngân hàng qua mã QR hiển thị ngay tại trang thanh toán."],
    ["Tôi có thể yêu cầu hoàn tiền không?", "Có, tuỳ từng trường hợp cụ thể — xem chi tiết tại trang Chính sách đổi trả."],
  ];
  const items = (_hoTroOverride && _hoTroOverride.faqRutGon && _hoTroOverride.faqRutGon.length)
    ? _hoTroOverride.faqRutGon.map((f) => [f.cau_hoi, f.tra_loi])
    : defaultItems;

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
  { email: "kh***********88@gmail.com", rating: 5, comment: "Swift Travel Planner giúp mình lên lịch trình du lịch rõ ràng hơn hẳn so với ghi tay." },
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

/**
 * Modal "Chọn gói" (vòng 46, nâng cấp đầy đủ ở vòng 47) — mở từ nút "Yêu cầu
 * chọn gói" trong giỏ hàng (`thanh-toan.html`, chế độ nhiều sản phẩm) khi
 * trong giỏ có sản phẩm nhiều gói (`PLAN_REQUIRED_SLUGS`) mà chưa chọn gói.
 * Khách xác nhận rõ: modal này PHẢI đi ĐỦ theo đúng bảng giá thật của sản
 * phẩm đó — nếu sản phẩm có cả Cá nhân lẫn Nhóm thì modal cũng phải có ĐỦ cả
 * 2 (toggle + slider số thành viên), KHÔNG được rút gọn chỉ còn giá Cá nhân
 * như bản đầu tiên ở vòng 46. Toàn bộ nội dung bên trong `#plan-picker-body`
 * được dựng lại HOÀN TOÀN mỗi lần mở (`openPlanPicker()`) để luôn bắt đầu ở
 * trạng thái "Cá nhân" mặc định, không giữ state cũ từ lần mở trước.
 */
function buildPlanPickerModalHTML() {
  return `
    <div class="modal-head">
      <h3>Chọn gói</h3>
      <button class="modal-close" data-modal-close aria-label="Đóng">×</button>
    </div>
    <div id="plan-picker-body"></div>
  `;
}

/**
 * Nội dung modal: hỗ trợ, FAQ rút gọn, đánh giá Swiftstreet, chọn gói (giỏ hàng).
 * ĐỔI TỪ `const` TÍNH SẴN Ở MODULE-SCOPE sang hàm dựng lại theo yêu cầu — vì
 * `buildSupportModalHTML()`/`buildFaqModalHTML()` giờ phụ thuộc `_hoTroOverride` (đọc từ
 * Firestore bất đồng bộ), nếu tính sẵn lúc file vừa load sẽ luôn dùng nội dung tĩnh mặc
 * định (Firestore chưa kịp trả lời). Gọi `buildModalContentMap()` ngay trong
 * `setupModals()`, tại thời điểm đó `syncFirestoreContent()` đã chạy xong (xem thứ tự gọi
 * hàm trong `DOMContentLoaded`).
 */
function buildModalContentMap() {
  return {
    support: buildSupportModalHTML(),
    faq: buildFaqModalHTML(),
    rate: buildRateModalHTML(),
    planpicker: buildPlanPickerModalHTML(),
  };
}

let MODAL_CONTENT = {};
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
  MODAL_CONTENT = buildModalContentMap();

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
function showSlideToast(message, variant = "added") {
  let toast = document.getElementById("swiftstreet-slide-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "swiftstreet-slide-toast";
    toast.className = "cart-slide-toast";
    document.body.appendChild(toast);
  }
  toast.classList.toggle("is-duplicate", variant === "duplicate");
  toast.innerHTML = variant === "duplicate"
    ? `<svg class="toast-x-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg><span>${message}</span>`
    : `<span>${message}</span>`;
  toast.classList.add("show");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("show"), 4000);
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
  { title: "Swift Shop Admin chính thức ra mắt", time: "1 ngày trước" },
  { title: "Swift Hotel & Homestay Manager: quản lý đặt phòng chỉ 1 click", time: "2 ngày trước" },
  { title: "SwiftCopy.Drive tăng tốc độ sao chép file lớn", time: "3 ngày trước" },
  { title: "Swift Content Planner có mặt trên Swiftstreet", time: "4 ngày trước" },
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

/**
 * Sinh mã đơn hàng ngẫu nhiên (vd "SS48219") — ĐỔI SANG 5 SỐ (10000-99999) theo chuẩn đã
 * chốt trong roadmap tự động hoá. LƯU Ý: hàm này CHỈ còn dùng cho placeholder hiển thị tạm
 * ở phía client (sinh mới mỗi lần tải trang, KHÔNG kiểm tra trùng) — khi luồng đơn hàng
 * thật (Cloud Function, xem functions/) đi vào hoạt động, mã đơn hàng THẬT phải được sinh
 * DUY NHẤT 1 LẦN tại thời điểm tạo đơn ở phía server (có kiểm tra trùng), không phải ở đây.
 */
function generateOrderCode() {
  return "SS" + Math.floor(10000 + Math.random() * 90000);
}

/**
 * Bảng giá riêng cho SwiftCopy.Drive (vòng 36) — gói Basic/Premium, chế độ Cá
 * nhân/Team (5-10 người). Dùng CHUNG giữa trang
 * `products/swiftcopy-drive-bang-gia.html` (setupPricingPage(), hiển thị + tính
 * giá theo slider) VÀ `thanh-toan.html` (getCheckoutItems(), đọc lại đúng công
 * thức này qua query string `?plan=&mode=&members=` để tự điền đúng giá) — để
 * 2 nơi không bao giờ lệch số nhau do sửa 1 chỗ quên sửa chỗ kia.
 * Giá Team nội suy TUYẾN TÍNH giữa mốc 5 người (min) và 10 người (max).
 */
/**
 * Vòng 48: mô tả ngắn của Basic/Premium giờ DÙNG CHUNG 1 nội dung cho cả Cá
 * nhân lẫn Nhóm (khách yêu cầu, trước đó 2 chế độ có desc khác nhau — cũng
 * tiện sửa luôn 1 lỗi có sẵn: bản HTML tĩnh ở vòng 46 đã đổi chữ mới nhưng
 * quên đổi TRONG data này, nên trang thực tế vẫn hiện chữ CŨ vì JS luôn ghi
 * đè `textContent` bằng field `desc` ở đây).
 */
const SWIFTCOPY_PRICING = {
  personal: {
    basic: { price: 490000, desc: "Sao chép dữ liệu Google Drive" },
    premium: { price: 998888, desc: "Sao chép Google Drive và Tải về máy tính" },
  },
  team: {
    basic: { min: 1998000, max: 3996888, desc: "Sao chép dữ liệu Google Drive" },
    premium: { min: 4078888, max: 8148888, desc: "Sao chép Google Drive và Tải về máy tính" },
  },
};

function interpolateTeamPrice(min, max, members) {
  const n = Math.min(10, Math.max(5, members || 5));
  return Math.round(min + (max - min) * (n - 5) / 5);
}

/**
 * Danh sách sản phẩm cần thanh toán trên thanh-toan.html:
 * - Có `?slug=` trên URL → mua 1 sản phẩm cụ thể (không qua giỏ hàng, không đổi giỏ hàng thật).
 * - Không có `?slug=` → lấy các sản phẩm đang được TICK CHỌN trong giỏ hàng.
 */
function getCheckoutItems() {
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  if (slug) {
    const product = typeof PRODUCTS !== "undefined" ? PRODUCTS.find((p) => p.slug === slug) : null;
    if (!product) return [];

    // Vòng 36: link "Mua ngay" từ trang Bảng giá kèm ?plan=basic|premium (và
    // ?mode=team&members=5..10 nếu là gói Team) — ghi đè giá/tên/mô tả mặc
    // định của sản phẩm bằng đúng gói khách đã chọn.
    const plan = params.get("plan");
    if (slug === "swiftcopy-drive" && (plan === "basic" || plan === "premium")) {
      const mode = params.get("mode") === "team" ? "team" : "personal";
      const members = parseInt(params.get("members"), 10) || 5;
      const tier = SWIFTCOPY_PRICING[mode][plan];
      const price = mode === "team" ? interpolateTeamPrice(tier.min, tier.max, members) : tier.price;
      const planLabel = plan === "basic" ? "Basic" : "Premium";
      const modeLabel = mode === "team" ? ` Nhóm (${members} người)` : "";
      return [{
        slug: product.slug,
        name: `${product.name} — ${planLabel}${modeLabel}`,
        price,
        // Vòng 49 — SỬA LỖI: trước đó hard-code priceOld:0 khiến luồng mua
        // thẳng 1 sản phẩm qua trang Bảng giá KHÔNG hiện giá gạch ngang/% giảm
        // ở trang thanh toán, khác với mọi nơi khác trên site (thẻ sản phẩm,
        // trang Bảng giá, modal Chọn gói trong giỏ hàng) đều có. Dùng đúng
        // `computeSwiftcopyOldPrice()` dùng chung (đã có sẵn, chỉ là chưa được
        // gọi ở đây) để tính giá gạch ngang khớp công thức 18,45% cho gói Nhóm.
        priceOld: computeSwiftcopyOldPrice(mode, plan, price, members),
        shortDesc: tier.desc,
        type: product.type,
        qty: 1,
        selected: true,
      }];
    }

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

/**
 * Giá gạch ngang "giả định" (vòng 47) CHỈ còn dùng cho Premium cá nhân — mức
 * giá DUY NHẤT trên toàn site chưa từng có giá gốc chính thức lẫn công thức
 * rõ ràng nào khác. Suy ra bằng cách áp dụng ĐÚNG tỉ lệ giảm giá thật duy
 * nhất đã biết (490.000/620.000 ≈ 79,03%, của Basic cá nhân) lên mức giá này,
 * làm tròn tới hàng nghìn cho gọn số — không bịa ngẫu nhiên.
 */
const ASSUMED_DISCOUNT_RATIO = 490000 / 620000;
function assumedOldPrice(currentPrice) {
  return Math.round(currentPrice / ASSUMED_DISCOUNT_RATIO / 1000) * 1000;
}

/**
 * Giá gạch ngang ĐÚNG cho từng tổ hợp mode/plan của SwiftCopy.Drive — dùng
 * CHUNG giữa trang Bảng giá (`setupPricingPage()`) và modal "Chọn gói" trong
 * giỏ hàng (`openPlanPicker()`/`resolvePlanPickForCart()`), để không lệch số
 * giữa 2 nơi (bài học từ vòng 48 — bản đầu áp nhầm tỉ lệ Basic cá nhân
 * ~21% cho CẢ gói Nhóm, ra sai số so với badge "Tiết kiệm 18,45%" đã công bố).
 * - Basic cá nhân: giá gốc THẬT 620.000đ (đã dùng ở thẻ sản phẩm).
 * - Premium cá nhân: `assumedOldPrice()` (giả định, xem ghi chú trên).
 * - Nhóm (Basic & Premium): giá gốc = SỐ THÀNH VIÊN × giá CÁ NHÂN cùng gói —
 *   đây chính xác là cách tính ra đúng con số "Tiết kiệm 18,45%" (so sánh
 *   mua gói Nhóm với mua lẻ từng người ở giá cá nhân), verify bằng tay khớp
 *   ~18,3%-18,45% ở mọi số thành viên 5-10, không phải chọn tuỳ ý.
 */
function computeSwiftcopyOldPrice(mode, plan, currentPrice, members) {
  if (mode === "team") {
    return (members || 5) * SWIFTCOPY_PRICING.personal[plan].price;
  }
  if (plan === "basic") return 620000;
  return assumedOldPrice(currentPrice);
}

/**
 * Đổ ĐẦY ĐỦ bảng giá thật của sản phẩm (toggle Cá nhân/Nhóm + slider số
 * thành viên + 2 thẻ Basic/Premium, y hệt trang Bảng giá riêng) vào modal
 * "Chọn gói" rồi mở modal — gọi khi bấm nút "Yêu cầu chọn gói" trên 1 dòng
 * sản phẩm trong giỏ hàng. Khách xác nhận rõ ở vòng 47: PHẢI đủ cả Cá nhân
 * lẫn Nhóm, không được rút gọn. Toàn bộ state (mode/members) là biến cục bộ
 * trong closure, dựng lại từ đầu mỗi lần mở modal.
 */
function openPlanPicker(slug) {
  const bodyEl = document.getElementById("plan-picker-body");
  if (!bodyEl || !SWIFTCOPY_PRICING.personal) return;

  let mode = "personal";
  let members = 5;

  function render() {
    const basicLabel = mode === "team" ? "BASIC NHÓM" : "BASIC";
    const premiumLabel = mode === "team" ? "PREMIUM NHÓM" : "PREMIUM";
    let basicPrice, premiumPrice, basicDesc, premiumDesc;
    if (mode === "team") {
      const bt = SWIFTCOPY_PRICING.team.basic;
      const pt = SWIFTCOPY_PRICING.team.premium;
      basicPrice = interpolateTeamPrice(bt.min, bt.max, members);
      premiumPrice = interpolateTeamPrice(pt.min, pt.max, members);
      basicDesc = bt.desc;
      premiumDesc = pt.desc;
    } else {
      basicPrice = SWIFTCOPY_PRICING.personal.basic.price;
      premiumPrice = SWIFTCOPY_PRICING.personal.premium.price;
      basicDesc = SWIFTCOPY_PRICING.personal.basic.desc;
      premiumDesc = SWIFTCOPY_PRICING.personal.premium.desc;
    }

    const basicOld = computeSwiftcopyOldPrice(mode, "basic", basicPrice, members);
    const premiumOld = computeSwiftcopyOldPrice(mode, "premium", premiumPrice, members);
    const basicDiscountPercent = Math.round(((basicOld - basicPrice) / basicOld) * 100);
    const premiumDiscountPercent = Math.round(((premiumOld - premiumPrice) / premiumOld) * 100);

    bodyEl.innerHTML = `
      <div class="pricing-toggle-wrap">
        <div class="pricing-toggle">
          <button type="button" class="pricing-toggle-btn${mode === "personal" ? " active" : ""}" data-plan-modal-mode="personal">Cá nhân</button>
          <button type="button" class="pricing-toggle-btn${mode === "team" ? " active" : ""}" data-plan-modal-mode="team">Nhóm</button>
        </div>
      </div>
      <div class="pricing-team-controls${mode === "team" ? " show" : ""}">
        <div class="pricing-slider-row">
          <span class="pricing-slider-label">Số thành viên: <strong>${members}</strong> người</span>
          <input type="range" min="5" max="10" step="1" value="${members}" class="pricing-slider" id="plan-picker-team-slider" aria-label="Số thành viên" />
        </div>
        <span class="badge badge-success">Tiết kiệm 18,45%</span>
      </div>
      <div class="pricing-cards">
        <div class="pricing-card">
          <span class="pricing-card-label">${basicLabel}</span>
          <div class="pricing-card-price">${formatPriceVN(basicPrice)}<span class="pricing-price-suffix"> / Trọn đời</span></div>
          <div class="pricing-old-row">
            <span class="pricing-price-old">${formatPriceVN(basicOld)}</span>
            <span class="pricing-price-discount">-${basicDiscountPercent}%</span>
          </div>
          <p class="pricing-card-desc">${basicDesc}</p>
          <button type="button" class="btn pricing-buy-btn pricing-buy-basic${mode === "personal" ? " is-personal-mode" : ""}" data-choose-plan="basic">Chọn gói này</button>
          <ul class="pricing-feature-list">${renderFeatureList(PRICING_FEATURES[mode].basic)}</ul>
        </div>
        <div class="pricing-card pricing-card-premium">
          <span class="pricing-badge-popular${mode === "team" ? " is-team-mode" : ""}">PHỔ BIẾN NHẤT</span>
          <span class="pricing-card-label">${premiumLabel}</span>
          <div class="pricing-card-price">${formatPriceVN(premiumPrice)}<span class="pricing-price-suffix"> / Trọn đời</span></div>
          <div class="pricing-old-row">
            <span class="pricing-price-old">${formatPriceVN(premiumOld)}</span>
            <span class="pricing-price-discount">-${premiumDiscountPercent}%</span>
          </div>
          <p class="pricing-card-desc">${premiumDesc}</p>
          <button type="button" class="btn pricing-buy-btn pricing-buy-premium" data-choose-plan="premium">Chọn gói này</button>
          <ul class="pricing-feature-list">${renderFeatureList(PRICING_FEATURES[mode].premium)}</ul>
        </div>
      </div>
    `;

    bodyEl.querySelectorAll("[data-plan-modal-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.planModalMode === mode) return;
        mode = btn.dataset.planModalMode;
        render();
      });
    });
    const sliderEl = bodyEl.querySelector("#plan-picker-team-slider");
    if (sliderEl) {
      sliderEl.addEventListener("input", () => {
        members = parseInt(sliderEl.value, 10) || 5;
        render();
      });
    }
    bodyEl.querySelectorAll("[data-choose-plan]").forEach((btn) => {
      btn.addEventListener("click", () => {
        resolvePlanPickForCart(slug, btn.dataset.choosePlan, mode, members);
        closeModals();
        document.dispatchEvent(new CustomEvent("swiftstreet:plan-picked"));
      });
    });
  }

  render();
  openModal("planpicker");
}

/**
 * Ghi gói đã chọn (kèm chế độ Cá nhân/Nhóm + số thành viên nếu có) vào ĐÚNG
 * dòng giỏ hàng (localStorage) — gọi khi bấm "Chọn gói này" trong modal. Giá
 * gạch ngang tính bằng `computeSwiftcopyOldPrice()` dùng chung (xem ghi chú
 * ở hàm đó) — vòng 48 sửa lại đúng công thức cho gói Nhóm (18,45%), trước đó
 * lỡ áp nhầm tỉ lệ của Basic cá nhân (~21%) khiến % giảm hiển thị sai.
 */
function resolvePlanPickForCart(slug, plan, mode, members) {
  const tier = SWIFTCOPY_PRICING[mode][plan];
  if (!tier) return;
  const cart = getCart();
  const item = cart.find((i) => i.slug === slug);
  if (!item) return;

  const price = mode === "team" ? interpolateTeamPrice(tier.min, tier.max, members) : tier.price;
  const priceOld = computeSwiftcopyOldPrice(mode, plan, price, members);

  item.plan = plan;
  item.planMode = mode;
  item.price = price;
  item.priceOld = priceOld;
  item.shortDesc = tier.desc;
  const planLabel = plan === "basic" ? "Basic" : "Premium";
  const modeLabel = mode === "team" ? ` Nhóm (${members} người)` : "";
  item.name = item.name.replace(/ — (Basic|Premium)( Nhóm \(\d+ người\))?$/, "") + ` — ${planLabel}${modeLabel}`;
  setCart(cart);
}

/** Render trang thanh-toan.html (chỉ chạy nếu trang hiện tại có #checkout-product-list). */
function setupCheckoutPage() {
  const list = document.getElementById("checkout-product-list");
  if (!list) return;

  const isSingleSlug = !!new URLSearchParams(location.search).get("slug");
  const orderCode = generateOrderCode(); // mã TẠM phía client — thay bằng mã thật ngay khi khoiTaoDonHangNhap() trả lời (nếu Cloud Function đã cấu hình)
  const orderCodeEl = document.getElementById("checkout-order-code");
  if (orderCodeEl) orderCodeEl.textContent = orderCode;

  /**
   * Mã đơn hàng THẬT (từ Cloud Function `taoDonHangNhap`, giai đoạn 1) — null cho tới khi
   * gọi thành công. Khi nút "Thanh toán" được bấm, PHẢI dùng mã này (không dùng lại
   * `orderCode` tạm ở trên) để gọi `xacNhanThanhToan` — đảm bảo đúng 1 document Firestore
   * được cập nhật, không tạo đơn trùng. Xem giải thích đầy đủ trong
   * `cloud-functions-source/functions/index.js` (comment ngay trên `taoDonHangNhap`).
   */
  let maDonThatSu = null;

  async function khoiTaoDonHangNhap() {
    if (typeof CLOUD_FN_URLS === "undefined" || !isCloudFnReady(CLOUD_FN_URLS.taoDonHangNhap)) return; // giữ mã tạm phía client, không gọi gì cả
    const itemsBanDau = isSingleSlug ? getCheckoutItems() : getCart().filter((item) => item.selected);
    if (!itemsBanDau.length) return;
    try {
      const res = await fetch(CLOUD_FN_URLS.taoDonHangNhap, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sanPham: itemsBanDau.map((i) => ({ slug: i.slug, tenGoi: i.name, gia: i.price })) }),
      });
      const data = await res.json();
      if (data.maDon) {
        maDonThatSu = data.maDon;
        if (orderCodeEl) orderCodeEl.textContent = data.maDon; // thay mã tạm bằng mã thật — từ giờ ỔN ĐỊNH, không đổi nữa
        updateTotals(); // vẽ lại QR với đúng mã đơn hàng thật (trước đó QR ban đầu dùng mã tạm)
      }
    } catch (e) {
      console.warn("Không tạo được đơn hàng nháp (Cloud Function), tạm giữ mã phía client:", e);
    }
  }

  khoiTaoDonHangNhap();

  // Điền thông tin ngân hàng THẬT (nếu đã cấu hình xong) — chỉ 1 chỗ cần sửa
  // (js/cloud-functions-config.js) khi có thông tin thật, tự động cập nhật cả 3 dòng này VÀ
  // mã QR (xem updateTotals()) mà không cần sửa HTML.
  if (typeof BANK_INFO !== "undefined" && banKInfoReady()) {
    const bankNameEl = document.getElementById("bank-ten-ngan-hang");
    const bankHolderEl = document.getElementById("bank-chu-tk");
    const bankNumberEl = document.getElementById("bank-so-tk");
    if (bankNameEl) bankNameEl.textContent = BANK_INFO.tenNganHang;
    if (bankHolderEl) bankHolderEl.textContent = BANK_INFO.accountName;
    if (bankNumberEl) bankNumberEl.textContent = BANK_INFO.accountNumber;
  }

  // Vòng 50: cờ theo dõi trạng thái "còn sản phẩm chưa chọn gói" — cập nhật
  // trong updateTotals(), đọc lại khi bấm nút Thanh toán (xem cuối hàm này).
  let planBlocked = false;

  // Danh sách mã voucher ĐÃ ÁP DỤNG THÀNH CÔNG (tối đa 3, đúng yêu cầu) — mỗi phần tử hiện
  // RIÊNG trên "Voucher" (không gộp % chung). `tamTinhHienTai` lưu lại tổng tiền sản phẩm
  // (SAU giảm giá sản phẩm, TRƯỚC voucher) để gửi đúng số cho Cloud Function `kiemTraVoucher`
  // tính % — cập nhật mỗi lần updateTotals() chạy.
  let appliedVouchers = [];
  let tamTinhHienTai = 0;

  // Tiêu đề đổi theo ngữ cảnh vào (vòng 26): mua thẳng 1 sản phẩm vẫn là "Hoàn
  // tất đơn hàng"; vào từ icon giỏ hàng (nhiều sản phẩm) đổi thành "Hoàn tất giỏ hàng".
  const headingEl = document.getElementById("checkout-heading");
  if (headingEl) headingEl.textContent = isSingleSlug ? "Hoàn tất đơn hàng" : "Hoàn tất giỏ hàng";

  const selectAllRow = document.getElementById("checkout-select-all");
  const selectAllCircle = document.getElementById("checkout-select-all-circle");
  if (selectAllRow) selectAllRow.style.display = isSingleSlug ? "none" : "flex";

  // Vòng 31: chỉ chế độ nhiều sản phẩm mới có icon xoá chiếm chỗ bên phải mỗi
  // dòng — ô nhập cần chừa đúng khoảng đó ra để không vượt qua nút xoá.
  const inputForm = document.querySelector(".checkout-input-form");
  if (inputForm) inputForm.classList.toggle("has-delete-gutter", !isSingleSlug);

  // Vòng 27: tách riêng "vẽ lại toàn bộ danh sách" (renderList — chỉ gọi khi
  // tải trang/thêm/xoá sản phẩm) khỏi "cập nhật tổng tiền" (updateTotals —
  // gọi mỗi khi tick chọn). Trước đó MỌI lần tick đều render lại toàn bộ HTML
  // danh sách khiến thao tác tick cảm giác lag/chậm — giờ tick chỉ cần đổi 1
  // class + tính lại số tiền, không đụng tới DOM danh sách.
  function renderList() {
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

    // Vòng 26: 1 HÀNG NGANG duy nhất (checkbox — ảnh sản phẩm — tên/mô tả —
    // giá — icon xoá), không còn làm mờ sản phẩm bị bỏ chọn.
    list.innerHTML = items.map((item) => {
      const nameHTML = CHECKOUT_LINKABLE_SLUGS.includes(item.slug)
        ? `<a href="${getRootPrefix()}products/${item.slug}.html" class="checkout-item-name-link">${item.name}</a>`
        : `<b class="checkout-item-name">${item.name}</b>`;
      // Vòng 46: sản phẩm nhiều gói (PLAN_REQUIRED_SLUGS) chưa chọn gói thì
      // hiện nút "Yêu cầu chọn gói" thay cho giá — chỉ áp dụng ở chế độ giỏ
      // hàng nhiều sản phẩm (isSingleSlug=false); mua thẳng qua `?slug=` thì
      // KHÔNG bao giờ rơi vào tình trạng này (getCheckoutItems() luôn trả về
      // giá đã xác định, xem mục "?plan=" ở đó).
      // Vòng 49: thêm badge "-X%" cạnh giá gạch ngang — trước đó hàng sản phẩm
      // ở trang thanh toán chỉ hiện giá hiện tại + giá gạch ngang, THIẾU % giảm
      // so với thẻ sản phẩm (`.price-discount` trong renderProductGrid()) và
      // trang Bảng giá/modal Chọn gói (đều đã có %). Dùng lại đúng
      // computeDiscountPercent() (nhận cả string lẫn number nhờ parsePriceVN).
      const itemDiscountPercent = computeDiscountPercent(item.price, item.priceOld);
      const priceHTML = !isSingleSlug && productNeedsPlan(item)
        ? `<button type="button" class="cart-need-plan-btn" data-need-plan="${item.slug}">Yêu cầu chọn gói</button>`
        : `
          <span class="cart-price-current">${formatPriceVN(item.price)}</span>
          ${item.priceOld > item.price ? `
          <div class="cart-price-old-row">
            <span class="cart-price-old">${formatPriceVN(item.priceOld)}</span>
            ${itemDiscountPercent ? `<span class="cart-price-discount">-${itemDiscountPercent}%</span>` : ""}
          </div>` : ""}`;
      return `
      <div class="checkout-item-row">
        ${isSingleSlug ? "" : `<button class="cart-item-select${item.selected ? " checked" : ""}" data-checkout-toggle-select="${item.slug}" aria-label="Chọn sản phẩm">${CHECK_ICON_SVG}</button>`}
        <div class="checkout-item-thumb">${THUMB_SHEET_HTML}</div>
        <div class="checkout-item-content">
          <div class="checkout-item-name-row">${nameHTML}</div>
          ${item.shortDesc ? `<p class="cart-item-desc">${item.shortDesc}</p>` : ""}
        </div>
        <div class="item-price-stack">${priceHTML}</div>
        ${isSingleSlug ? "" : `
          <button class="cart-item-delete" data-checkout-remove="${item.slug}" aria-label="Xoá">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7"/></svg>
          </button>`}
      </div>`;
    }).join("");

    updateTotals();
  }

  function updateTotals() {
    const items = isSingleSlug ? getCheckoutItems() : getCart();
    if (selectAllCircle) selectAllCircle.classList.toggle("checked", items.length > 0 && items.every((item) => item.selected));

    const calcItems = items.filter((item) => item.selected);
    // Vòng 46: sản phẩm nhiều gói CHƯA chọn gói bị loại khỏi phép tính tổng
    // tiền (giá chưa xác định) — đồng thời nếu nó đang ĐƯỢC CHỌN, chặn hẳn
    // nút thanh toán cho tới khi khách bấm "Yêu cầu chọn gói" để resolve.
    // Vòng 48 — SỬA LỖI: cơ chế này CHỈ áp dụng ở chế độ giỏ hàng nhiều sản
    // phẩm (`!isSingleSlug`). Luồng mua thẳng 1 sản phẩm qua
    // `?slug=...&plan=...` (từ trang Bảng giá) đã có giá HOÀN TOÀN xác định
    // ngay trong `getCheckoutItems()` — item đó không có field `plan` (khác
    // quy ước field `plan` dùng riêng cho giỏ hàng) nên trước đây bị
    // `productNeedsPlan()` hiểu NHẦM là "chưa chọn gói", làm tổng tiền về 0đ
    // và khoá cứng nút Thanh toán dù khách đã chọn gói xong xuôi ở bước trước.
    planBlocked = !isSingleSlug && calcItems.some((item) => productNeedsPlan(item));
    const priceableItems = isSingleSlug ? calcItems : calcItems.filter((item) => !productNeedsPlan(item));
    const subtotalOld = priceableItems.reduce((sum, item) => sum + (item.priceOld > item.price ? item.priceOld : item.price) * item.qty, 0);
    const total = priceableItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = subtotalOld - total;
    const discountPercent = subtotalOld > 0 ? Math.round((discount / subtotalOld) * 100) : 0;

    tamTinhHienTai = total;
    const voucherGiam = appliedVouchers.reduce((sum, v) => sum + v.giam, 0);
    const tongCuoi = Math.max(0, total - voucherGiam);

    const subtotalEl = document.getElementById("checkout-subtotal");
    const discountEl = document.getElementById("checkout-discount");
    const discountPercentEl = document.getElementById("checkout-discount-percent");
    const totalEl = document.getElementById("checkout-total");
    const voucherAmountEl = document.getElementById("checkout-voucher-amount");
    if (subtotalEl) subtotalEl.textContent = formatPriceVN(subtotalOld);
    if (discountEl) discountEl.textContent = "-" + formatPriceVN(discount);
    if (discountPercentEl) discountPercentEl.textContent = `đã giảm ${discountPercent}%`;
    if (voucherAmountEl) voucherAmountEl.textContent = voucherGiam > 0 ? "-" + formatPriceVN(voucherGiam) : "-0đ";
    if (totalEl) totalEl.textContent = formatPriceVN(tongCuoi);
    const soTienCKEl = document.getElementById("payment-so-tien-ck");
    if (soTienCKEl) soTienCKEl.textContent = formatPriceVN(tongCuoi); // dòng "Số tiền CK" có nút sao chép riêng, khớp đúng "Cần thanh toán"

    // Vẽ lại mã QR chuyển khoản khớp ĐÚNG số tiền cuối cùng (sau voucher) — chạy lại mỗi lần
    // updateTotals() (bấm tick chọn/áp voucher...), không chỉ lúc tải trang lần đầu. Chỉ thay
    // ảnh giả lập bằng QR thật khi bank info đã điền xong thật (banKInfoReady()) — tránh hiện
    // ảnh lỗi/QR sai khi thông tin ngân hàng còn là placeholder.
    const qrContainer = document.getElementById("payment-qr-container");
    if (qrContainer && typeof BANK_INFO !== "undefined" && banKInfoReady()) {
      const noiDungCK = maDonThatSu || orderCode;
      const qrUrl = taoQRUrlClient(tongCuoi, noiDungCK);
      if (qrContainer.dataset.qrUrl !== qrUrl) {
        qrContainer.dataset.qrUrl = qrUrl;
        qrContainer.innerHTML = `<img src="${qrUrl}" alt="Mã QR chuyển khoản ${formatPriceVN(tongCuoi)}" />`;
      }
    }
  }

  renderList();

  list.addEventListener("click", (e) => {
    const removeBtn = e.target.closest("[data-checkout-remove]");
    if (removeBtn) {
      removeFromCart(removeBtn.dataset.checkoutRemove);
      const row = removeBtn.closest(".checkout-item-row");
      const remaining = isSingleSlug ? getCheckoutItems() : getCart();
      if (!remaining.length) {
        renderList();
      } else {
        if (row) row.remove();
        updateTotals();
      }
      return;
    }
    const selectBtn = e.target.closest("[data-checkout-toggle-select]");
    if (selectBtn) {
      toggleCartItemSelected(selectBtn.dataset.checkoutToggleSelect);
      selectBtn.classList.toggle("checked");
      updateTotals();
      return;
    }
    const needPlanBtn = e.target.closest("[data-need-plan]");
    if (needPlanBtn) {
      openPlanPicker(needPlanBtn.dataset.needPlan);
    }
  });

  // Vòng 47: `openPlanPicker()` tự gắn sự kiện + gọi `resolvePlanPickForCart()`
  // ngay trên nút "Chọn gói này" (xem hàm đó) rồi bắn CustomEvent báo hiệu —
  // ở đây chỉ cần lắng nghe để vẽ lại danh sách giỏ hàng với giá vừa xác định.
  document.addEventListener("swiftstreet:plan-picked", renderList);

  if (selectAllRow) {
    selectAllRow.addEventListener("click", () => {
      toggleSelectAllCart();
      const cart = getCart();
      list.querySelectorAll("[data-checkout-toggle-select]").forEach((btn) => {
        const item = cart.find((i) => i.slug === btn.dataset.checkoutToggleSelect);
        btn.classList.toggle("checked", !!(item && item.selected));
      });
      updateTotals();
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

  // Nút "+ Thêm mã khác" — tối đa 3 ô nhập (đúng yêu cầu 1-3 mã cùng lúc).
  const voucherRowsEl = document.getElementById("voucher-rows");
  const voucherAddBtn = document.getElementById("voucher-add-btn");
  const MAX_VOUCHER_ROWS = 3;

  function capNhatNutThemMaVoucher() {
    if (!voucherRowsEl || !voucherAddBtn) return;
    const soDong = voucherRowsEl.querySelectorAll("[data-voucher-row]").length;
    voucherAddBtn.style.display = soDong >= MAX_VOUCHER_ROWS ? "none" : "";
  }

  if (voucherAddBtn && voucherRowsEl) {
    voucherAddBtn.addEventListener("click", () => {
      if (voucherRowsEl.querySelectorAll("[data-voucher-row]").length >= MAX_VOUCHER_ROWS) return;
      const row = document.createElement("div");
      row.className = "voucher-row";
      row.setAttribute("data-voucher-row", "");
      row.innerHTML = `
        <input type="text" class="voucher-input" placeholder="Nhập mã voucher" data-voucher-input />
        <button type="button" class="voucher-apply-btn" data-voucher-apply>Áp dụng</button>`;
      voucherRowsEl.appendChild(row);
      capNhatNutThemMaVoucher();
    });
  }

  /**
   * Áp dụng 1 mã voucher — gọi Cloud Function `kiemTraVoucher` (Project B). Nếu Cloud
   * Function CHƯA cấu hình xong (xem js/cloud-functions-config.js), hiện thông báo nhẹ
   * thay vì lỗi vỡ trang — đúng nguyên tắc "chừa placeholder, không chặn tiến độ".
   */
  async function apDungMaVoucher(row) {
    const input = row.querySelector("[data-voucher-input]");
    const btn = row.querySelector("[data-voucher-apply]");
    const ma = input.value.trim().toUpperCase();
    if (!ma) return;

    let feedbackEl = row.querySelector(".voucher-feedback");
    if (!feedbackEl) {
      feedbackEl = document.createElement("p");
      feedbackEl.className = "voucher-feedback";
      row.appendChild(feedbackEl);
    }

    if (!isCloudFnReady(CLOUD_FN_URLS.kiemTraVoucher)) {
      feedbackEl.textContent = "Hệ thống voucher chưa được cấu hình xong (đang chờ deploy Cloud Function).";
      feedbackEl.className = "voucher-feedback is-muted";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Đang kiểm tra...";
    try {
      const emailInputEl = document.getElementById("checkout-email");
      const res = await fetch(CLOUD_FN_URLS.kiemTraVoucher, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ma: [ma], email: emailInputEl ? emailInputEl.value.trim() : "", tamTinh: tamTinhHienTai }),
      });
      const data = await res.json();
      const ketQua = data.ketQua && data.ketQua[0];

      appliedVouchers = appliedVouchers.filter((v) => v.ma !== ma); // gỡ mã cũ nếu áp lại
      if (ketQua && ketQua.hopLe) {
        appliedVouchers.push({ ma, giam: ketQua.giam });
        feedbackEl.textContent = `Đã áp dụng — giảm ${formatPriceVN(ketQua.giam)}`;
        feedbackEl.className = "voucher-feedback is-success";
      } else {
        feedbackEl.textContent = (ketQua && ketQua.lyDo) || "Mã không hợp lệ.";
        feedbackEl.className = "voucher-feedback is-error";
      }
      updateTotals();
    } catch (e) {
      feedbackEl.textContent = "Không kiểm tra được mã lúc này, vui lòng thử lại.";
      feedbackEl.className = "voucher-feedback is-error";
    } finally {
      btn.disabled = false;
      btn.textContent = "Áp dụng";
    }
  }

  if (voucherRowsEl) {
    voucherRowsEl.addEventListener("click", (e) => {
      const applyBtn = e.target.closest("[data-voucher-apply]");
      if (!applyBtn) return;
      apDungMaVoucher(applyBtn.closest("[data-voucher-row]"));
    });
  }
  capNhatNutThemMaVoucher();

  // Icon sao chép cạnh mỗi dòng thông tin chuyển khoản (vòng 26).
  document.querySelectorAll(".payment-mock .copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.copyTarget;
      const text = targetId ? document.getElementById(targetId)?.textContent : btn.dataset.copy;
      if (!text) return;
      navigator.clipboard.writeText(text)
        .then(() => showToast(`Đã sao chép "${text}"`))
        .catch(() => showToast("Không thể sao chép, vui lòng thử lại"));
    });
  });

  // Vòng 50: khách yêu cầu KHÔNG cần làm mờ nút Thanh toán — chỉ cần khi bấm
  // vào mà chưa đủ điều kiện thì không cho chạy tiếp + hiện chữ đỏ báo lỗi
  // (`#checkout-block-note`, tái dùng nguyên phần tử đã có từ vòng 46, giờ
  // chuyển sang cơ chế PHẢN ỨNG theo lần bấm thay vì hiện sẵn liên tục). Áp
  // dụng CẢ 2 điều kiện: (1) còn sản phẩm nhiều gói chưa chọn gói (`planBlocked`,
  // chỉ xảy ra ở chế độ giỏ hàng nhiều sản phẩm), (2) CHƯA điền đủ 3 ô "Điền
  // thông tin của bạn" (Họ tên/SĐT/Email) — áp dụng cho CẢ 2 luồng (mua thẳng
  // lẫn giỏ hàng nhiều sản phẩm), vì form này luôn có mặt ở cả 2 luồng.
  const paidBtn = document.getElementById("checkout-paid-btn");
  const blockNoteEl = document.getElementById("checkout-block-note");
  const nameInput = document.getElementById("checkout-name");
  const phoneInput = document.getElementById("checkout-phone");
  const emailInput = document.getElementById("checkout-email");

  function showBlockNote(message) {
    if (!blockNoteEl) return;
    blockNoteEl.textContent = message;
    blockNoteEl.style.display = "block";
  }

  // Chống bấm nhiều lần (yêu cầu prompt cuối, Phần 4): sau lần bấm HỢP LỆ đầu tiên (đã qua
  // hết 2 kiểm tra ở trên), khoá nút ngay — tránh tạo nhiều đơn trùng nếu khách bấm liên
  // tục/mạng chậm. Không dùng cho 2 trường hợp BỊ CHẶN (planBlocked/infoMissing) — lúc đó
  // khách còn cần sửa rồi bấm lại, không được khoá.
  let dangXuLyThanhToan = false;

  if (paidBtn) {
    paidBtn.addEventListener("click", async () => {
      if (dangXuLyThanhToan) return;
      if (planBlocked) {
        showBlockNote("Vui lòng chọn gói cho sản phẩm có nhiều gói trước khi thanh toán.");
        return;
      }
      const infoMissing = [nameInput, phoneInput, emailInput].some((input) => !input || !input.value.trim());
      if (infoMissing) {
        showBlockNote("Vui lòng điền đầy đủ thông tin của bạn (Họ tên/SĐT/Email) trước khi thanh toán.");
        return;
      }
      if (blockNoteEl) blockNoteEl.style.display = "none";

      dangXuLyThanhToan = true;
      paidBtn.disabled = true;
      paidBtn.textContent = "Đang xử lý...";

      // Nếu Cloud Function CHƯA cấu hình xong, hoặc giai đoạn 1 (khoiTaoDonHangNhap) chưa
      // thành công lấy được mã đơn thật — giữ hành vi giả lập cũ, KHÔNG làm vỡ trang.
      if (typeof CLOUD_FN_URLS === "undefined" || !isCloudFnReady(CLOUD_FN_URLS.xacNhanThanhToan) || !maDonThatSu) {
        showToast("Đã ghi nhận! Đơn hàng đang chờ admin xác nhận qua email.");
        return;
      }

      const itemsHienTai = isSingleSlug ? getCheckoutItems() : getCart().filter((item) => item.selected);
      try {
        const res = await fetch(CLOUD_FN_URLS.xacNhanThanhToan, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maDon: maDonThatSu,
            khach: { ten: nameInput.value.trim(), sdt: phoneInput.value.trim(), email: emailInput.value.trim() },
            maVoucher: appliedVouchers.map((v) => v.ma),
            ctvId: layMaGioiThieuDaLuu(), // mã giới thiệu CTV đã bắt từ ?ref= (nếu có)
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Lỗi không xác định");

        // Lưu tạm dữ liệu đơn hàng để trang "Chúc mừng đã thanh toán" đọc lại và hiển thị
        // hoá đơn — sessionStorage (không phải localStorage) vì chỉ cần sống qua đúng 1
        // lượt điều hướng, không cần giữ lâu dài.
        sessionStorage.setItem("swiftstreet_last_order", JSON.stringify({
          maDon: data.maDon,
          tamTinh: data.tamTinh,
          tongGiam: data.tongGiam,
          thanhTien: data.thanhTien,
          breakdown: data.breakdown || [],
          khach: { ten: nameInput.value.trim(), sdt: phoneInput.value.trim(), email: emailInput.value.trim() },
          sanPham: itemsHienTai.map((i) => ({ name: i.name, price: i.price })),
        }));
        location.href = "cam-on-da-thanh-toan.html";
      } catch (e) {
        console.error("Lỗi xác nhận thanh toán:", e);
        dangXuLyThanhToan = false;
        paidBtn.disabled = false;
        paidBtn.textContent = "Thanh toán";
        showToast("Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ hỗ trợ.");
      }
    });
  }
}

/** Icon "Minimalist Outline" dùng cho danh sách tính năng trang Bảng giá (vòng 46) — check xanh / X đỏ. */
const PRICING_CHECK_ICON = '<svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
const PRICING_X_ICON = '<svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';

/**
 * Nội dung tính năng của mỗi gói, đổi theo Cá nhân/Nhóm (vòng 36, nội dung
 * cập nhật lại ở vòng 46 theo đúng bản khách gửi). Mỗi dòng là 1 chuỗi text
 * bình thường (check xanh) HOẶC 1 object `{ text, negative: true }` (X đỏ) —
 * xem `renderFeatureList()`.
 */
const PRICING_FEATURES = {
  personal: {
    basic: [
      "Sao chép Google Drive không giới hạn dung lượng (Gb)",
      "Sao chép folder, file, video về đúng cấu trúc",
      "Xem dung lượng tổng & kiểm tra quyền trước khi sao chép",
      "Tự động sao chép tiếp tục nếu mất kết nối",
      "Sao chép được các file không bật nút tải về",
      "Tick chọn mục muốn sao chép tự do",
      "Theo dõi tiến trình sao chép và báo cáo khi hoàn tất",
      { text: "Không hỗ trợ tải Drive về máy tính cá nhân", negative: true },
    ],
    premium: [
      "Tất cả tính năng cao cấp từ gói Basic",
      "Tải trực tiếp trọn bộ thư mục về máy tính cá nhân",
      "Hỗ trợ sao chép và tải về dữ liệu tốc độ cao",
      "Đường truyền riêng cho tác vụ tải về phức tạp",
      "Không cần update gói mới trong tương lai",
      "Miễn phí cập nhật tính năng cho các phiên bản mới",
      "Sẵn sàng tính năng tải dữ liệu về máy mọi lúc",
      "Tối ưu hoá trải nghiệm sao chép & tải về toàn diện",
    ],
  },
  team: {
    basic: [
      "Sao chép Google Drive không giới hạn dung lượng (Gb)",
      "Sắp xếp file & folder về đúng cấu trúc gốc",
      "Xem dung lượng tổng & kiểm tra quyền trước khi sao chép",
      "Tự động sao chép tiếp tục nếu mất kết nối",
      "Sao chép được các file không bật nút tải về",
      "Tick chọn mục sao chép & theo dõi tiến độ khi sao chép",
      "Giá ưu đãi khi mua gói team 5 - 10 người",
      { text: "Không hỗ trợ tải Drive về máy tính cá nhân", negative: true },
    ],
    premium: [
      "Tất cả tính năng cao cấp từ gói Basic",
      "Tải trực tiếp trọn bộ Google Drive về máy tính cá nhân",
      "Hỗ trợ tải về và sao chép dữ liệu tốc độ cao",
      "Đường truyền riêng cho tác vụ tải về phức tạp",
      "Không cần update gói mới trong tương lai",
      "Miễn phí cập nhật tính năng cho các phiên bản mới",
      "Giá ưu đãi khi mua gói team 5 - 10 người",
      "Hỗ trợ tải về máy tính & sao chép Drive toàn diện",
    ],
  },
};

/** Dựng HTML danh sách tính năng — chuỗi thường = check xanh, `{negative:true}` = X đỏ. */
function renderFeatureList(items) {
  return items.map((item) => {
    const isNegative = typeof item === "object" && item.negative;
    const text = typeof item === "object" ? item.text : item;
    return `<li class="${isNegative ? "is-negative" : ""}">${isNegative ? PRICING_X_ICON : PRICING_CHECK_ICON}<span>${text}</span></li>`;
  }).join("");
}

/** Render trang products/swiftcopy-drive-bang-gia.html (chỉ chạy nếu trang hiện tại có #pricing-basic-price). */
function setupPricingPage() {
  const basicPriceEl = document.getElementById("pricing-basic-price");
  if (!basicPriceEl) return;

  const toggleBtns = document.querySelectorAll("[data-pricing-mode]");
  const teamControls = document.getElementById("pricing-team-controls");
  const slider = document.getElementById("pricing-team-slider");
  const teamCountEl = document.getElementById("pricing-team-count");

  const basicLabelEl = document.getElementById("pricing-basic-label");
  const basicDescEl = document.getElementById("pricing-basic-desc");
  const basicBuyEl = document.getElementById("pricing-basic-buy");
  const basicFeaturesEl = document.getElementById("pricing-basic-features");
  const basicOldEl = document.getElementById("pricing-basic-old");
  const basicDiscountEl = document.getElementById("pricing-basic-discount");

  const premiumLabelEl = document.getElementById("pricing-premium-label");
  const premiumPriceEl = document.getElementById("pricing-premium-price");
  const premiumDescEl = document.getElementById("pricing-premium-desc");
  const premiumBuyEl = document.getElementById("pricing-premium-buy");
  const premiumFeaturesEl = document.getElementById("pricing-premium-features");
  const premiumOldEl = document.getElementById("pricing-premium-old");
  const premiumDiscountEl = document.getElementById("pricing-premium-discount");
  const popularBadgeEl = document.querySelector(".pricing-badge-popular");

  let mode = "personal";

  /** Vòng 48: đổ giá gạch ngang + % giảm cho 1 thẻ — dùng chung Basic/Premium. */
  function renderOldPriceRow(oldEl, discountEl, plan, currentPrice, members) {
    const oldPrice = computeSwiftcopyOldPrice(mode, plan, currentPrice, members);
    const percent = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
    if (oldEl) oldEl.textContent = formatPriceVN(oldPrice);
    if (discountEl) discountEl.textContent = `-${percent}%`;
  }

  function render() {
    const members = parseInt(slider.value, 10) || 5;
    if (teamControls) teamControls.classList.toggle("show", mode === "team");
    if (teamCountEl) teamCountEl.textContent = String(members);
    if (popularBadgeEl) popularBadgeEl.classList.toggle("is-team-mode", mode === "team");
    if (basicBuyEl) basicBuyEl.classList.toggle("is-personal-mode", mode === "personal");

    basicLabelEl.textContent = mode === "team" ? "BASIC NHÓM" : "BASIC";
    premiumLabelEl.textContent = mode === "team" ? "PREMIUM NHÓM" : "PREMIUM";

    let basicPrice, premiumPrice;
    if (mode === "team") {
      const basicTier = SWIFTCOPY_PRICING.team.basic;
      const premiumTier = SWIFTCOPY_PRICING.team.premium;
      basicPrice = interpolateTeamPrice(basicTier.min, basicTier.max, members);
      premiumPrice = interpolateTeamPrice(premiumTier.min, premiumTier.max, members);
      basicDescEl.textContent = basicTier.desc;
      premiumDescEl.textContent = premiumTier.desc;
    } else {
      basicPrice = SWIFTCOPY_PRICING.personal.basic.price;
      premiumPrice = SWIFTCOPY_PRICING.personal.premium.price;
      basicDescEl.textContent = SWIFTCOPY_PRICING.personal.basic.desc;
      premiumDescEl.textContent = SWIFTCOPY_PRICING.personal.premium.desc;
    }
    basicPriceEl.textContent = formatPriceVN(basicPrice);
    premiumPriceEl.textContent = formatPriceVN(premiumPrice);
    renderOldPriceRow(basicOldEl, basicDiscountEl, "basic", basicPrice, members);
    renderOldPriceRow(premiumOldEl, premiumDiscountEl, "premium", premiumPrice, members);

    basicFeaturesEl.innerHTML = renderFeatureList(PRICING_FEATURES[mode].basic);
    premiumFeaturesEl.innerHTML = renderFeatureList(PRICING_FEATURES[mode].premium);

    const rootPrefix = getRootPrefix();
    const basicParams = new URLSearchParams({ slug: "swiftcopy-drive", plan: "basic" });
    const premiumParams = new URLSearchParams({ slug: "swiftcopy-drive", plan: "premium" });
    if (mode === "team") {
      basicParams.set("mode", "team");
      basicParams.set("members", String(members));
      premiumParams.set("mode", "team");
      premiumParams.set("members", String(members));
    }
    basicBuyEl.href = `${rootPrefix}thanh-toan.html?${basicParams.toString()}`;
    premiumBuyEl.href = `${rootPrefix}thanh-toan.html?${premiumParams.toString()}`;
  }

  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.pricingMode === mode) return;
      mode = btn.dataset.pricingMode;
      toggleBtns.forEach((b) => b.classList.toggle("active", b === btn));
      render();
    });
  });

  if (slider) slider.addEventListener("input", render);

  render();
}

/**
 * Ghi đè banner khuyến mãi hero (`.hero-promo-text`, chỉ tồn tại ở index.html) khi đọc được
 * `cau_hinh/hero_banner` từ Firestore — `null`/`hien:false` = giữ nguyên nội dung tĩnh
 * đang viết sẵn trong index.html.
 */
function applyHeroBannerOverride(heroBanner) {
  if (!heroBanner || heroBanner.hien === false) return;
  const el = document.querySelector(".hero-promo-text");
  if (!el) return;
  el.innerHTML = `${heroBanner.dong1}<br />${heroBanner.dong2}<br />Code: <strong>${heroBanner.maCode}</strong>`;
}

/**
 * Đồng bộ TOÀN BỘ nội dung có thể đọc từ Firestore Project A vào ĐÚNG các biến/mảng tĩnh
 * đang có (PRODUCTS, NOTIFICATIONS, REVIEWS, SWIFTCOPY_PRICING, PRICING_FEATURES) — MUTATE
 * TRỰC TIẾP nội dung bên trong (`.length = 0; .push(...)` cho mảng, `Object.assign()` cho
 * object) thay vì gán lại biến mới, để mọi hàm khác (renderProductGrid, getCheckoutItems,
 * setupCartActions, setupPricingPage...) tiếp tục đọc đúng 1 tham chiếu duy nhất mà KHÔNG
 * cần viết lại logic của chúng sang dạng bất đồng bộ. Đây là lựa chọn CHỦ Ý để giảm rủi ro
 * thay đổi kiến trúc lớn ngay trước ngày khai trương — xem ghi chú trong báo cáo cuối.
 *
 * Nếu Firestore CHƯA cấu hình xong (xem js/firebase-config.js) hoặc bất kỳ lệnh gọi nào
 * lỗi, hàm tương ứng trong js/firestore-content.js trả về `null` và finding đó được GIỮ
 * NGUYÊN dữ liệu tĩnh — trang KHÔNG BAO GIỜ vỡ vì lý do Firestore.
 */
async function syncFirestoreContent() {
  if (typeof isFirebaseConfigReady !== "function" || !isFirebaseConfigReady(FIREBASE_CONFIG_A)) return;

  const [sanPham, thongBao, danhGia, heroBanner, hoTro, bangGia] = await Promise.all([
    layDanhSachSanPham(),
    layThongBao(),
    layDanhGia(),
    layCauHinhHeroBanner(),
    layCauHinhHoTro(),
    layBangGiaSwiftcopy(),
  ]);

  if (sanPham && typeof PRODUCTS !== "undefined") {
    PRODUCTS.length = 0;
    PRODUCTS.push(...sanPham);
  }
  if (thongBao) {
    NOTIFICATIONS.length = 0;
    NOTIFICATIONS.push(...thongBao);
  }
  if (danhGia) {
    REVIEWS.length = 0;
    REVIEWS.push(...danhGia);
  }
  if (hoTro) _hoTroOverride = hoTro;
  if (heroBanner) applyHeroBannerOverride(heroBanner);
  if (bangGia) {
    Object.assign(SWIFTCOPY_PRICING.personal, bangGia.pricing.personal);
    Object.assign(SWIFTCOPY_PRICING.team, bangGia.pricing.team);
    Object.assign(PRICING_FEATURES.personal, bangGia.features.personal);
    Object.assign(PRICING_FEATURES.team, bangGia.features.team);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  renderSiteChrome();
  await syncFirestoreContent();
  renderProductGrid();
  setupNavToggle();
  setupModals();
  setupCartActions();
  syncCartUI();
  setupSupportFab();
  setupNotifyDropdown();
  setupRateModalActions();
  setupCheckoutPage();
  setupPricingPage();
});
