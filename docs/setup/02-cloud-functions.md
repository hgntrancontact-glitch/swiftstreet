# Bước 2 — Dựng Cloud Functions (Project B)

Cloud Functions là nơi chạy các đoạn code "phía máy chủ" — thứ mà trang web tĩnh hiện tại
của Swiftstreet KHÔNG có (toàn bộ code hiện nay chỉ chạy trên trình duyệt khách). Đây là
nơi xử lý: kiểm tra/trừ lượt voucher, tạo đơn hàng, gọi Telegram báo admin, và điều phối
luồng duyệt đơn.

## 1. Cài công cụ cần thiết trên máy bạn

1. Cài **Node.js** (bản 20 LTS) nếu máy chưa có: tải tại https://nodejs.org — chọn bản
   "LTS". Kiểm tra đã cài xong bằng cách mở Terminal, gõ:
   ```
   node -v
   ```
   Thấy hiện ra số phiên bản (vd `v20.x.x`) là thành công.

2. Cài **Firebase CLI** (công cụ dòng lệnh để deploy):
   ```
   npm install -g firebase-tools
   ```

3. Đăng nhập Firebase CLI bằng đúng tài khoản Google đã tạo project ở Bước 1:
   ```
   firebase login
   ```
   Lệnh này sẽ tự mở trình duyệt để bạn đăng nhập, xong quay lại Terminal là được.

## 2. Khởi tạo thư mục Cloud Functions

**Làm việc này trong 1 thư mục MỚI, KHÔNG phải trong thư mục Swiftstreet hiện tại** (Cloud
Functions là 1 dự án riêng, không phải static site) — gợi ý tạo `swiftstreet-functions/`
cạnh thư mục Swiftstreet hiện tại.

```
mkdir swiftstreet-functions
cd swiftstreet-functions
firebase init functions
```

Khi được hỏi:
- **"Please select an option"** → chọn **"Use an existing project"**.
- Chọn đúng **Project B** (project nhạy cảm, nơi chứa Cloud Functions theo kiến trúc đã chốt).
- **"What language?"** → chọn **JavaScript** (đồng bộ với toàn bộ code hiện tại của dự án, không cần biết TypeScript).
- **"Do you want to use ESLint?"** → chọn theo ý bạn, "No" cũng được cho nhanh.
- **"Do you want to install dependencies now?"** → chọn **Yes**.

Sau khi chạy xong, bạn sẽ có thư mục `swiftstreet-functions/functions/` chứa file
`index.js` (nơi tôi sẽ viết code thật vào) và `package.json`.

## 3. Cách lưu thông tin bí mật (token Telegram, v.v.) — KHÔNG hardcode trong code

Dùng **Firebase Secret Manager** thay vì viết token thẳng vào file `.js` (nếu viết thẳng,
lỡ đẩy code lên GitHub công khai là lộ hết):

```
firebase functions:secrets:set TELEGRAM_BOT_TOKEN
```
Lệnh này sẽ hỏi bạn dán giá trị (token lấy từ BotFather ở Bước 3) — dán vào rồi Enter,
Firebase lưu an toàn, code chỉ tham chiếu tên biến `TELEGRAM_BOT_TOKEN` chứ không chứa giá
trị thật.

Làm tương tự cho các secret khác khi tôi cần (tôi sẽ nói rõ tên biến cần set từng lúc, ví
dụ `TELEGRAM_ADMIN_CHAT_IDS`).

## 4. Deploy (đưa code lên chạy thật)

Sau khi tôi viết xong code vào `functions/index.js`:
```
cd swiftstreet-functions
firebase deploy --only functions
```
Lần đầu deploy có thể mất 2-5 phút. Xong sẽ hiện ra URL của từng function (dạng
`https://<region>-<project-id>.cloudfunctions.net/<tenFunction>`) — đây là địa chỉ mà
trang web/Telegram sẽ gọi tới.

## 5. (Tuỳ chọn, không bắt buộc) Test thử trên máy trước khi deploy thật

```
firebase emulators:start
```
Chạy giả lập Cloud Functions ngay trên máy bạn, không cần deploy lên internet mỗi lần sửa —
hữu ích khi cần sửa đi sửa lại nhiều lần, nhưng không bắt buộc phải dùng nếu bạn muốn deploy
thẳng cho nhanh.

## Việc bạn cần làm ngay

Chỉ cần hoàn tất mục 1-2 ở trên (cài Node, cài CLI, đăng nhập, chạy `firebase init
functions` chọn đúng Project B) — sau đó báo tôi biết thư mục `swiftstreet-functions/` đã
sẵn sàng, tôi sẽ điền code thật vào `functions/index.js` và hướng dẫn bạn deploy.
