# Đề xuất "cửa sau" nối Cloud Function ↔ SwiftCopy.Drive (gas-dashboard) — CHƯA CODE, chờ bạn chọn

**Xác nhận đúng như bạn nói: hiện tại KHÔNG có kết nối nào giữa 2 dự án.** Mọi việc copy
file/sửa code/deploy/chuyển quyền vẫn đang làm tay 100%. Tài liệu này CHỈ là đề xuất thiết
kế — **chưa viết dòng code tích hợp nào**, đúng nguyên tắc bạn yêu cầu (không code liều phần
cần cấp quyền khi chưa chắc).

## Vấn đề cốt lõi, giải thích đơn giản

Cloud Function là 1 đoạn code chạy trên máy chủ Google, dưới "danh tính" của dự án Firebase
Project B — nó không tự nhiên có quyền vào Google Drive/Apps Script của bạn. Cần 1 cách để
nó **hành động NHƯ THỂ CHÍNH BẠN** (chủ tài khoản đang sở hữu file gốc SwiftCopy.Drive) thì
mới copy/sửa/deploy/chuyển quyền được — vì bản chất các thao tác này (copy file Drive, sửa
code Apps Script, deploy web app) đều là API CHUNG của Google (Drive API, Apps Script API),
không phải thứ gì "riêng" của gas-dashboard — nên **không cần đặt "cái tai nghe lệnh" bên
trong Code.gs/Index.html/JavaScript.html hiện có của gas-dashboard** (tránh đụng vào code
đang có 1 Claude Code khác đang sửa File A/B).

## Phương án A — Cloud Function tự cầm "chìa khoá" (OAuth refresh token)

Bạn làm 1 lần: tạo OAuth Client ID trong Google Cloud, tự đăng nhập cấp quyền cho nó truy
cập Drive + Apps Script API dưới tài khoản của bạn → Google trả về 1 "refresh token" (chuỗi
dài, dùng để tự xin quyền truy cập mới mãi mãi mà không cần đăng nhập lại) → lưu chuỗi này
vào Cloud Function (Secret Manager, giống cách lưu token Telegram).

- **Ưu điểm**: không cần tạo thêm 1 Apps Script project nào.
- **Nhược điểm**: bước lấy refresh token hơi kỹ thuật (cần dùng công cụ như OAuth Playground
  của Google), phải tự quản lý việc refresh token có thể bị Google thu hồi (vd đổi mật khẩu,
  hoặc không dùng >6 tháng) mà không báo trước rõ ràng.

## Phương án B — 1 Apps Script "Bộ điều phối" MỚI, tách riêng (ĐỀ XUẤT CHỌN phương án này)

Tạo **1 project Apps Script HOÀN TOÀN MỚI** (không đụng gì tới gas-dashboard hiện có), gọi
tạm là "Swiftstreet Automation Controller":
1. Bạn tạo project mới tại script.google.com, dán code tôi viết sẵn vào (khi bạn chọn xong
   phương án này).
2. Bạn bấm "Deploy → New deployment → Web app" — giống hệt thao tác bạn đã quen khi tự
   deploy gas-dashboard cho khách — lần đầu chạy sẽ hiện màn hình "ứng dụng chưa xác minh",
   bấm "Advanced → Go to [tên project] (unsafe)" rồi "Allow" — đây là bước BÌNH THƯỜNG cho
   script riêng tư của chính bạn, không phải lỗi.
3. Google cấp 1 URL web app — dán vào Cloud Function (giống cách dán `GAS_WEB_APP_URL` đã
   có placeholder sẵn).
4. Bên trong code Apps Script này, hàm `ScriptApp.getOAuthToken()` TỰ ĐỘNG lấy được 1 access
   token đại diện ĐÚNG tài khoản Google của bạn (không cần bạn tự quản lý refresh token nào)
   — dùng token này gọi Drive API (copy file, chuyển quyền sở hữu) + Apps Script API (sửa
   code, deploy) của file/project SwiftCopy.Drive mà bạn đang sở hữu.
5. Cloud Function chỉ cần gọi 1 URL HTTP đơn giản (kèm 1 mã bí mật để xác thực) — y hệt cách
   nó đã gọi Telegram.

- **Ưu điểm**: KHÔNG cần OAuth Client ID/Playground/refresh token — chỉ cần đúng thao tác
  "tạo Apps Script mới, cấp quyền, deploy" bạn đã quen tay. Code Apps Script mới này hoàn
  toàn TÁCH RIÊNG khỏi Code.gs/Index.html/JavaScript.html của gas-dashboard hiện có.
- **Nhược điểm**: thêm 1 project Apps Script nữa cần quản lý (nhưng đơn giản, chỉ có vài hàm).

## 3 điểm CHƯA CHẮC CHẮN — cần kiểm chứng thật, không đoán (dù chọn phương án nào)

1. **Apps Script API có thể yêu cầu project SwiftCopy.Drive gốc phải gắn với 1 "GCP project
   tiêu chuẩn"** (không phải project mặc định Google tự tạo ẩn) mới cho phép sửa code/quản
   lý deployment qua API — cần kiểm tra: mở project SwiftCopy.Drive gốc trên script.google.com
   → Project Settings → xem mục "Google Cloud Platform (GCP) Project" đang là gì. Nếu đang
   là project ẩn mặc định, cần đổi sang project tiêu chuẩn (thao tác Google có hỗ trợ sẵn,
   nhưng chưa thử nên chưa chắc trơn tru 100%).
2. **Chuyển quyền sở hữu file khác domain Google LUÔN cần khách bấm "Chấp nhận" 1 lần** (đã
   biết từ tài liệu roadmap gốc) — bước này KHÔNG thể tự động hoá hoàn toàn, đây là chính
   sách bảo mật của Google, không phải hạn chế của thiết kế này.
3. Cần bạn xác nhận **project SwiftCopy.Drive gốc (trước khi copy cho khách) hiện do TÀI
   KHOẢN GOOGLE NÀO đứng tên sở hữu** — để biết Apps Script Controller (Phương án B) cần
   được TÀI KHOẢN ĐÓ tạo và cấp quyền (không phải tài khoản khác).

## Việc cần bạn trả lời trước khi tôi viết code

1. Chọn Phương án A hay B (khuyến nghị B).
2. Xác nhận GCP project của SwiftCopy.Drive gốc (mục "chưa chắc chắn" #1 ở trên).
3. Tài khoản Google nào đang sở hữu project SwiftCopy.Drive gốc.

Sau khi có câu trả lời, tôi viết code Apps Script Controller (phương án B) + cập nhật
`cloud-functions-source/functions/index.js` để gọi sang, kèm hướng dẫn deploy từng bước.
