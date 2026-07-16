# Tổng quan Phần 0 — Hạ tầng cần dựng trước khi hệ thống mới hoạt động thật

5 file trong thư mục này là hướng dẫn từng bước để BẠN tự làm — tôi (Claude) không thể tự
đăng ký tài khoản Google/Telegram/VietQR thay bạn vì mọi bước đều cần đăng nhập bằng danh
tính của chính bạn (email, số điện thoại, thẻ ngân hàng...).

**Thứ tự nên làm:**

1. [`01-firebase-firestore-blaze.md`](01-firebase-firestore-blaze.md) — tạo 2 project
   Firebase (Project A công khai + Project B nhạy cảm), bật Firestore, bật gói Blaze.
2. [`05-firestore-rules-giai-thich.md`](05-firestore-rules-giai-thich.md) — đọc TRƯỚC khi
   bật Firestore ở bước 1 để hiểu vì sao không được để nguyên "chế độ test".
3. [`02-cloud-functions.md`](02-cloud-functions.md) — dựng Cloud Functions trong Project B.
4. [`03-telegram-bot.md`](03-telegram-bot.md) — tạo bot Telegram + lấy Chat ID admin.
5. [`04-vietqr.md`](04-vietqr.md) — lấy thông tin để tạo QR chuyển khoản động.
6. [`07-test-apps-script-api.md`](07-test-apps-script-api.md) — **có thể làm SONG SONG,
   không cần chờ các bước trên** — tự test hạn mức Drive API bằng tài khoản phụ.
7. [`06-tu-dong-hoa-gas-de-xuat.md`](06-tu-dong-hoa-gas-de-xuat.md) — ĐỀ XUẤT thiết kế nối
   Cloud Function ↔ SwiftCopy.Drive — **ĐÃ CHỌN Phương án B**, xem file 08 để triển khai.
8. [`08-tao-apps-script-controller.md`](08-tao-apps-script-controller.md) — tạo "Bộ điều
   phối" (Apps Script MỚI, Phương án B) — làm SAU khi xong bước 1 (không bắt buộc, nhưng cần
   xong trước khi luồng duyệt đơn tự động thật sự copy/deploy được file cho khách).

**Trong lúc bạn làm 5 bước trên, tôi code song song** — mọi chỗ cần thông tin từ các bước
này (Firebase config, token bot, số tài khoản ngân hàng...) đều để placeholder rõ ràng dạng
`ĐIỀN_..._VÀO_ĐÂY`, không chặn tiến độ code các phần khác.

**Việc BẮT BUỘC phải xong TRƯỚC KHI CÓ THỂ TEST THẬT** (không thể bỏ qua):
- Bước 1-2 (Firebase) — nếu không có, mọi tính năng đọc/ghi Firestore không chạy được, kể cả xem thử trên máy bạn.
- Bước 3 — nếu không có, code Cloud Functions viết ra không deploy lên đâu được.
- Bước 4-5 — nếu không có, Telegram/QR chỉ chạy ở dạng giả lập/placeholder.

**Việc CÓ THỂ trì hoãn tới sau ngày khai trương** (đã có quy trình duyệt tay thay thế):
- Bot Telegram thật (bước 4) — nếu chưa kịp làm, admin vẫn duyệt bằng cách tự kiểm tra
  ngân hàng như hiện tại, không có luồng nào bị chặn.
- VietQR đăng ký tài khoản chính thức (bước 5) — endpoint ảnh QR công khai của VietQR có
  thể dùng ngay không cần tài khoản (xem chi tiết trong file đó), đăng ký chính thức chỉ để
  tăng độ ổn định lâu dài.
