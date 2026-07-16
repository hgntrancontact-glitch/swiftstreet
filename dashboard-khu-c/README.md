# Dashboard Khu C — khung (skeleton), chưa nối Firestore/Auth thật

Đây là dashboard quản lý sản phẩm/CTV/đơn hàng/thông báo/voucher — theo kiến trúc đã chốt,
**PHẢI deploy tách biệt hoàn toàn khỏi Cloudflare Pages của Swiftstreet** (không có link nào
từ site công khai trỏ tới đây).

## Trạng thái hiện tại

- Toàn bộ giao diện + thao tác (chuyển tab, kéo-thả sản phẩm, kéo-thả ảnh, tải ảnh xem
  trước, duyệt CTV, đổi trạng thái chăm sóc đơn hàng, thêm/xoá thông báo, tạo voucher) **CHẠY
  THẬT trên trình duyệt** — nhưng dữ liệu là MOCK cục bộ (khai báo đầu file `js/dashboard.js`),
  KHÔNG đọc/ghi Firestore. Tải lại trang là mất thay đổi.
- Đăng nhập (`index.html`) chỉ là khung — bấm "Đăng nhập" với bất kỳ email/mật khẩu nào cũng
  vào thẳng dashboard, CHƯA xác thực qua Firebase Auth thật.
- Mọi điểm cần nối Firestore thật đều có comment `// TODO:` ngay tại chỗ, kèm đoạn code mẫu.

## Cách chạy thử ngay bây giờ (không cần Firebase)

Mở trực tiếp `index.html` bằng trình duyệt (hoặc `python3 -m http.server` trong thư mục này
rồi mở `localhost:8000`) — không cần server đặc biệt, đây vẫn là HTML/CSS/JS thuần không
build, giống Swiftstreet.

## Việc cần làm khi Project B (Firebase) đã sẵn sàng

1. Thêm `<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js">`
   + `firebase-auth-compat.js` + `firebase-firestore-compat.js` vào cả 2 file HTML, cùng 1
   file config (copy `FIREBASE_CONFIG_B` từ `js/firebase-config.js` bên repo Swiftstreet chính).
2. `js/dashboard-auth.js`: thay bằng `firebase.auth().signInWithEmailAndPassword(...)`.
3. `js/dashboard.js`: thay từng mảng `MOCK_*` bằng `db.collection("...").get()` tương ứng
   (đúng tên collection đã dùng trong mock, xem `docs/firestore/` bên repo Swiftstreet chính
   để đối chiếu schema).
4. Ảnh sản phẩm: nối Firebase Storage thật (xem TODO trong `renderImageGrid()`).
5. Nút "Duyệt" CTV: gọi Cloud Function `duyetCTV` thật (xem
   `cloud-functions-source/functions/index.js` bên repo Swiftstreet chính).

## Deploy khi sẵn sàng tách hẳn khỏi repo Swiftstreet

Thư mục này hiện nằm TẠM trong repo Swiftstreet chỉ để tiện code/review — khi triển khai
thật, nên tách thành 1 repo Git riêng + deploy bằng Firebase Hosting (`firebase init
hosting`, chọn thư mục này làm public dir) để đúng yêu cầu "không liên kết với site công khai".
