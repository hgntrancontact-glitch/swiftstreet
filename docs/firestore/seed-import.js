/**
 * Script CHẠY 1 LẦN để nạp dữ liệu mẫu (đúng nội dung đang có trên site hiện tại) vào
 * Firestore Project A — để chuyển từ data/products.js tĩnh sang Firestore mà KHÔNG mất dữ
 * liệu đang có.
 *
 * CÁCH DÙNG:
 * 1. Cài đặt: `npm install firebase-admin` (chạy trong cùng thư mục chứa file này).
 * 2. Lấy Service Account key: Firebase Console → Project A → ⚙️ Project settings →
 *    "Service accounts" → "Generate new private key" → tải file .json về, đặt cùng thư mục,
 *    đổi tên thành `serviceAccountKey.json` (đã có sẵn trong .gitignore mẫu bên dưới —
 *    KHÔNG BAO GIỜ commit file này lên GitHub, đây là chìa khoá full-quyền vào Firestore).
 * 3. Chạy: `node seed-import.js`
 */
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("./serviceAccountKey.json");
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "seed", name), "utf-8"));
}

async function main() {
  const sanPham = readJSON("san_pham.json");
  const thongBao = readJSON("thong_bao.json");
  const danhGia = readJSON("danh_gia.json");
  const cauHinh = readJSON("cau_hinh.json");

  const batch1 = db.batch();
  for (const [slug, data] of Object.entries(sanPham)) {
    batch1.set(db.collection("san_pham").doc(slug), data);
  }
  await batch1.commit();
  console.log(`Đã nạp ${Object.keys(sanPham).length} sản phẩm vào collection san_pham.`);

  const batch2 = db.batch();
  const now = Timestamp.now();
  thongBao.forEach((item, i) => {
    // ngay_tao lùi dần theo thứ tự trong mảng để giữ đúng thứ tự hiển thị ban đầu
    const ngay = Timestamp.fromMillis(now.toMillis() - i * 3600 * 1000);
    batch2.set(db.collection("thong_bao").doc(), { ...item, ngay_tao: ngay });
  });
  await batch2.commit();
  console.log(`Đã nạp ${thongBao.length} thông báo vào collection thong_bao.`);

  const batch3 = db.batch();
  danhGia.forEach((item) => {
    batch3.set(db.collection("danh_gia").doc(), { ...item, ngay_tao: now });
  });
  await batch3.commit();
  console.log(`Đã nạp ${danhGia.length} đánh giá vào collection danh_gia.`);

  const batch4 = db.batch();
  for (const [id, data] of Object.entries(cauHinh)) {
    batch4.set(db.collection("cau_hinh").doc(id), data);
  }
  await batch4.commit();
  console.log(`Đã nạp cấu hình (${Object.keys(cauHinh).join(", ")}) vào collection cau_hinh.`);

  console.log("XONG. Kiểm tra lại trong Firebase Console → Firestore Database.");
}

main().catch((err) => {
  console.error("Lỗi khi nạp dữ liệu:", err);
  process.exit(1);
});
