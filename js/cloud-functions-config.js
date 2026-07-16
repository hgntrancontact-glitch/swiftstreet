/**
 * URL các Cloud Function (Project B) — ĐIỀN sau khi deploy xong (xem
 * docs/setup/02-cloud-functions.md). Dạng URL: `https://<region>-<project-id>.cloudfunctions.net/<tenFunction>`
 * (Firebase in ra đúng URL này ngay sau khi `firebase deploy --only functions` chạy xong).
 *
 * Cũng như firebase-config.js — cho tới khi điền xong, code liên quan (kiểm tra voucher...)
 * tự nhận biết CHƯA cấu hình và hiện thông báo nhẹ nhàng, KHÔNG làm vỡ trang.
 */
const CLOUD_FN_URLS = {
  kiemTraVoucher: "https://kiemtravoucher-zd2httdvpa-uc.a.run.app",
  // Tạo đơn NGAY khi khách vào trang thanh toán (giai đoạn 1 — chỉ sản phẩm, chưa cần
  // thông tin khách) — để mã đơn hàng ỔN ĐỊNH ngay từ đầu, không đổi khi tải lại trang.
  taoDonHangNhap: "https://taodonhangnhap-zd2httdvpa-uc.a.run.app",
  // Xác nhận đơn khi khách bấm "Thanh toán" (giai đoạn 2 — gắn thông tin khách + voucher
  // cuối cùng vào ĐÚNG mã đã tạo ở giai đoạn 1, rồi mới báo Telegram admin).
  xacNhanThanhToan: "https://xacnhanthanhtoan-zd2httdvpa-uc.a.run.app",
};

function isCloudFnReady(url) {
  return !!url && !url.startsWith("ĐIỀN_");
}
