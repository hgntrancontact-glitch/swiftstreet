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

/**
 * Thông tin ngân hàng nhận tiền — CÙNG giá trị với `BANK_BIN`/`BANK_ACCOUNT_NUMBER`/
 * `BANK_ACCOUNT_NAME` trong `cloud-functions-source/functions/index.js` (điền cả 2 nơi khi có
 * thông tin thật, xem `docs/setup/04-vietqr.md`). Đặt ở đây (client) vì 3 giá trị này DÙ SAO
 * cũng hiện thành chữ thường trên trang thanh toán — không phải bí mật thật sự cần giấu, nên
 * expose ra client để tự vẽ lại mã QR NGAY khi tổng tiền đổi (áp dụng voucher...) mà không
 * cần gọi lại Cloud Function mỗi lần (tránh tạo đơn hàng mới/tốn round-trip không cần thiết).
 */
const BANK_INFO = {
  bin: "ĐIỀN_MÃ_BIN_NGÂN_HÀNG_VÀO_ĐÂY",
  accountNumber: "ĐIỀN_SỐ_TK_CỦA_BẠN_VÀO_ĐÂY",
  accountName: "ĐIỀN_TÊN_CHỦ_TK_VÀO_ĐÂY",
  tenNganHang: "ĐIỀN_TÊN_NGÂN_HÀNG_VÀO_ĐÂY", // tên hiển thị cho khách xem (vd "Vietcombank") — KHÁC mã BIN (số)
};

function banKInfoReady() {
  return Object.values(BANK_INFO).every((v) => !!v && !v.startsWith("ĐIỀN_"));
}

/** Tạo URL ảnh QR VietQR (endpoint ảnh công khai, không cần đăng ký) cho ĐÚNG số tiền/nội dung. */
function taoQRUrlClient(soTien, noiDungCK) {
  const params = new URLSearchParams({
    amount: String(soTien),
    addInfo: noiDungCK,
    accountName: BANK_INFO.accountName,
  });
  return `https://img.vietqr.io/image/${BANK_INFO.bin}-${BANK_INFO.accountNumber}-compact2.png?${params.toString()}`;
}
