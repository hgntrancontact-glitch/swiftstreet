# Bước 1 — Tạo 2 project Firebase, bật Firestore, bật gói Blaze

Bạn cần tạo **2 project riêng biệt** (đúng quyết định kiến trúc đã chốt):

- **Project A** — công khai, chứa dữ liệu sản phẩm/thông báo/cấu hình trang chủ. Gợi ý tên: `swiftstreet-shop`.
- **Project B** — nhạy cảm, chứa voucher/CTV/khách hàng/đơn hàng + Cloud Functions. Gợi ý tên: `swiftstreet-admin`.

Làm đúng các bước dưới đây **2 LẦN** (1 lần cho mỗi project). Tên project chỉ là gợi ý —
đặt tên nào cũng được, miễn bạn phân biệt được A/B.

## 1. Tạo project

1. Vào https://console.firebase.google.com, đăng nhập bằng tài khoản Google bạn muốn dùng để quản trị (nên dùng đúng email quản lý chính, không dùng tài khoản cá nhân lặt vặt).
2. Bấm **"Add project" / "Thêm dự án"**.
3. Đặt tên project (vd `swiftstreet-shop`). Firebase tự sinh 1 Project ID (chuỗi không dấu, có thể có số ở cuối) — có thể bấm bút chì để sửa lại ID cho gọn nếu muốn, nhưng không bắt buộc.
4. Màn hỏi bật Google Analytics — **có thể bấm "Không kích hoạt"** (Analytics không cần cho hệ thống này), bấm "Tạo dự án" luôn cho nhanh.
5. Đợi khoảng 30-60 giây tới khi tạo xong, bấm "Tiếp tục".

## 2. Bật Firestore

1. Trong sidebar trái, tìm mục **"Build"** → bấm **"Firestore Database"**.
2. Bấm **"Create database" / "Tạo cơ sở dữ liệu"**.
3. Chọn **"Start in production mode" (chế độ chuẩn sản xuất)** — **KHÔNG chọn chế độ test**. Đọc file [`05-firestore-rules-giai-thich.md`](05-firestore-rules-giai-thich.md) nếu muốn hiểu rõ lý do trước khi bấm.
4. Chọn khu vực máy chủ (location) — gợi ý **`asia-southeast1 (Singapore)`** cho độ trễ thấp nhất với người dùng Việt Nam. **Lưu ý: KHÔNG thể đổi lại sau khi đã chọn** — chọn kỹ trước khi bấm tiếp.
5. Bấm "Enable/Bật" và đợi vài chục giây.

## 3. Bật gói Blaze (Pay as you go)

**Vì sao bắt buộc**: gói miễn phí (Spark) KHÔNG cho phép Cloud Functions gọi ra ngoài
internet (gọi Telegram, gọi GAS...) — chỉ gói Blaze mới làm được việc này.

**Có tốn tiền không**: Blaze vẫn có hạn mức miễn phí hàng tháng khá rộng (ví dụ: Firestore
~50.000 lượt đọc + 20.000 lượt ghi/ngày, Cloud Functions ~2 triệu lượt gọi/tháng) — 1 cửa
hàng nhỏ mới mở gần như chắc chắn KHÔNG vượt hạn mức này, nghĩa là hoá đơn thực tế = 0đ.
Điểm khác biệt DUY NHẤT so với gói free là **bắt buộc gắn 1 thẻ ngân hàng** để Google xác
minh danh tính (đề phòng vượt hạn mức, lúc đó mới tính phí theo mức dùng thêm).

**Các bước:**
1. Trong sidebar trái, cuộn xuống cuối, bấm bánh răng ⚙️ cạnh "Project Overview" → **"Usage and billing" / "Sử dụng và thanh toán"**.
2. Bấm **"Modify plan" / "Sửa đổi gói"** (hoặc nút "Upgrade/Nâng cấp").
3. Chọn **"Blaze — Pay as you go"**.
4. Làm theo hướng dẫn để liên kết 1 tài khoản thanh toán Google Cloud (nếu chưa có, hệ thống sẽ dẫn bạn tạo mới — cần nhập thông tin thẻ).
5. Xác nhận nâng cấp.

**Lưu ý an toàn**: bạn có thể đặt **ngân sách cảnh báo** (Budget alert) trong Google Cloud
Console (mục Billing → Budgets & alerts) để email báo ngay nếu chi phí vượt 1 mức bạn chọn
(vd 50.000đ/tháng) — nên làm bước này để yên tâm, dù khả năng vượt hạn mức free rất thấp.

## 4. Lấy Firebase config (dán vào code)

1. Bấm bánh răng ⚙️ → **"Project settings" / "Cài đặt dự án"**.
2. Tab **"General"**, cuộn xuống mục **"Your apps" / "Ứng dụng của bạn"**.
3. Bấm icon **`</>`** (Web) để đăng ký 1 web app mới.
4. Đặt tên app (vd `swiftstreet-web`) — **KHÔNG cần tick "Also set up Firebase Hosting"** (Swiftstreet vẫn dùng Cloudflare Pages như hiện tại).
5. Bấm "Đăng ký ứng dụng" — Firebase hiện ra 1 đoạn code chứa object `firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", ... }`.
6. **Copy nguyên đoạn này**, dán vào đúng nơi placeholder trong code (tôi sẽ để rõ tên file/vị trí, tìm dòng có chữ `ĐIỀN_FIREBASE_CONFIG_PROJECT_A_VÀO_ĐÂY` hoặc `..._PROJECT_B_...`).

Lặp lại TOÀN BỘ 4 bước trên cho Project B.

## Việc gì làm được ngay, việc gì phải chờ

- Sau bước 2 (bật Firestore) của CẢ 2 project: tôi có thể bắt đầu deploy Security Rules + seed dữ liệu mẫu để bạn xem thử.
- Sau bước 3 (Blaze) của Project B: mới có thể deploy Cloud Functions thật (xem file `02-cloud-functions.md`).
- Sau bước 4 (lấy config) của CẢ 2 project: trang web mới thật sự đọc/ghi được Firestore trên trình duyệt — trước đó mọi thứ tôi viết chỉ chạy được ở dạng code tĩnh, chưa kết nối thật.
