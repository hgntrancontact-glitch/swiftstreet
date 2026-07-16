/**
 * Dashboard Khu C — KHUNG (skeleton), chưa nối Firestore Project B thật.
 *
 * Mọi mảng dữ liệu bên dưới (MOCK_SAN_PHAM, MOCK_CTV_*, MOCK_DON_HANG, MOCK_THONG_BAO,
 * MOCK_VOUCHER) là DỮ LIỆU MẪU cục bộ, thay cho việc đọc/ghi Firestore thật. Khi Project B
 * đã sẵn sàng: thay các hàm `docFirestore*()`/`luuFirestore*()` (đánh dấu TODO rõ ràng bên
 * dưới từng nơi) bằng `firebase.firestore().collection(...)`. Cấu trúc field ĐÃ ĐÚNG khớp
 * với docs/firestore/project-a-schema.md + project-b-schema.md — không cần đổi tên field
 * khi nối thật, chỉ đổi NGUỒN dữ liệu.
 */

if (!sessionStorage.getItem("swiftstreet_admin_mock_session")) {
  location.href = "index.html";
}

document.getElementById("btn-logout").addEventListener("click", () => {
  sessionStorage.removeItem("swiftstreet_admin_mock_session");
  location.href = "index.html";
});

// ---------- Chuyển tab ----------
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

function formatVND(n) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

// ==============================================================
// TAB: SẢN PHẨM — kéo/thả vị trí + editor (kéo/thả ảnh + tải ảnh)
// ==============================================================

// TODO: thay bằng đọc thật `db.collection("san_pham").orderBy("vi_tri").get()`
let MOCK_SAN_PHAM = [
  { slug: "swiftcopy-drive", ten: "SwiftCopy.Drive", gia_ban: 490000, gia_goc: 620000, vi_tri: 10, nhan_danh_muc: "Web App Script", anh: [] },
  { slug: "swift-wedding-planner", ten: "Swift Wedding Planner", gia_ban: 149000, gia_goc: 220000, vi_tri: 20, nhan_danh_muc: "File kế hoạch", anh: [] },
  { slug: "swift-content-planner", ten: "Swift Content Planner", gia_ban: 90000, gia_goc: 200000, vi_tri: 30, nhan_danh_muc: "File kế hoạch", anh: [] },
  { slug: "swift-travel-planner", ten: "Swift Travel Planner", gia_ban: 79000, gia_goc: 150000, vi_tri: 40, nhan_danh_muc: "File kế hoạch", anh: [] },
  { slug: "swift-shop-admin", ten: "Swift Shop Admin", gia_ban: 129000, gia_goc: 220000, vi_tri: 50, nhan_danh_muc: "Công cụ hỗ trợ", anh: [] },
  { slug: "swift-hotel-homestay-manager", ten: "Swift Hotel & Homestay Manager", gia_ban: 159000, gia_goc: 250000, vi_tri: 60, nhan_danh_muc: "Công cụ hỗ trợ", anh: [] },
];

let dangKeoSlug = null;
let slugDangSua = null;

function renderProductList() {
  const listEl = document.getElementById("product-list");
  const sorted = [...MOCK_SAN_PHAM].sort((a, b) => a.vi_tri - b.vi_tri);
  listEl.innerHTML = sorted.map((p) => `
    <div class="product-row${p.slug === slugDangSua ? " selected" : ""}" draggable="true" data-slug="${p.slug}">
      <span class="drag-handle">⠿</span>
      <span class="row-name">${p.ten}</span>
      <span class="row-price">${formatVND(p.gia_ban)}</span>
    </div>
  `).join("");

  listEl.querySelectorAll(".product-row").forEach((row) => {
    row.addEventListener("click", () => {
      slugDangSua = row.dataset.slug;
      renderProductList();
      renderProductEditor();
    });

    row.addEventListener("dragstart", () => {
      dangKeoSlug = row.dataset.slug;
      row.classList.add("dragging");
    });
    row.addEventListener("dragend", () => row.classList.remove("dragging"));
    row.addEventListener("dragover", (e) => {
      e.preventDefault();
      row.classList.add("drag-over");
    });
    row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
    row.addEventListener("drop", (e) => {
      e.preventDefault();
      row.classList.remove("drag-over");
      const slugDich = row.dataset.slug;
      if (!dangKeoSlug || dangKeoSlug === slugDich) return;

      // Đổi vi_tri: chèn sản phẩm đang kéo vào đúng vị trí sản phẩm đích, dồn các sản
      // phẩm khác — cách quãng lại toàn bộ theo bước 10 cho gọn (giống seed ban đầu).
      const sapXep = [...MOCK_SAN_PHAM].sort((a, b) => a.vi_tri - b.vi_tri);
      const viTriKeo = sapXep.findIndex((p) => p.slug === dangKeoSlug);
      const viTriDich = sapXep.findIndex((p) => p.slug === slugDich);
      const [phanTuKeo] = sapXep.splice(viTriKeo, 1);
      sapXep.splice(viTriDich, 0, phanTuKeo);
      sapXep.forEach((p, i) => { p.vi_tri = (i + 1) * 10; });
      MOCK_SAN_PHAM = sapXep;

      // TODO: nối Firestore thật — ghi batch update vi_tri cho các doc bị đổi:
      // const batch = db.batch();
      // sapXep.forEach((p) => batch.update(db.collection("san_pham").doc(p.slug), { vi_tri: p.vi_tri }));
      // batch.commit();

      dangKeoSlug = null;
      renderProductList();
    });
  });
}

function renderProductEditor() {
  const editorEl = document.getElementById("product-editor");
  const p = MOCK_SAN_PHAM.find((x) => x.slug === slugDangSua);
  if (!p) {
    editorEl.innerHTML = '<p class="editor-empty">Chọn 1 sản phẩm bên trái để sửa.</p>';
    return;
  }

  editorEl.innerHTML = `
    <div class="editor-form">
      <label>Tên sản phẩm <input type="text" id="ed-ten" value="${p.ten}" /></label>
      <div class="editor-row">
        <label>Giá bán <input type="number" id="ed-gia-ban" value="${p.gia_ban}" /></label>
        <label>Giá gốc <input type="number" id="ed-gia-goc" value="${p.gia_goc}" /></label>
      </div>
      <label>Nhãn danh mục <input type="text" id="ed-nhan-danh-muc" value="${p.nhan_danh_muc}" /></label>
      <label>Nhãn trạng thái
        <select id="ed-nhan-trang-thai">
          <option value="">(không có)</option>
          <option value="ban_chay">Bán chạy</option>
          <option value="cap_nhat">Cập nhật</option>
        </select>
      </label>

      <label>Ảnh sản phẩm (kéo-thả để đổi thứ tự)
        <div class="image-grid" id="image-grid"></div>
      </label>

      <button type="button" class="btn-primary" id="btn-save-product">Lưu thay đổi</button>
    </div>
  `;

  renderImageGrid(p);

  document.getElementById("btn-save-product").addEventListener("click", () => {
    p.ten = document.getElementById("ed-ten").value;
    p.gia_ban = parseInt(document.getElementById("ed-gia-ban").value, 10) || 0;
    p.gia_goc = parseInt(document.getElementById("ed-gia-goc").value, 10) || 0;
    p.nhan_danh_muc = document.getElementById("ed-nhan-danh-muc").value;
    // TODO: nối Firestore thật — db.collection("san_pham").doc(p.slug).update({...});
    renderProductList();
    alert("Đã lưu (tạm thời chỉ trong bộ nhớ — chưa nối Firestore thật).");
  });
}

let dangKeoAnhIndex = null;

function renderImageGrid(p) {
  const gridEl = document.getElementById("image-grid");
  gridEl.innerHTML = p.anh.map((a, i) => `
    <div class="image-thumb" draggable="true" data-index="${i}">
      <img src="${a.url}" alt="" />
      <button type="button" class="remove-btn" data-remove="${i}">×</button>
    </div>
  `).join("") + `
    <label class="image-upload-btn">
      +
      <input type="file" accept="image/*" id="image-upload-input" style="display:none" />
    </label>
  `;

  gridEl.querySelectorAll(".image-thumb").forEach((thumb) => {
    thumb.addEventListener("dragstart", () => { dangKeoAnhIndex = parseInt(thumb.dataset.index, 10); });
    thumb.addEventListener("dragover", (e) => e.preventDefault());
    thumb.addEventListener("drop", (e) => {
      e.preventDefault();
      const indexDich = parseInt(thumb.dataset.index, 10);
      if (dangKeoAnhIndex === null || dangKeoAnhIndex === indexDich) return;
      const [anhKeo] = p.anh.splice(dangKeoAnhIndex, 1);
      p.anh.splice(indexDich, 0, anhKeo);
      p.anh.forEach((a, i) => { a.thu_tu = i + 1; });
      // TODO: nối Firestore thật — cập nhật field `anh` (mảng) của đúng doc sản phẩm.
      dangKeoAnhIndex = null;
      renderImageGrid(p);
    });
  });

  gridEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      p.anh.splice(parseInt(btn.dataset.remove, 10), 1);
      renderImageGrid(p);
    });
  });

  const uploadInput = document.getElementById("image-upload-input");
  if (uploadInput) {
    uploadInput.addEventListener("change", () => {
      const file = uploadInput.files[0];
      if (!file) return;
      // KHUNG TẠM: chỉ đọc file thành ảnh xem trước cục bộ (URL.createObjectURL), CHƯA
      // upload lên đâu cả.
      // TODO: nối Firebase Storage thật — upload file, lấy URL công khai, rồi mới push vào
      // mảng `anh` + ghi Firestore. Ví dụ:
      //   const ref = firebase.storage().ref(`san-pham/${p.slug}/${Date.now()}-${file.name}`);
      //   await ref.put(file);
      //   const url = await ref.getDownloadURL();
      const urlXemTruoc = URL.createObjectURL(file);
      p.anh.push({ url: urlXemTruoc, thu_tu: p.anh.length + 1 });
      renderImageGrid(p);
    });
  }
}

// ==============================================================
// TAB: CTV
// ==============================================================

// TODO: đọc thật từ collection `ctv_cho_duyet` + `ctv` (Project B)
let MOCK_CTV_CHO_DUYET = [
  { id: "cd1", ten: "Trần Thị B", email: "tranthib@gmail.com", sdt: "0912345678" },
];
let MOCK_CTV_HOAT_DONG = [
  { uid: "uid1", ma_ctv: "CTV001", ten: "Nguyễn Văn A", tong_don_gioi_thieu: 12, tong_hoa_hong: 720000, trang_thai: "hoat_dong" },
];

function renderCTV() {
  document.getElementById("ctv-pending-table").innerHTML = `
    <tr><th>Tên</th><th>Email</th><th>SĐT</th><th></th></tr>
    ${MOCK_CTV_CHO_DUYET.map((c) => `
      <tr>
        <td>${c.ten}</td><td>${c.email}</td><td>${c.sdt}</td>
        <td><button class="btn-sm approve" data-approve-ctv="${c.id}">Duyệt</button></td>
      </tr>
    `).join("") || '<tr><td colspan="4">Không có ai đang chờ.</td></tr>'}
  `;

  document.getElementById("ctv-active-table").innerHTML = `
    <tr><th>Mã CTV</th><th>Tên</th><th>Số đơn giới thiệu</th><th>Tổng hoa hồng</th><th>Trạng thái</th></tr>
    ${MOCK_CTV_HOAT_DONG.map((c) => `
      <tr>
        <td>${c.ma_ctv}</td><td>${c.ten}</td><td>${c.tong_don_gioi_thieu}</td>
        <td class="amount">${formatVND(c.tong_hoa_hong)}</td>
        <td><span class="pill ${c.trang_thai}">${c.trang_thai === "hoat_dong" ? "Hoạt động" : "Tạm ngưng"}</span></td>
      </tr>
    `).join("")}
  `;

  document.querySelectorAll("[data-approve-ctv]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.approveCtv;
      const cd = MOCK_CTV_CHO_DUYET.find((c) => c.id === id);
      if (!cd) return;
      // TODO: gọi thật Cloud Function `duyetCTV({id, maCTV})` (cloud-functions-source/functions/index.js)
      // — Cloud Function tự sinh mã quản lý + tài khoản Firebase Auth, gửi email cho CTV.
      const maCTVMoi = "CTV" + String(MOCK_CTV_HOAT_DONG.length + 1).padStart(3, "0");
      MOCK_CTV_HOAT_DONG.push({ uid: "uid" + Date.now(), ma_ctv: maCTVMoi, ten: cd.ten, tong_don_gioi_thieu: 0, tong_hoa_hong: 0, trang_thai: "hoat_dong" });
      MOCK_CTV_CHO_DUYET = MOCK_CTV_CHO_DUYET.filter((c) => c.id !== id);
      renderCTV();
    });
  });
}

// ==============================================================
// TAB: ĐƠN HÀNG
// ==============================================================

// TODO: đọc thật từ collection `don_hang` (Project B)
const TRANG_THAI_CHAM_SOC_OPTIONS = [
  ["moi", "Mới"],
  ["da_lien_he", "Đã liên hệ"],
  ["san_sang_nang_cap", "Sẵn sàng nâng cấp"],
  ["khong_quan_tam", "Không quan tâm"],
];

let MOCK_DON_HANG = [
  { ma_don_hang: "SS48219", khach: { ten: "Nguyễn Văn A", email: "nguyenvana@gmail.com" }, thanh_tien: 455000, trang_thai: "cho_duyet", trang_thai_cham_soc: "moi" },
  { ma_don_hang: "SS91002", khach: { ten: "Lê Thị C", email: "lethic@gmail.com" }, thanh_tien: 149000, trang_thai: "da_duyet", trang_thai_cham_soc: "san_sang_nang_cap" },
];

function renderDonHang() {
  document.getElementById("don-hang-table").innerHTML = `
    <tr><th>Mã đơn</th><th>Khách</th><th>Thành tiền</th><th>Trạng thái</th><th>Chăm sóc</th></tr>
    ${MOCK_DON_HANG.map((d) => `
      <tr>
        <td>${d.ma_don_hang}</td>
        <td>${d.khach.ten}<br><span style="color:var(--text-muted);font-size:11.5px">${d.khach.email}</span></td>
        <td class="amount">${formatVND(d.thanh_tien)}</td>
        <td><span class="pill ${d.trang_thai}">${d.trang_thai === "cho_duyet" ? "Chờ duyệt" : d.trang_thai === "da_duyet" ? "Đã duyệt" : "Đã huỷ"}</span></td>
        <td>
          <select data-cham-soc="${d.ma_don_hang}">
            ${TRANG_THAI_CHAM_SOC_OPTIONS.map(([val, label]) => `<option value="${val}"${d.trang_thai_cham_soc === val ? " selected" : ""}>${label}</option>`).join("")}
          </select>
        </td>
      </tr>
    `).join("")}
  `;

  document.querySelectorAll("[data-cham-soc]").forEach((sel) => {
    sel.addEventListener("change", () => {
      const d = MOCK_DON_HANG.find((x) => x.ma_don_hang === sel.dataset.chamSoc);
      d.trang_thai_cham_soc = sel.value;
      // TODO: nối Firestore thật — db.collection("don_hang").doc(d.ma_don_hang).update({trang_thai_cham_soc: sel.value});
    });
  });
}

// ==============================================================
// TAB: THÔNG BÁO
// ==============================================================

// TODO: đọc/ghi thật từ collection `thong_bao` (Project A)
let MOCK_THONG_BAO = [
  { id: "tb1", tieu_de: "Giảm 20% toàn bộ sản phẩm — chỉ đến 30/07/2026" },
  { id: "tb2", tieu_de: "Swift Shop Admin chính thức ra mắt" },
];

function renderThongBao() {
  document.getElementById("thong-bao-list").innerHTML = MOCK_THONG_BAO.map((t) => `
    <li><span>${t.tieu_de}</span><button data-remove-tb="${t.id}">Xoá</button></li>
  `).join("");

  document.querySelectorAll("[data-remove-tb]").forEach((btn) => {
    btn.addEventListener("click", () => {
      MOCK_THONG_BAO = MOCK_THONG_BAO.filter((t) => t.id !== btn.dataset.removeTb);
      // TODO: db.collection("thong_bao").doc(id).delete();
      renderThongBao();
    });
  });
}

document.getElementById("thong-bao-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("thong-bao-input");
  MOCK_THONG_BAO.unshift({ id: "tb" + Date.now(), tieu_de: input.value });
  // TODO: db.collection("thong_bao").add({tieu_de: input.value, ngay_tao: ..., hien: true});
  input.value = "";
  renderThongBao();
});

// ==============================================================
// TAB: VOUCHER
// ==============================================================

// TODO: đọc/ghi thật từ collection `voucher` (Project B)
let MOCK_VOUCHER = [
  { ma: "SSGIFT28", loai_ma: "le", kieu_giam: "phan_tram", gia_tri_giam: 20, so_lan_da_dung: 0, dang_hoat_dong: true },
];

function renderVoucher() {
  document.getElementById("voucher-table").innerHTML = `
    <tr><th>Mã</th><th>Loại</th><th>Giảm</th><th>Đã dùng</th><th>Trạng thái</th></tr>
    ${MOCK_VOUCHER.map((v) => `
      <tr>
        <td>${v.ma}</td><td>${v.loai_ma}</td>
        <td>${v.kieu_giam === "phan_tram" ? v.gia_tri_giam + "%" : formatVND(v.gia_tri_giam)}</td>
        <td>${v.so_lan_da_dung}</td>
        <td><span class="pill ${v.dang_hoat_dong ? "hoat_dong" : "tam_ngung"}">${v.dang_hoat_dong ? "Đang chạy" : "Tắt"}</span></td>
      </tr>
    `).join("")}
  `;
}

document.getElementById("voucher-form").addEventListener("submit", (e) => {
  e.preventDefault();
  MOCK_VOUCHER.push({
    ma: document.getElementById("v-ma").value.toUpperCase(),
    loai_ma: document.getElementById("v-loai").value,
    kieu_giam: document.getElementById("v-kieu").value,
    gia_tri_giam: parseInt(document.getElementById("v-gia-tri").value, 10) || 0,
    ngay_bat_dau: document.getElementById("v-ngay-bat-dau").value,
    ngay_ket_thuc: document.getElementById("v-ngay-ket-thuc").value,
    gioi_han_tong: document.getElementById("v-gioi-han-tong").value || null,
    gioi_han_moi_khach: document.getElementById("v-gioi-han-khach").value || null,
    so_lan_da_dung: 0,
    dang_hoat_dong: true,
  });
  // TODO: db.collection("voucher").doc(ma).set({...}); (dùng chính mã code làm doc ID)
  e.target.reset();
  renderVoucher();
});

// ---------- Khởi tạo ----------
renderProductList();
renderProductEditor();
renderCTV();
renderDonHang();
renderThongBao();
renderVoucher();
