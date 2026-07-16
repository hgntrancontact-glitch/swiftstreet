# Kế hoạch tới ngày khai trương 18/07/2026 — TẤT CẢ đều ưu tiên

Vì đây là lần khai trương ĐẦU TIÊN (chưa từng bán đơn nào), không có quy trình cũ để dựa
vào — toàn bộ danh sách dưới đây đều cần xong. Chia theo NGƯỜI LÀM để dễ theo dõi.

---

## GIAI ĐOẠN 1 — Bạn tự làm, đã có hướng dẫn sẵn từng bước

- [ ] **`docs/setup/02-cloud-functions.md`** — cài Firebase CLI, `firebase init functions`
      (chọn project `swiftstreet-admin`), copy code từ `cloud-functions-source/`, deploy.
      Trong lúc deploy cần đặt 3 secret:
      ```
      firebase functions:secrets:set TELEGRAM_BOT_TOKEN
      firebase functions:secrets:set TELEGRAM_ADMIN_CHAT_IDS
      firebase functions:secrets:set AUTOMATION_CONTROLLER_SECRET
      ```
      (2 giá trị Telegram lấy ở Giai đoạn này bước dưới; giá trị Controller là chuỗi bạn đã
      đặt ở Script Properties của Bộ điều phối, xem lại `docs/setup/08` bước 3.)
- [ ] **`docs/setup/03-telegram-bot.md`** — tạo bot qua BotFather, lấy Token + Chat ID admin.

## GIAI ĐOẠN 2 — Cần BẠN CUNG CẤP THÔNG TIN để tôi sửa code (trả lời bằng văn bản là đủ)

1. **Thông tin ngân hàng thật** (Ngân hàng / Mã BIN / Số tài khoản / Tên chủ tài khoản) — xem
   cách tra mã BIN tại `docs/setup/04-vietqr.md`. Đang hiện GIẢ trên `thanh-toan.html`
   (Vietcombank/CTY SWIFTSTREET/0071000123456) — cần sửa gấp trước khi có khách thật nhìn thấy.
2. **URL các Cloud Function** sau khi deploy xong Giai đoạn 1 (Firebase tự in ra 1 danh sách
   URL dạng `https://<region>-swiftstreet-admin.cloudfunctions.net/<tên hàm>` — gửi tôi
   nguyên danh sách đó, tôi tự điền đúng chỗ).
3. **File bàn giao (File A/File B)** — bạn từng nói 1 Claude khác đang tách, CHƯA xong. Cần
   biết: đã xong chưa? Nếu CHƯA xong kịp 18/7, tôi cần biết dùng TẠM file gốc (1 file duy
   nhất, đủ cả 2 tính năng) cho MỌI gói (Basic lẫn Premium) tới khi tách xong sau — bạn đồng
   ý phương án tạm này không? Nếu đồng ý, cho tôi ID file gốc thật (không phải bản test) + 1
   ID thư mục Drive THẬT (khác thư mục TEST đã dùng) để chứa bản copy cho khách thật.
4. **Cách gửi email cho khách** (file + mã bản quyền) — CHƯA quyết định. Đề xuất: dùng
   `GmailApp`/`MailApp` ngay trong chính Bộ điều phối (Apps Script có sẵn, miễn phí trong
   hạn mức ~100 email/ngày qua tài khoản Gmail thường) — bạn đồng ý cách này không, hay muốn
   cách khác?

## GIAI ĐOẠN 3 — Bạn phối hợp với Claude bên gas-dashboard (nội dung đã chuẩn bị sẵn)

5. Gửi đoạn yêu cầu sau cho Claude đang làm gas-dashboard (đã viết sẵn ở tin nhắn trước, lặp
   lại ở đây cho tiện copy):

   > "Cần thêm cơ chế: khi khách mở link web app, so sánh email tài khoản Google đang đăng
   > nhập với 1 email đã nhét sẵn trong code lúc tạo bản sao cho khách — khớp thì chạy bình
   > thường, không khớp thì chặn. Để phía tự động hoá (1 Claude khác đang làm) nhét đúng
   > email vào, cần bạn: (1) chọn 1 chuỗi placeholder cố định (vd `__CUSTOMER_EMAIL__`), (2)
   > rải chuỗi đó vào (các) vị trí trong code sẽ dùng để so sánh, (3) cho biết chuỗi đó nằm
   > trong (những) file nào (Code.gs/Index.html/JavaScript.html) để bên tự động hoá tìm đúng
   > chỗ thay thế bằng email thật."

   Gửi lại tôi câu trả lời của Claude đó (tên placeholder + file chứa) để tôi hoàn thiện
   Bộ điều phối.

## GIAI ĐOẠN 4 — Tôi code (làm ngay khi có đủ thông tin ở Giai đoạn 2-3, không cần chờ hết mới bắt đầu — làm dần theo thông tin có trước)

- [ ] Sửa `thanh-toan.html` dùng thông tin ngân hàng thật (chờ mục 1).
- [ ] Điền `js/cloud-functions-config.js` (chờ mục 2) + nối THẬT nút "Thanh toán" gọi
      `xacNhanThanhToan` (thay đoạn toast giả hiện tại).
- [ ] Điền `FILE_MAU_THEO_SLUG`/`THU_MUC_DICH_GIAO_HANG_ID` trong Cloud Function (chờ mục 3).
- [ ] Hoàn thiện bước "gắn email khách" trong Bộ điều phối (chờ mục 5 từ Giai đoạn 3).
- [ ] Viết action gửi email khách trong Bộ điều phối (chờ mục 4).
- [ ] Viết action `update_email` (đổi email khi khách yêu cầu qua admin).
- [ ] Xây trang thật "Chúc mừng đã thanh toán" (đã duyệt mockup 2 cột) + trang "Check bản quyền".
- [ ] Test action `transfer_ownership` thật (cần 1 email phụ để tự nhận + bấm Chấp nhận thử).

## GIAI ĐOẠN 5 — Test toàn bộ trước khi công bố rộng rãi

- [ ] Tự tạo 1 đơn hàng test bằng tài khoản Google khác, chạy thử TOÀN BỘ luồng thật.
- [ ] `docs/setup/07-test-apps-script-api.md` — test hạn mức 50-100 lần (độc lập, làm bất kỳ lúc nào).

---

**Việc bạn cần làm NGAY bây giờ** (không phải chờ gì cả, làm được luôn):
- Bắt đầu Giai đoạn 1 (Cloud Functions + Telegram).
- Trả lời 4 câu ở Giai đoạn 2 bằng văn bản.
- Gửi tin nhắn ở Giai đoạn 3 cho Claude bên gas-dashboard.

Tôi sẽ code dần theo từng thông tin bạn gửi, không cần đợi đủ hết mới bắt đầu.
