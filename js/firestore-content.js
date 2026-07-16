/**
 * Lớp "hàm trung gian" đọc Firestore (Project A) — mọi nơi khác trong code (main.js) CHỈ
 * được gọi qua các hàm ở đây, KHÔNG tự gọi thẳng firebase.firestore() rải rác — đúng
 * nguyên tắc đã thống nhất: sau này nếu đổi nơi lưu trữ (vd đổi cấu trúc collection), chỉ
 * cần sửa các hàm trong file này, không phải lùng sục sửa khắp main.js.
 *
 * MỌI hàm ở đây đều: (1) trả về `null` nếu Firebase chưa cấu hình xong hoặc gọi lỗi — KHÔNG
 * BAO GIỜ throw ra ngoài làm vỡ trang; (2) người gọi (main.js) luôn phải tự xử lý trường
 * hợp `null` bằng cách GIỮ NGUYÊN dữ liệu tĩnh đang có (data/products.js, NOTIFICATIONS,
 * REVIEWS...) — đây là cơ chế "graceful fallback" để trang KHÔNG BAO GIỜ vỡ vì lý do
 * Firestore (chưa cấu hình / mất mạng / rules sai...).
 */

let _firebaseAppA = null;
let _firestoreA = null;

function _getFirestoreA() {
  if (!isFirebaseConfigReady(FIREBASE_CONFIG_A)) return null;
  if (typeof firebase === "undefined") return null; // SDK chưa load được (vd mất mạng CDN)
  try {
    if (!_firebaseAppA) {
      _firebaseAppA = firebase.initializeApp(FIREBASE_CONFIG_A, "projectA");
      _firestoreA = _firebaseAppA.firestore();
    }
    return _firestoreA;
  } catch (e) {
    console.warn("Không khởi tạo được Firebase Project A:", e);
    return null;
  }
}

/**
 * CACHE tạm trong `sessionStorage` (5 phút) — QUAN TRỌNG cho chi phí thật: nếu không có
 * cache này, MỖI LẦN chuyển trang (không chỉ lúc thanh toán — mọi trang đều gọi
 * `syncFirestoreContent()`) sẽ đọc lại TOÀN BỘ sản phẩm/thông báo/đánh giá/banner/FAQ từ
 * đầu — 1 khách xem lướt 4-5 trang trong vài phút sẽ tính thành 4-5 LẦN đọc, dù nội dung
 * không hề đổi. Với site nhiều lượt xem, đây là nguồn đọc Firestore lớn nhất — LỚN HƠN
 * NHIỀU so với chính luồng mua hàng/thanh toán. Cache theo `sessionStorage` (không phải
 * `localStorage`) để mỗi tab/phiên mới vẫn lấy dữ liệu tương đối mới, không giữ cache "vĩnh
 * viễn" làm khách không thấy cập nhật content mới bạn vừa sửa trong Firestore.
 */
const FIRESTORE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

function _layTuCache(key) {
  try {
    const raw = sessionStorage.getItem("fs_cache_" + key);
    if (!raw) return undefined;
    const { data, t } = JSON.parse(raw);
    if (Date.now() - t > FIRESTORE_CACHE_TTL_MS) return undefined;
    return data;
  } catch (e) {
    return undefined;
  }
}

function _luuVaoCache(key, data) {
  try {
    sessionStorage.setItem("fs_cache_" + key, JSON.stringify({ data, t: Date.now() }));
  } catch (e) {
    /* sessionStorage đầy/bị chặn — bỏ qua, không ảnh hưởng chức năng chính */
  }
}

/** Bọc 1 hàm đọc Firestore bất đồng bộ bằng cache — dùng chung cho mọi hàm `lay...()` dưới đây. */
async function _voiCache(key, fetchFn) {
  const cached = _layTuCache(key);
  if (cached !== undefined) return cached;
  const ketQua = await fetchFn();
  if (ketQua !== null) _luuVaoCache(key, ketQua); // không cache kết quả null (lỗi/chưa cấu hình) — lần sau vẫn thử đọc lại
  return ketQua;
}

/** Định dạng "X phút/giờ/ngày trước" từ 1 Firestore Timestamp — dùng cho thông báo chuông. */
function _thoiGianTruoc(timestamp) {
  if (!timestamp || typeof timestamp.toMillis !== "function") return "";
  const diffMs = Date.now() - timestamp.toMillis();
  const phut = Math.floor(diffMs / 60000);
  if (phut < 1) return "Vừa xong";
  if (phut < 60) return `${phut} phút trước`;
  const gio = Math.floor(phut / 60);
  if (gio < 24) return `${gio} giờ trước`;
  const ngay = Math.floor(gio / 24);
  return `${ngay} ngày trước`;
}

/**
 * Danh sách sản phẩm — trả về ĐÚNG cấu trúc như mảng PRODUCTS trong data/products.js hiện
 * tại (slug/badge/bestSeller/updated/type/name/shortDesc/priceCurrent/priceNote/priceOld)
 * để mọi code render/giỏ hàng/checkout hiện có DÙNG LẠI ĐƯỢC NGUYÊN VẸN, không cần viết
 * lại renderProductGrid()/getCheckoutItems()/setupCartActions() — chỉ cần THAY NGUỒN DỮ
 * LIỆU đầu vào.
 */
async function layDanhSachSanPham() {
  return _voiCache("san_pham", async () => {
    const db = _getFirestoreA();
    if (!db) return null;
    try {
      const snap = await db.collection("san_pham").orderBy("vi_tri").get();
      if (snap.empty) return null;
      return snap.docs.map((doc) => {
        const d = doc.data();
        return {
          slug: doc.id,
          badge: d.nhan_danh_muc,
          bestSeller: d.badge_trang_thai && d.badge_trang_thai.nhan === "Bán chạy" ? true : undefined,
          updated: d.badge_trang_thai && d.badge_trang_thai.nhan === "Cập nhật" ? true : undefined,
          type: d.loai_dashboard,
          name: d.ten,
          shortDesc: d.mo_ta_ngan,
          priceCurrent: formatPriceVN(d.gia_ban),
          priceNote: d.ghi_chu_gia || "",
          priceOld: d.gia_goc ? formatPriceVN(d.gia_goc) : "",
        };
      });
    } catch (e) {
      console.warn("Không đọc được san_pham từ Firestore, dùng dữ liệu tĩnh:", e);
      return null;
    }
  });
}

/** Thông báo chuông — trả về đúng cấu trúc mảng NOTIFICATIONS hiện tại ({title, time}). */
async function layThongBao() {
  return _voiCache("thong_bao", async () => {
    const db = _getFirestoreA();
    if (!db) return null;
    try {
      const snap = await db.collection("thong_bao").where("hien", "==", true).orderBy("ngay_tao", "desc").limit(10).get();
      if (snap.empty) return null;
      return snap.docs.map((doc) => {
        const d = doc.data();
        return { title: d.tieu_de, time: _thoiGianTruoc(d.ngay_tao) };
      });
    } catch (e) {
      console.warn("Không đọc được thong_bao từ Firestore, dùng dữ liệu tĩnh:", e);
      return null;
    }
  });
}

/** Đánh giá — trả về đúng cấu trúc mảng REVIEWS hiện tại ({email, rating, comment}). */
async function layDanhGia() {
  return _voiCache("danh_gia", async () => {
    const db = _getFirestoreA();
    if (!db) return null;
    try {
      const snap = await db.collection("danh_gia").orderBy("ngay_tao", "desc").limit(30).get();
      if (snap.empty) return null;
      return snap.docs.map((doc) => {
        const d = doc.data();
        return { email: d.email_che, rating: d.so_sao, comment: d.noi_dung };
      });
    } catch (e) {
      console.warn("Không đọc được danh_gia từ Firestore, dùng dữ liệu tĩnh:", e);
      return null;
    }
  });
}

/** Banner khuyến mãi hero (trang chủ) — {hien, dong1, dong2, maCode} hoặc null. */
async function layCauHinhHeroBanner() {
  return _voiCache("hero_banner", async () => {
    const db = _getFirestoreA();
    if (!db) return null;
    try {
      const doc = await db.collection("cau_hinh").doc("hero_banner").get();
      if (!doc.exists) return null;
      const d = doc.data();
      return { hien: d.hien !== false, dong1: d.dong_1, dong2: d.dong_2, maCode: d.ma_code };
    } catch (e) {
      console.warn("Không đọc được cau_hinh/hero_banner từ Firestore, dùng nội dung tĩnh:", e);
      return null;
    }
  });
}

/** Email hỗ trợ + FAQ rút gọn (modal Hỗ trợ/FAQ) — {email, faqRutGon} hoặc null. */
async function layCauHinhHoTro() {
  return _voiCache("ho_tro", async () => {
    const db = _getFirestoreA();
    if (!db) return null;
    try {
      const doc = await db.collection("cau_hinh").doc("ho_tro").get();
      if (!doc.exists) return null;
      const d = doc.data();
      return { email: d.email, faqRutGon: d.faq_rut_gon || [] };
    } catch (e) {
      console.warn("Không đọc được cau_hinh/ho_tro từ Firestore, dùng nội dung tĩnh:", e);
      return null;
    }
  });
}

/**
 * Bảng giá SwiftCopy.Drive (Cá nhân/Nhóm × Basic/Premium) — đọc từ field `goi_gia` của
 * đúng document `san_pham/swiftcopy-drive`, dựng lại ĐÚNG 2 cấu trúc SWIFTCOPY_PRICING và
 * PRICING_FEATURES hiện có trong main.js (để setupPricingPage()/openPlanPicker() dùng lại
 * nguyên vẹn, không viết lại logic hiển thị/tính giá). Trả về `null` nếu chưa có dữ liệu —
 * giữ nguyên 2 hằng số tĩnh đang có.
 */
async function layBangGiaSwiftcopy() {
  // LƯU Ý: đọc RIÊNG document `san_pham/swiftcopy-drive` dù `layDanhSachSanPham()` (gọi cùng
  // lúc trong syncFirestoreContent()) đã đọc document này rồi qua collection query — 1 lượt
  // đọc dư mỗi 5 phút (do có cache) — chấp nhận được, không đáng để tăng thêm độ phức tạp
  // code chỉ để tránh 1 read/5 phút. Nếu cần tối ưu tiếp, có thể truyền dữ liệu đã fetch từ
  // layDanhSachSanPham() sang thay vì đọc lại — chưa cần thiết ở quy mô hiện tại.
  return _voiCache("bang_gia_swiftcopy", async () => {
    const db = _getFirestoreA();
    if (!db) return null;
    try {
      const doc = await db.collection("san_pham").doc("swiftcopy-drive").get();
      if (!doc.exists) return null;
      const goiGia = doc.data().goi_gia;
      if (!Array.isArray(goiGia) || !goiGia.length) return null;

      const pricing = { personal: {}, team: {} };
      const features = { personal: {}, team: {} };
      for (const goi of goiGia) {
        pricing.personal[goi.id] = { price: goi.gia, desc: goi.mo_ta };
        features.personal[goi.id] = goi.tinh_nang;
        if (goi.nhom_slider) {
          pricing.team[goi.id] = { min: goi.nhom_slider.gia_min, max: goi.nhom_slider.gia_max, desc: goi.mo_ta };
          features.team[goi.id] = goi.nhom_slider.tinh_nang || goi.tinh_nang;
        }
      }
      return { pricing, features };
    } catch (e) {
      console.warn("Không đọc được bảng giá SwiftCopy.Drive từ Firestore, dùng dữ liệu tĩnh:", e);
      return null;
    }
  });
}
