# Xác thực CTV — Phương án B (Cloud Function + mã quản lý, không dùng mật khẩu truyền thống)

Đúng theo yêu cầu: CTV tự đăng ký → chờ duyệt → admin duyệt thủ công → cấp **mã quản lý**
(không phải email+mật khẩu kiểu thông thường).

## Luồng chi tiết

1. **Đăng ký** — CTV (hoặc admin đăng ký thay) mở trang đăng ký (nằm trong dashboard Khu C,
   Firebase Hosting riêng — KHÔNG đặt trên site Swiftstreet công khai), điền tên/email/SĐT,
   gửi lên Cloud Function `dangKyCTV`. Function tạo 1 document trong collection tạm
   `ctv_cho_duyet/{autoId}` với `trang_thai: "cho_duyet"` — **CHƯA có tài khoản đăng nhập
   thật ở bước này**.

2. **Admin duyệt** — trong dashboard Khu C, admin thấy danh sách chờ duyệt, bấm "Duyệt" →
   gọi Cloud Function `duyetCTV(id)`:
   - Sinh `ma_ctv` (vd `CTV0042`) và 1 **mã quản lý** ngẫu nhiên, dài, khó đoán (vd chuỗi 24
     ký tự) — đây là thứ CTV dùng để đăng nhập, KHÔNG phải mật khẩu họ tự đặt.
   - Tạo 1 tài khoản Firebase Auth (không cần email/mật khẩu, chỉ cần 1 UID nội bộ) bằng
     `admin.auth().createUser({ uid: ... })`.
   - Lưu **BẢN BĂM (hash)** của mã quản lý vào Firestore (`ctv/{uid}`) — KHÔNG lưu mã gốc ở
     bất kỳ đâu, kể cả trong database (giống nguyên tắc không bao giờ lưu mật khẩu dạng chữ
     thường của bất kỳ hệ thống nào).
   - Gửi mã quản lý gốc (chỉ hiện DUY NHẤT 1 LẦN) qua email cho CTV.
   - Chuyển dữ liệu từ `ctv_cho_duyet` sang `ctv/{uid}`, đổi `trang_thai: "hoat_dong"`.

3. **Đăng nhập** — CTV vào link riêng, nhập mã quản lý → gọi Cloud Function
   `dangNhapCTV(maQuanLy)`:
   - Function so khớp bản băm trong Firestore.
   - Nếu khớp: dùng `admin.auth().createCustomToken(uid)`, trả token này về cho trình duyệt.
   - Trình duyệt gọi `firebase.auth().signInWithCustomToken(token)` — từ giờ CTV đã đăng
     nhập thật qua Firebase Auth, Firestore Rules tự nhận diện đúng `request.auth.uid`.

## Vì sao thiết kế này an toàn hơn "lưu mã CTV thẳng trong code/Firestore rồi so sánh chuỗi"

- Mã quản lý KHÔNG BAO GIỜ lưu dạng đọc được — kể cả nếu Firestore Project B bị truy cập
  trái phép (rules lỗi, key rò rỉ...), kẻ tấn công chỉ thấy bản băm, không suy ngược ra được
  mã gốc để giả danh CTV.
- Việc so khớp + cấp quyền đăng nhập luôn đi qua Cloud Function (server), không có đường nào
  để client tự "so sánh mã rồi tự cho mình quyền" — khác hẳn kiểu code sai lầm phổ biến là
  so sánh mã ngay trên JavaScript trình duyệt (ai cũng đọc được, sửa được).
- Đây chính là lý do Cloud Function bắt buộc phải tồn tại cho tính năng này (không thể làm
  bằng Firestore Rules thuần).

## 2 cách kiếm hoa hồng (đã chốt)

- **(a) Link giới thiệu riêng** — CTV có link dạng
  `https://swiftstreet.../?ref=CTV0042`. Trang thanh toán đọc `ref` từ URL LÚC KHÁCH ĐANG Ở
  TRONG PHIÊN TRUY CẬP ĐÓ (lưu tạm vào `sessionStorage`, KHÔNG dùng cookie dài hạn) — nếu
  khách thanh toán trong CÙNG phiên đó, đơn hàng gắn `ctv_id` tương ứng. Rời trang rồi quay
  lại bằng link thường (không `?ref=`) → phiên mới, không còn `ref` → KHÔNG tính công.
- **(b) Mã voucher riêng của CTV** (`voucher/{ma}` có `ctv_id` khác null) — dùng mã này lúc
  thanh toán vừa giảm giá cho khách, vừa tự động gắn `ctv_id` vào đơn hàng — không phụ thuộc
  phiên truy cập, hoạt động cả khi khách bỏ qua nhiều ngày rồi mới quay lại mua bằng mã.
