/**
 * Cấu hình Firebase — ĐIỀN GIÁ TRỊ THẬT SAU KHI HOÀN TẤT docs/setup/01-firebase-firestore-blaze.md
 *
 * Project A (công khai — sản phẩm/thông báo/đánh giá/banner) dùng ở MỌI trang.
 * Project B (nhạy cảm — voucher/CTV/đơn hàng) chỉ cần ở trang thanh toán + dashboard Khu C.
 *
 * QUAN TRỌNG: cho tới khi bạn điền config thật vào đây, toàn bộ trang web VẪN CHẠY BÌNH
 * THƯỜNG bằng dữ liệu tĩnh có sẵn (data/products.js, NOTIFICATIONS, REVIEWS trong main.js)
 * — xem `js/firestore-content.js`, mọi hàm đọc Firestore đều tự rơi về dữ liệu tĩnh nếu
 * chưa cấu hình xong hoặc gọi Firestore bị lỗi. Không có bước nào ở đây làm sập trang.
 */
const FIREBASE_CONFIG_A = {
  apiKey: "AIzaSyCJvIFPeBiZsbhdSSUBp7cec4KwBCyDHFA",
  authDomain: "swiftstreet-shop.firebaseapp.com",
  projectId: "swiftstreet-shop",
  storageBucket: "swiftstreet-shop.firebasestorage.app",
  messagingSenderId: "265275021093",
  appId: "1:265275021093:web:b257cc0303dae980dd6ccc",
};

const FIREBASE_CONFIG_B = {
  apiKey: "AIzaSyBmGy7vEvesShW83txV0xbq8gRgTiDArzQ",
  authDomain: "swiftstreet-admin.firebaseapp.com",
  projectId: "swiftstreet-admin",
  storageBucket: "swiftstreet-admin.firebasestorage.app",
  messagingSenderId: "843736791484",
  appId: "1:843736791484:web:e711c93dfe8ac3b6eb93b9",
};

/** true nếu config đã được điền thật (không còn placeholder "ĐIỀN_..."). */
function isFirebaseConfigReady(config) {
  return !!(config && config.apiKey && !config.apiKey.startsWith("ĐIỀN_"));
}
