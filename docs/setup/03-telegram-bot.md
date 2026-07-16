# Bước 3 — Tạo Telegram Bot + lấy Chat ID admin

## 1. Tạo bot qua BotFather

1. Mở app Telegram (điện thoại hoặc máy tính), tìm kiếm **`@BotFather`** (tài khoản có dấu
   tick xanh chính thức của Telegram).
2. Bấm **Start** / gửi `/start`.
3. Gửi lệnh: `/newbot`
4. BotFather hỏi **tên hiển thị** của bot (vd `Swiftstreet Admin Bot`) — gõ vào, Enter.
5. BotFather hỏi **username** của bot — PHẢI kết thúc bằng chữ `bot` (vd
   `swiftstreet_admin_bot`) và chưa ai dùng trước đó — gõ vào, Enter.
6. BotFather trả về 1 đoạn tin nhắn chứa dòng dạng:
   ```
   Use this token to access the HTTP API:
   123456789:AAExampleTokenAbcDefGhiJklMnoPqrStu
   ```
   **Đây là TOKEN bí mật** — copy lại, đây chính là giá trị bạn sẽ dán vào
   `TELEGRAM_BOT_TOKEN` ở bước Cloud Functions (mục 3, file `02-cloud-functions.md`).
   **Không gửi/đăng token này công khai ở đâu cả** — ai có token này có thể giả danh bot
   của bạn.

## 2. Lấy Chat ID của admin (nơi bot sẽ gửi thông báo đơn hàng tới)

Cách dễ nhất:
1. Tìm kiếm **`@userinfobot`** trên Telegram (1 bot tiện ích công khai, không liên quan
   Swiftstreet), bấm **Start**.
2. Bot trả lời ngay 1 đoạn thông tin, trong đó có dòng **`Id: 123456789`** — đây chính là
   Chat ID của TÀI KHOẢN TELEGRAM bạn đang dùng để chat.

**Nếu có 2 admin cùng duyệt đơn** (đúng yêu cầu ở Phần 6.2): mỗi admin tự làm bước trên
bằng đúng tài khoản Telegram của họ, gửi lại cho bạn cả 2 con số Chat ID.

## 3. Cho phép bot gửi tin nhắn tới bạn

Telegram bot **không thể chủ động nhắn tin cho ai đó nếu người đó chưa từng bấm Start với
chính bot đó ít nhất 1 lần** (đây là quy định chống spam của Telegram, không phải hạn chế
riêng của hệ thống này). Vì vậy:

1. Mỗi admin tìm đúng username bot vừa tạo ở bước 1 (vd `@swiftstreet_admin_bot`).
2. Bấm **Start** (hoặc gửi bất kỳ tin nhắn nào, vd "hi") — chỉ cần làm 1 LẦN DUY NHẤT.

Sau bước này, Cloud Function mới gửi được thông báo đơn hàng tới đúng Chat ID của admin đó.

## 4. (Tuỳ chọn) Trang trí bot

Vẫn với BotFather:
- `/setdescription` — mô tả ngắn hiện khi ai đó xem thông tin bot.
- `/setuserpic` — đặt ảnh đại diện (vd logo Swiftstreet).

Bước này chỉ để đẹp, không ảnh hưởng chức năng.

## Tổng kết — 2 thông tin cần gửi lại cho tôi (hoặc tự set vào Secret Manager theo hướng dẫn ở `02-cloud-functions.md`)

| Tên biến | Giá trị lấy ở đâu |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Dòng token BotFather trả về ở mục 1 |
| `TELEGRAM_ADMIN_CHAT_IDS` | Danh sách Chat ID từng admin (mục 2), cách nhau bằng dấu phẩy nếu có nhiều người |

Code phía Cloud Function sẽ dùng `TELEGRAM_BOT_TOKEN` để gọi API
`https://api.telegram.org/bot<TOKEN>/sendMessage`, gửi tới từng `chat_id` trong danh sách
trên kèm nút bấm Duyệt/Từ chối.
