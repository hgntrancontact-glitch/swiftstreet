/**
 * Cloud Functions — Swiftstreet Project B (nhạy cảm: voucher/đơn hàng/CTV/Telegram).
 *
 * SAU KHI ĐÃ CHẠY `firebase init functions` THEO docs/setup/02-cloud-functions.md:
 * copy TOÀN BỘ file này + package.json vào đúng `swiftstreet-functions/functions/`, rồi:
 *   cd swiftstreet-functions
 *   firebase functions:secrets:set TELEGRAM_BOT_TOKEN
 *   firebase functions:secrets:set TELEGRAM_ADMIN_CHAT_IDS   (vd: "111111,222222")
 *   firebase functions:secrets:set AUTOMATION_CONTROLLER_SECRET   (đúng giá trị đã đặt ở Controller, xem docs/setup/08)
 *   firebase deploy --only functions
 *
 * ĐÃ CHỪA PLACEHOLDER RÕ RÀNG cho: thông tin ngân hàng (BANK_BIN/BANK_ACCOUNT_NUMBER/
 * BANK_ACCOUNT_NAME — xem docs/setup/04-vietqr.md), URL Controller (AUTOMATION_CONTROLLER_URL
 * — xem docs/setup/08-tao-apps-script-controller.md), ID file mẫu File A/B
 * (FILE_MAU_THEO_SLUG) + thư mục đích (THU_MUC_DICH_GIAO_HANG_ID — điền khi có file bàn giao
 * thật). Còn 2 ĐIỂM TÍCH HỢP CHƯA XONG (đúng Phần 6.2 mục 6 yêu cầu dừng hỏi trước): sửa nội
 * dung code gắn email khách (trong `automation-controller-source/Code.gs`,
 * `xuLyCopyVaDeploy_()`) và gửi email khách — xem `// TODO` trong hàm `xuLyDonHangSauDuyet()`
 * bên dưới.
 */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const cors = require("cors")({ origin: true });

initializeApp();
const db = getFirestore();
const auth = getAuth();

const TELEGRAM_BOT_TOKEN = defineSecret("TELEGRAM_BOT_TOKEN");
const TELEGRAM_ADMIN_CHAT_IDS = defineSecret("TELEGRAM_ADMIN_CHAT_IDS");

// ĐIỀN_SỐ_TK_CỦA_BẠN_VÀO_ĐÂY — xem docs/setup/04-vietqr.md
const BANK_BIN = "970432"; // VPBank
const BANK_ACCOUNT_NUMBER = "0388314162";
const BANK_ACCOUNT_NAME = "TRAN HONG NAM";

// URL + mã bí mật của "Bộ điều phối" (Apps Script MỚI, xem automation-controller-source/ +
// docs/setup/08-tao-apps-script-controller.md) — KHÔNG PHẢI URL của gas-dashboard (gas-
// dashboard không có endpoint nhận lệnh từ xa). Điền sau khi deploy xong Controller + test
// action "test_ping" thành công.
const AUTOMATION_CONTROLLER_URL = "https://script.google.com/macros/s/AKfycbzniiAPCLv6CouuUva0xrKBqElS2-QKfsMu9nq-WZOZdisOjhQ6ntLkUzVcaLumSjYYnQ/exec";
// Mã bí mật lưu qua Secret Manager (giống TELEGRAM_BOT_TOKEN) — chạy
// `firebase functions:secrets:set AUTOMATION_CONTROLLER_SECRET`, dán ĐÚNG giá trị đã đặt ở
// Script Properties của Controller (docs/setup/08-tao-apps-script-controller.md, bước 3).
const AUTOMATION_CONTROLLER_SECRET = defineSecret("AUTOMATION_CONTROLLER_SECRET");

async function goiControllerGAS(action, params) {
  const res = await fetch(AUTOMATION_CONTROLLER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: AUTOMATION_CONTROLLER_SECRET.value(), action, ...params }),
  });
  const data = await res.json();
  if (data.error) throw new Error("Controller GAS lỗi: " + data.error);
  return data;
}

/** true nếu 1 placeholder đã được điền giá trị thật (không còn bắt đầu bằng "ĐIỀN_"). */
function isCloudFnReady_(giaTri) {
  return !!giaTri && !giaTri.startsWith("ĐIỀN_");
}

function taoQRUrl(soTien, noiDungCK) {
  const params = new URLSearchParams({
    amount: String(soTien),
    addInfo: noiDungCK,
    accountName: BANK_ACCOUNT_NAME,
  });
  return `https://img.vietqr.io/image/${BANK_BIN}-${BANK_ACCOUNT_NUMBER}-compact2.png?${params.toString()}`;
}

// ---------- Telegram helpers ----------

async function telegramApi(token, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function guiTelegramChoTatCaAdmin(token, chatIdsCsv, text, replyMarkup) {
  const chatIds = chatIdsCsv.split(",").map((s) => s.trim()).filter(Boolean);
  const ketQua = [];
  for (const chatId of chatIds) {
    const r = await telegramApi(token, "sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    });
    ketQua.push(r);
  }
  return ketQua;
}

/**
 * Cảnh báo lỗi giữa chừng — BẮT BUỘC gọi mỗi khi 1 bước tự động (từ bước 5 luồng đơn hàng
 * trở đi) thất bại, để đơn không bị "treo lơ lửng" mà admin không biết (yêu cầu Phần 6.2).
 */
async function guiCanhBaoLoi(maDon, buoc, chiTiet) {
  try {
    const token = TELEGRAM_BOT_TOKEN.value();
    const chatIds = TELEGRAM_ADMIN_CHAT_IDS.value();
    if (!token || !chatIds) return;
    await guiTelegramChoTatCaAdmin(
      token,
      chatIds,
      `⚠️ Đơn ${maDon} TỰ ĐỘNG THẤT BẠI ở bước "${buoc}", cần xử lý tay.\n\nChi tiết: ${chiTiet}`
    );
  } catch (e) {
    console.error("Không gửi được cảnh báo lỗi Telegram:", e);
  }
}

// ---------- Voucher ----------

/** Kiểm tra 1 mã, KHÔNG tăng số lần dùng (chỉ xác nhận hợp lệ để hiện breakdown ở checkout). */
async function kiemTra1Ma(ma, email) {
  const doc = await db.collection("voucher").doc(ma).get();
  if (!doc.exists) return { ma, hopLe: false, lyDo: "Mã không tồn tại" };
  const d = doc.data();
  const now = Timestamp.now();

  if (!d.dang_hoat_dong) return { ma, hopLe: false, lyDo: "Mã đã bị tắt" };
  if (d.ngay_bat_dau && now.toMillis() < d.ngay_bat_dau.toMillis()) {
    return { ma, hopLe: false, lyDo: "Mã chưa tới ngày áp dụng" };
  }
  if (d.ngay_ket_thuc && now.toMillis() > d.ngay_ket_thuc.toMillis()) {
    return { ma, hopLe: false, lyDo: "Mã đã hết hạn" };
  }
  if (d.gioi_han_tong != null && d.so_lan_da_dung >= d.gioi_han_tong) {
    return { ma, hopLe: false, lyDo: "Mã đã hết lượt sử dụng" };
  }
  if (d.gioi_han_moi_khach != null && email) {
    const suDungDoc = await db.collection("voucher").doc(ma).collection("su_dung").doc(email).get();
    const soLanDaDungCuaKhach = suDungDoc.exists ? suDungDoc.data().so_lan : 0;
    if (soLanDaDungCuaKhach >= d.gioi_han_moi_khach) {
      return { ma, hopLe: false, lyDo: "Bạn đã dùng hết lượt cho mã này" };
    }
  }
  return { ma, hopLe: true, kieuGiam: d.kieu_giam, giaTriGiam: d.gia_tri_giam, ctvId: d.ctv_id || null };
}

/** POST { ma: ["SSGIFT28", "SALE10"], email, tamTinh } -> [{ma, hopLe, lyDo?, giam?}] */
const kiemTraVoucher = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  cors(req, res, async () => {
    try {
      const { ma, email, tamTinh } = req.body || {};
      if (!Array.isArray(ma)) return res.status(400).json({ error: "Thiếu danh sách mã" });

      const ketQua = [];
      for (const m of ma.slice(0, 3)) {
        // tối đa 3 mã/lần theo đúng yêu cầu
        const r = await kiemTra1Ma(m, email);
        if (r.hopLe) {
          r.giam = r.kieuGiam === "phan_tram" ? Math.round((tamTinh || 0) * (r.giaTriGiam / 100)) : r.giaTriGiam;
        }
        ketQua.push(r);
      }
      res.json({ ketQua });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Lỗi kiểm tra voucher" });
    }
  });
});

// ---------- Tạo đơn hàng ----------

function sinhMaDonHangNgauNhien() {
  return "SS" + Math.floor(10000 + Math.random() * 90000);
}

/** Sinh mã đơn hàng DUY NHẤT — kiểm tra trùng bằng cách đọc thử document, tối đa 10 lần thử. */
async function sinhMaDonHangDuyNhat() {
  for (let i = 0; i < 10; i++) {
    const ma = sinhMaDonHangNgauNhien();
    const doc = await db.collection("don_hang").doc(ma).get();
    if (!doc.exists) return ma;
  }
  throw new Error("Không sinh được mã đơn hàng duy nhất sau 10 lần thử — không gian mã có thể đã gần đầy.");
}

/**
 * TẠO ĐƠN HÀNG CHIA 2 GIAI ĐOẠN (chốt sau khi bàn với khách — mã đơn hàng phải ỔN ĐỊNH
 * ngay từ lúc khách VÀO trang thanh toán, không phải chỉ lúc bấm nút "Thanh toán" — vì
 * khách cần 1 mã KHÔNG ĐỔI để ghi đúng vào nội dung chuyển khoản ở app ngân hàng riêng của
 * họ, tách biệt hoàn toàn với việc bấm nút trên site):
 *
 * - GIAI ĐOẠN 1 — `taoDonHangNhap()`: gọi NGAY khi khách vào trang thanh toán (biết được
 *   sản phẩm/giá, CHƯA cần thông tin khách/voucher). Sinh mã đơn hàng DUY NHẤT, lưu Firestore
 *   trạng thái "nhap" (nháp), trả về mã + QR tạm (theo giá sản phẩm, chưa trừ voucher). Mã
 *   này ổn định — khách xem xong không đổi nữa dù trang có tải lại thêm hay không (miễn
 *   không mất `maDon` khỏi trang, xem ghi chú phía client trong `js/main.js`).
 * - GIAI ĐOẠN 2 — `xacNhanThanhToan()`: gọi khi khách bấm nút "Thanh toán" (đã điền đủ
 *   thông tin + chọn xong voucher). Cập nhật ĐÚNG document đã tạo ở giai đoạn 1 (không tạo
 *   mã mới) với thông tin khách + breakdown voucher cuối cùng + tổng tiền cuối cùng, chuyển
 *   trạng thái "cho_duyet", RỒI MỚI báo Telegram admin (cố ý báo ở bước này, không phải bước
 *   1, để tránh làm phiền admin với các lượt khách chỉ xem trang rồi bỏ đi không mua).
 */

/** GIAI ĐOẠN 1 — POST { sanPham: [{slug, tenGoi, gia}] } -> { maDon, qrUrl, tamTinh } */
const taoDonHangNhap = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  cors(req, res, async () => {
    try {
      const { sanPham } = req.body || {};
      if (!Array.isArray(sanPham) || !sanPham.length) {
        return res.status(400).json({ error: "Thiếu sản phẩm" });
      }

      const tamTinh = sanPham.reduce((sum, sp) => sum + (sp.gia || 0), 0);
      const maDon = await sinhMaDonHangDuyNhat();

      await db.collection("don_hang").doc(maDon).set({
        khach: null,
        san_pham: sanPham,
        ma_voucher_da_dung: [],
        tam_tinh: tamTinh,
        tong_giam: 0,
        thanh_tien: tamTinh,
        trang_thai: "nhap",
        trang_thai_cham_soc: "moi",
        ma_ban_quyen: null,
        ctv_id: null,
        admin_xu_ly: null,
        ngay_tao: Timestamp.now(),
        ngay_duyet: null,
      });

      res.json({ maDon, qrUrl: taoQRUrl(tamTinh, maDon), tamTinh });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Lỗi tạo đơn hàng nháp" });
    }
  });
});

/**
 * GIAI ĐOẠN 2 — POST { maDon, khach: {ten, sdt, email}, maVoucher: ["..."], ctvId }
 * -> { maDon, qrUrl, tamTinh, tongGiam, thanhTien, breakdown }
 */
const xacNhanThanhToan = onRequest({ cors: true, invoker: "public", secrets: [TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_IDS] }, async (req, res) => {
  cors(req, res, async () => {
    try {
      const { maDon, khach, maVoucher, ctvId } = req.body || {};
      if (!maDon || !khach || !khach.email) {
        return res.status(400).json({ error: "Thiếu mã đơn hàng hoặc thông tin khách" });
      }

      const donRef = db.collection("don_hang").doc(maDon);
      const donDoc = await donRef.get();
      if (!donDoc.exists) return res.status(404).json({ error: "Không tìm thấy đơn hàng — có thể mã đã hết hạn, vui lòng tải lại trang thanh toán." });
      const donHang = donDoc.data();
      if (donHang.trang_thai !== "nhap") {
        return res.status(409).json({ error: "Đơn hàng này đã được xử lý trước đó." });
      }

      const sanPham = donHang.san_pham;
      const tamTinh = donHang.tam_tinh;

      // Kiểm tra lại voucher SERVER-SIDE (không tin dữ liệu breakdown gửi từ client) —
      // mỗi mã hiện RIÊNG trên hoá đơn theo đúng yêu cầu, không gộp % chung.
      const breakdown = [];
      let ctvIdThucTe = ctvId || null;
      for (const ma of (maVoucher || []).slice(0, 3)) {
        const r = await kiemTra1Ma(ma, khach.email);
        if (!r.hopLe) continue; // bỏ qua mã không hợp lệ nữa vào lúc chốt đơn, không chặn cả đơn
        const giam = r.kieuGiam === "phan_tram" ? Math.round(tamTinh * (r.giaTriGiam / 100)) : r.giaTriGiam;
        breakdown.push({ ma, giam });
        if (r.ctvId && !ctvIdThucTe) ctvIdThucTe = r.ctvId; // mã CTV tự gắn công nếu chưa có ref link
      }
      const tongGiam = breakdown.reduce((sum, b) => sum + b.giam, 0);
      const thanhTien = Math.max(0, tamTinh - tongGiam);

      await donRef.update({
        khach,
        ma_voucher_da_dung: breakdown,
        tong_giam: tongGiam,
        thanh_tien: thanhTien,
        trang_thai: "cho_duyet",
        ctv_id: ctvIdThucTe,
      });

      // Tăng số lần dùng của từng voucher hợp lệ (transaction, tránh race condition).
      for (const b of breakdown) {
        const voucherRef = db.collection("voucher").doc(b.ma);
        const suDungRef = voucherRef.collection("su_dung").doc(khach.email);
        await db.runTransaction(async (tx) => {
          tx.update(voucherRef, { so_lan_da_dung: FieldValue.increment(1) });
          tx.set(suDungRef, { so_lan: FieldValue.increment(1) }, { merge: true });
        });
      }

      const qrUrl = taoQRUrl(thanhTien, maDon);

      // Báo Telegram admin — BẮT BUỘC hiện đầy đủ hoá đơn (sản phẩm, giá, breakdown voucher).
      // Cố ý báo Ở BƯỚC NÀY (giai đoạn 2), không phải lúc tạo đơn nháp — tránh làm phiền
      // admin với các lượt khách chỉ xem trang thanh toán rồi bỏ đi không mua.
      const dongSanPham = sanPham.map((sp) => `• ${sp.slug}${sp.tenGoi ? " — " + sp.tenGoi : ""}: ${sp.gia.toLocaleString("vi-VN")}đ`).join("\n");
      const dongVoucher = breakdown.length
        ? breakdown.map((b) => `• Mã ${b.ma}: -${b.giam.toLocaleString("vi-VN")}đ`).join("\n")
        : "(không dùng mã nào)";
      const text =
        `🛒 <b>Đơn hàng mới: ${maDon}</b>\n\n` +
        `Khách: ${khach.ten} — ${khach.sdt} — ${khach.email}\n\n` +
        `<b>Sản phẩm:</b>\n${dongSanPham}\n\n` +
        `<b>Voucher:</b>\n${dongVoucher}\n\n` +
        `Tạm tính: ${tamTinh.toLocaleString("vi-VN")}đ\n` +
        `Giảm: -${tongGiam.toLocaleString("vi-VN")}đ\n` +
        `<b>Cần thanh toán: ${thanhTien.toLocaleString("vi-VN")}đ</b>`;

      await guiTelegramChoTatCaAdmin(TELEGRAM_BOT_TOKEN.value(), TELEGRAM_ADMIN_CHAT_IDS.value(), text, {
        inline_keyboard: [[
          { text: "✅ Duyệt", callback_data: `duyet:${maDon}` },
          { text: "❌ Từ chối", callback_data: `tuchoi:${maDon}` },
        ]],
      });

      res.json({ maDon, qrUrl, tamTinh, tongGiam, thanhTien, breakdown });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Lỗi xác nhận thanh toán" });
    }
  });
});

// ---------- Webhook Telegram (nút Duyệt/Từ chối) ----------

const telegramWebhook = onRequest({ invoker: "public", secrets: [TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_IDS, AUTOMATION_CONTROLLER_SECRET] }, async (req, res) => {
  try {
    const update = req.body;
    const cq = update.callback_query;
    if (!cq) return res.status(200).send("ok"); // không phải bấm nút, bỏ qua

    const token = TELEGRAM_BOT_TOKEN.value();
    const [hanhDong, maDon] = (cq.data || "").split(":");
    const tenAdmin = cq.from.first_name || cq.from.username || "admin";
    const donRef = db.collection("don_hang").doc(maDon);

    // KHOÁ NÚT NGAY KHI AI BẤM TRƯỚC — transaction đảm bảo 2 admin bấm gần như cùng lúc
    // chỉ 1 người "thắng", người còn lại nhận thông báo "đã xử lý bởi X".
    const ketQua = await db.runTransaction(async (tx) => {
      const doc = await tx.get(donRef);
      if (!doc.exists) return { daXuLy: false, loi: "Không tìm thấy đơn hàng" };
      const d = doc.data();
      if (d.admin_xu_ly) return { daXuLy: true, adminCu: d.admin_xu_ly };

      tx.update(donRef, {
        admin_xu_ly: tenAdmin,
        trang_thai: hanhDong === "duyet" ? "da_duyet" : "da_huy",
        ngay_duyet: Timestamp.now(),
      });
      return { daXuLy: false };
    });

    if (ketQua.daXuLy) {
      await telegramApi(token, "answerCallbackQuery", {
        callback_query_id: cq.id,
        text: `Đơn này đã được xử lý bởi ${ketQua.adminCu} rồi.`,
        show_alert: true,
      });
      return res.status(200).send("ok");
    }

    // Sửa lại tin nhắn gốc: bỏ nút, ghi rõ ai đã xử lý.
    await telegramApi(token, "editMessageText", {
      chat_id: cq.message.chat.id,
      message_id: cq.message.message_id,
      text: `${cq.message.text}\n\n${hanhDong === "duyet" ? "✅ Đã DUYỆT" : "❌ Đã TỪ CHỐI"} bởi ${tenAdmin}`,
      parse_mode: "HTML",
    });
    await telegramApi(token, "answerCallbackQuery", { callback_query_id: cq.id });

    if (hanhDong === "duyet") {
      // Không await trong request handler chính — chạy nền, lỗi tự báo qua guiCanhBaoLoi.
      xuLyDonHangSauDuyet(maDon).catch((e) => guiCanhBaoLoi(maDon, "xử lý sau khi duyệt", String(e)));
    }

    res.status(200).send("ok");
  } catch (e) {
    console.error(e);
    res.status(200).send("ok"); // luôn trả 200 cho Telegram dù lỗi, tránh Telegram tự retry spam
  }
});

// TẠM DÙNG 1 FILE GỐC DUY NHẤT cho CẢ Basic lẫn Premium (khách đã đồng ý ở vòng 71 — File
// A/File B vẫn đang được tách riêng, chưa xong kịp ngày khai trương). Key phải khớp ĐÚNG
// `slug` thật của sản phẩm (xem `data/products.js`/Firestore `san_pham` — hiện là
// "swiftcopy-drive"), KHÔNG PHẢI tên gói basic/premium. Khi tách xong File A/B thật, đổi
// sang cấu trúc { "swiftcopy-drive-basic": "...", "swiftcopy-drive-premium": "..." } và sửa
// lại chỗ tra cứu `FILE_MAU_THEO_SLUG[slugChinh]` bên dưới cho khớp gói thay vì chỉ theo slug.
const FILE_MAU_THEO_SLUG = {
  "swiftcopy-drive": "ĐIỀN_ID_FILE_GỐC_DÙNG_TẠM_VÀO_ĐÂY",
};
const THU_MUC_DICH_GIAO_HANG_ID = "ĐIỀN_ID_THƯ_MỤC_DRIVE_CHỨA_BẢN_COPY_MỚI_VÀO_ĐÂY";

/**
 * Chạy sau khi admin bấm Duyệt — luồng tự động Drive API/Apps Script API/email.
 *
 * TODO — CẦN BẠN CUNG CẤP THÊM THÔNG TIN trước khi bước 2b chạy thật (đúng điểm Phần 6.2 mục
 * 6 yêu cầu dừng lại hỏi): cấu trúc file bàn giao (đang do 1 AI khác tách File A/B riêng) —
 * cần biết mã bản quyền phải gắn vào đâu trong file đó (tên hàm/vị trí cụ thể trong code) rồi
 * mới điền tiếp bước "sửa nội dung" trong `automation-controller-source/Code.gs`
 * (`xuLyCopyVaDeploy_()`, đang để trống có chủ đích).
 */
async function xuLyDonHangSauDuyet(maDon) {
  const donRef = db.collection("don_hang").doc(maDon);
  const doc = await donRef.get();
  const donHang = doc.data();

  try {
    // BƯỚC 1 — gọi Bộ điều phối (Apps Script MỚI, xem automation-controller-source/) copy +
    // deploy bản dùng cho khách. Bỏ qua nếu chưa cấu hình xong (Phần 0 hoặc FILE_MAU_THEO_SLUG
    // chưa điền) — không chặn phần còn lại của đơn hàng, chỉ báo thiếu qua guiCanhBaoLoi cuối hàm.
    let ketQuaController = null;
    const slugChinh = (donHang.san_pham && donHang.san_pham[0] && donHang.san_pham[0].slug) || null;
    const fileIdMau = slugChinh && FILE_MAU_THEO_SLUG[slugChinh];
    if (isCloudFnReady_(AUTOMATION_CONTROLLER_URL) && fileIdMau && !fileIdMau.startsWith("ĐIỀN_") && !THU_MUC_DICH_GIAO_HANG_ID.startsWith("ĐIỀN_")) {
      // Vòng 119 — tên bản copy PHẢI bắt đầu bằng "SwiftCopy.Drive" (hardcode, không dựa vào
      // `tenGoi` vì tên đó có thể là "SwiftCopy.Drive — Basic"/"— Premium Team..." tuỳ gói) để
      // khách dễ nhận diện đây là ứng dụng của Swiftstreet ngay trong Drive/Apps Script của họ.
      const tenKhachChoTenFile = (donHang.khach && donHang.khach.ten) || (donHang.khach && donHang.khach.email) || "Khách hàng";
      ketQuaController = await goiControllerGAS("copy_and_deploy", {
        fileIdMau,
        thuMucDichId: THU_MUC_DICH_GIAO_HANG_ID,
        email: donHang.khach.email,
        tenBanSao: `SwiftCopy.Drive - ${tenKhachChoTenFile}`,
      });
      // Chuyển quyền sở hữu NGAY sau khi deploy thành công (tách action riêng, xem Code.gs Controller).
      await goiControllerGAS("transfer_ownership", { fileId: ketQuaController.fileId, emailKhach: donHang.khach.email });
    }

    // BƯỚC 2 — sinh mã bản quyền DÀI, KHÓ ĐOÁN (khác hẳn mã đơn hàng ngắn).
    const maBanQuyen = "BQ" + require("crypto").randomBytes(9).toString("hex");

    // BƯỚC 2b — TODO: gắn maBanQuyen vào file bàn giao (thiếu cấu trúc file bàn giao — xem
    // ghi chú TODO phía trên hàm này). Khi biết, sửa `xuLyCopyVaDeploy_()` trong Controller.

    // BƯỚC 3 — ghi collection công khai tra_cuu_ban_quyen (CHỈ dữ liệu an toàn, không PII đầy đủ).
    const tenSanPham = (donHang.san_pham || []).map((sp) => sp.slug).join(", ");
    const tenChe = donHang.khach.ten
      ? donHang.khach.ten.replace(/(?<=.{2}).(?=.*\s)/g, "*")
      : "Khách hàng";
    await db.collection("tra_cuu_ban_quyen").doc(maBanQuyen).set({
      ten_san_pham: tenSanPham,
      ngay_mua: Timestamp.now(),
      ten_khach_che: tenChe,
      ma_don_hang_lien_ket: maDon,
    });

    await donRef.update({ ma_ban_quyen: maBanQuyen, trang_thai: "da_duyet" });

    // BƯỚC 4 — gửi email khách kèm link file + mã bản quyền, qua action "send_email" của
    // Controller (dùng MailApp của hgntran.contact@gmail.com — khách đã đồng ý cách này).
    // Chỉ gửi được nếu BƯỚC 1 đã chạy thành công (có ketQuaController, tức có link web app thật).
    let daGuiEmail = false;
    if (ketQuaController) {
      const webAppUrl =
        ketQuaController.deployment &&
        ketQuaController.deployment.entryPoints &&
        ketQuaController.deployment.entryPoints[0] &&
        ketQuaController.deployment.entryPoints[0].webApp &&
        ketQuaController.deployment.entryPoints[0].webApp.url;
      if (webAppUrl) {
        await goiControllerGAS("send_email", {
          toEmail: donHang.khach.email,
          tenKhach: donHang.khach.ten,
          tenSanPham,
          webAppUrl,
          maBanQuyen,
        });
        daGuiEmail = true;
      }
    }

    await guiCanhBaoLoi(
      maDon,
      daGuiEmail ? "HOÀN TẤT" : "HOÀN TẤT (một phần)",
      daGuiEmail
        ? `Đã copy+deploy+chuyển quyền sở hữu file, sinh mã bản quyền ${maBanQuyen}, và gửi email cho khách thành công.`
        : `Đã sinh mã bản quyền ${maBanQuyen} và ghi tra_cuu_ban_quyen. CÒN THIẾU: chưa gửi được email cho khách vì ${ketQuaController ? "không lấy được link web app từ Controller (kiểm tra lại cấu trúc trả về của copy_and_deploy)." : "CHƯA gọi Controller (thiếu FILE_MAU_THEO_SLUG/THU_MUC_DICH_GIAO_HANG_ID hoặc AUTOMATION_CONTROLLER_URL — điền vào đầu file index.js)."} Ngoài ra vẫn còn TODO bước "sửa nội dung gắn email khách vào file" trong Controller (chờ biết cấu trúc file bàn giao File A/B) — mã bản quyền/kiểm tra chống dùng lậu chưa được nhúng vào bên trong file khách nhận.`
    );
  } catch (e) {
    await donRef.update({ trang_thai: "loi" });
    throw e; // để guiCanhBaoLoi ở nơi gọi hàm này bắt được
  }
}

// ---------- CTV (Phương án B) ----------
// Xem docs/firestore/03b-ctv-auth-phuong-an-b.md để hiểu đầy đủ luồng.

const crypto = require("crypto");

function bamMaQuanLy(maGoc) {
  return crypto.createHash("sha256").update(maGoc).digest("hex");
}

/** POST { ten, email, sdt } -> tạo document chờ duyệt. */
const dangKyCTV = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  cors(req, res, async () => {
    try {
      const { ten, email, sdt } = req.body || {};
      if (!ten || !email) return res.status(400).json({ error: "Thiếu tên hoặc email" });
      const ref = await db.collection("ctv_cho_duyet").add({
        ten, email, sdt: sdt || "",
        trang_thai: "cho_duyet",
        ngay_dang_ky: Timestamp.now(),
      });
      res.json({ id: ref.id, message: "Đăng ký thành công, chờ admin duyệt." });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Lỗi đăng ký CTV" });
    }
  });
});

/** POST { id, maCTV } (id = document trong ctv_cho_duyet, maCTV = mã hiển thị vd "CTV0042") — CHỈ admin gọi (gọi từ dashboard Khu C đã xác thực admin riêng). */
const duyetCTV = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  cors(req, res, async () => {
    try {
      const { id, maCTV } = req.body || {};
      const choDuyetDoc = await db.collection("ctv_cho_duyet").doc(id).get();
      if (!choDuyetDoc.exists) return res.status(404).json({ error: "Không tìm thấy đăng ký" });
      const d = choDuyetDoc.data();

      const maQuanLyGoc = crypto.randomBytes(18).toString("base64url"); // chỉ hiện 1 lần duy nhất
      const userRecord = await auth.createUser({}); // Firebase tự sinh UID, KHÔNG cần email/mật khẩu

      await db.collection("ctv").doc(userRecord.uid).set({
        ma_ctv: maCTV,
        ten: d.ten,
        email: d.email,
        ma_quan_ly_hash: bamMaQuanLy(maQuanLyGoc),
        trang_thai: "hoat_dong",
        hoa_hong_phan_tram: 10,
        tong_don_gioi_thieu: 0,
        tong_hoa_hong: 0,
        da_tra: 0,
        ngay_dang_ky: d.ngay_dang_ky,
      });
      await db.collection("ctv_cho_duyet").doc(id).delete();

      // TODO: gửi maQuanLyGoc cho CTV qua email (dùng lại endpoint GAS gửi email khi đã có
      // GAS_WEB_APP_URL thật — xem ghi chú TODO ở xuLyDonHangSauDuyet()).
      res.json({ uid: userRecord.uid, maQuanLyGoc, message: "Đã duyệt — GỬI maQuanLyGoc CHO CTV NGAY, sẽ không hiện lại được nữa." });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Lỗi duyệt CTV" });
    }
  });
});

/** POST { maQuanLy } -> { customToken } để client tự firebase.auth().signInWithCustomToken(...) */
const dangNhapCTV = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  cors(req, res, async () => {
    try {
      const { maQuanLy } = req.body || {};
      if (!maQuanLy) return res.status(400).json({ error: "Thiếu mã quản lý" });
      const hash = bamMaQuanLy(maQuanLy);
      const snap = await db.collection("ctv").where("ma_quan_ly_hash", "==", hash).limit(1).get();
      if (snap.empty) return res.status(401).json({ error: "Mã quản lý không đúng" });

      const uid = snap.docs[0].id;
      const customToken = await auth.createCustomToken(uid);
      res.json({ customToken });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Lỗi đăng nhập CTV" });
    }
  });
});

module.exports = { kiemTraVoucher, taoDonHangNhap, xacNhanThanhToan, telegramWebhook, dangKyCTV, duyetCTV, dangNhapCTV };
