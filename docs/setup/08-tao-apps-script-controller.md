# Tạo "Bộ điều phối" (Apps Script Controller) — Phương án B

Đây là project Apps Script **HOÀN TOÀN MỚI**, tách biệt khỏi gas-dashboard hiện có — không
đụng gì tới `Code.gs`/`Index.html`/`JavaScript.html` đang được sửa riêng (tách File A/B).

## 1. Tạo project

1. Vào https://script.google.com (đăng nhập bằng **hgntran.contact@gmail.com** — đúng tài
   khoản sở hữu file gốc SwiftCopy.Drive, để Bộ điều phối có quyền copy/sửa/deploy được).
2. Bấm **"New project"**.
3. Đổi tên project (góc trên trái, đang ghi "Untitled project") thành **"Swiftstreet
   Automation Controller"**.

## 2. Dán code

1. Xoá hết nội dung mặc định trong `Code.gs`, dán TOÀN BỘ nội dung file
   `automation-controller-source/Code.gs` (trong repo Swiftstreet) vào.
2. Bật xem file manifest: bấm ⚙️ (Project Settings, sidebar trái) → tick **"Show
   'appsscript.json' manifest file in editor"**.
3. Quay lại tab Editor (icon `< >`), sẽ thấy file `appsscript.json` mới xuất hiện — xoá hết
   nội dung, dán TOÀN BỘ nội dung file `automation-controller-source/appsscript.json` vào.
4. Bấm biểu tượng 💾 (Save) hoặc `Cmd+S`.

## 3. Đặt mã bí mật (shared secret)

Đây là "mật khẩu" để Cloud Function chứng minh nó thật sự là hệ thống Swiftstreet, không
phải ai đó gọi bừa vào URL công khai của Bộ điều phối.

1. Vào ⚙️ **Project Settings** → cuộn xuống mục **"Script Properties"**.
2. Bấm **"Add script property"**.
3. Property: `CONTROLLER_SHARED_SECRET`. Value: tự gõ 1 chuỗi dài, ngẫu nhiên, khó đoán (vd
   mở https://www.random.org/strings hoặc tự gõ đại 30-40 ký tự lộn xộn) — **LƯU LẠI CHUỖI
   NÀY**, sẽ cần dán vào Cloud Function ở bước sau.
4. Bấm **Save script properties**.

## 4. Gắn với 1 GCP project TIÊU CHUẨN (project mới, không rủi ro)

Khác với file gốc SwiftCopy.Drive (tạm hoãn đụng vào) — project Controller này **HOÀN TOÀN
MỚI**, đổi GCP project ngay bây giờ không có rủi ro gì.

1. Mở https://console.cloud.google.com (cùng tài khoản Google).
2. Góc trên, bấm chọn dự án → **"NEW PROJECT"**.
3. Đặt tên (vd `swiftstreet-automation`), bấm **Create**. Đợi vài giây, ghi lại **Project
   Number** (dãy số, xem trong Project Info ở trang chủ dashboard sau khi tạo xong).
4. Quay lại script.google.com (project Controller) → ⚙️ Project Settings → mục **"Google
   Cloud Platform (GCP) Project"** → bấm **"Change project"**.
5. Dán đúng **Project Number** vừa ghi lại → **Set project**.

## 5. Bật Apps Script API cho GCP project vừa tạo

1. Vẫn ở https://console.cloud.google.com, đảm bảo đang chọn đúng project
   `swiftstreet-automation` (kiểm tra ở góc trên).
2. Menu trái → **APIs & Services** → **Library**.
3. Tìm **"Apps Script API"** → bấm vào → **Enable**.
4. Làm tương tự cho **"Google Drive API"** (tìm, bấm Enable) — dù thường tự bật sẵn, kiểm tra
   lại cho chắc.

## 5b. Bật công tắc "Google Apps Script API" cấp TÀI KHOẢN (khác bước 5, DỄ QUÊN)

Ngoài việc bật API cho GCP project (bước 5), tài khoản `hgntran.contact@gmail.com` (tài khoản
CHẠY script này) còn cần bật RIÊNG 1 công tắc cấp tài khoản — nếu quên bước này, gọi
`copy_and_deploy` sẽ báo lỗi 403 "User has not enabled the Apps Script API" (lỗi thật đã gặp
và xác nhận đây chính là nguyên nhân — KHÔNG liên quan gì tới GCP project của file bị copy).

1. Vào https://script.google.com/home/usersettings (đúng tài khoản trên).
2. Bật công tắc **"Google Apps Script API"**.
3. Đợi vài phút cho hệ thống Google cập nhật trước khi test.

## 6. Deploy thành Web App

1. Quay lại script.google.com (project Controller) → bấm **Deploy** (góc trên phải) →
   **New deployment**.
2. Bấm ⚙️ cạnh "Select type" → chọn **Web app**.
3. Execute as: **Me (hgntran.contact@gmail.com)**. Who has access: **Anyone**.
4. Bấm **Deploy**.
5. Lần đầu sẽ hiện màn hình xin cấp quyền — bấm **Authorize access** → chọn đúng tài khoản →
   nếu thấy "Google hasn't verified this app", bấm **Advanced** → **Go to Swiftstreet
   Automation Controller (unsafe)** → **Allow**. (Bình thường — script riêng tư của bạn,
   không phải lỗi.)
6. Copy **Web app URL** hiện ra — đây là URL sẽ dán vào Cloud Function.

## 7. Test thử "test_ping" — KHÔNG CẦN TERMINAL/CURL

Code đã có sẵn 2 hàm test chạy NGAY trong Apps Script Editor, xem kết quả qua "Execution
log" — không cần gõ lệnh gì.

**Lưu ý quan trọng nếu bạn từng thử `curl`/mở link bằng trình duyệt và gặp lỗi**: 2 lỗi bạn
gặp đều BÌNH THƯỜNG, không phải Controller bị hỏng —
- Mở URL trực tiếp bằng trình duyệt → báo "Không tìm thấy hàm tập lệnh: doGet": ĐÚNG NHƯ VẬY,
  vì code chỉ viết `doPost` (nhận lệnh kiểu POST), không có `doGet` — mở link bằng trình duyệt
  là 1 yêu cầu GET, không dùng để test được. Phải test bằng cách gọi POST (2 hàm dưới đây làm
  đúng việc này).
- `curl` báo "trang lỗi HTML của Google": do Apps Script Web App trả về 1 bước CHUYỂN HƯỚNG
  (redirect) trước khi tới kết quả thật — `curl` mặc định KHÔNG tự đi theo bước chuyển hướng
  này (cần thêm cờ `-L`, dễ quên) — đây chính là lý do nên test bằng cách dưới đây thay vì
  Terminal.

**Cách test (bấm nút, không gõ lệnh):**

1. Mở lại project Controller trên script.google.com.
2. Ở thanh công cụ TRÊN CÙNG của Editor, có 1 ô dropdown (thường đang hiện tên 1 hàm nào đó,
   cạnh nút ▶ màu xanh) — bấm vào ô đó, chọn hàm **`chayThuTrongEditor`**.
3. Bấm nút ▶ **Run**.
4. Lần đầu chạy sẽ xin cấp quyền — bấm **Review permissions** → chọn tài khoản → **Advanced**
   → **Go to ... (unsafe)** → **Allow** (giống bước 6, bình thường).
5. Chạy xong, xem kết quả ở khung **"Execution log"** hiện phía dưới (nếu không tự hiện, vào
   menu **Xem/View → Executions** để mở lại) — sẽ thấy 2 dòng: mã bí mật đã đặt chưa, và kết
   quả gọi thử `test_ping`. Thấy `"ok":true` là ĐÚNG, Controller hoạt động tốt.

**Test thêm bước "gọi qua URL thật"** (giống hệt cách Cloud Function sẽ gọi sau này):
1. Mở hàm `chayThuGoiURLThat` trong code, sửa dòng `const URL_WEB_APP = "DÁN_URL..."` — dán
   ĐÚNG URL web app bạn vừa deploy (`https://script.google.com/macros/s/AKfycbzniiAPCLv6CouuUva0xrKBqElS2-QKfsMu9nq-WZOZdisOjhQ6ntLkUzVcaLumSjYYnQ/exec`) vào giữa 2 dấu ngoặc kép, bấm 💾 Save.
2. Chọn hàm `chayThuGoiURLThat` trong dropdown → bấm ▶ Run.
3. Xem Execution log — thấy "Mã trạng thái HTTP: 200" và nội dung có `"ok":true` là THÀNH CÔNG.

Gửi tôi ảnh chụp "Execution log" sau khi chạy xong `chayThuGoiURLThat`.

## 8. ✅ ĐÃ TEST THÀNH CÔNG — `copy_and_deploy` chạy đúng đầu-cuối

Đã xác nhận bằng log thật: copy file → tạo version → deploy → nhận URL web app thật, tự động
đúng cấu hình "Anyone" — **KHÔNG cần đổi GCP project của file gốc SwiftCopy.Drive** như từng
lo ngại. Vướng mắc duy nhất gặp phải (đã sửa): thiếu bước 5b (bật công tắc tài khoản).

## 9. Còn lại trước khi dùng thật cho khách

1. **Action `transfer_ownership`** — đã viết, CHƯA test thật (cần 1 email thật để nhận chuyển
   quyền + tự bấm "Chấp nhận" — có thể dùng 1 tài khoản Gmail phụ khác của bạn để thử).
2. **Sửa nội dung code gắn email khách** (`xuLyCopyVaDeploy_()` trong `Code.gs`) — đang để
   trống, chờ biết cấu trúc file bàn giao (File A/File B) để biết gắn vào đâu.
3. **Điền `AUTOMATION_CONTROLLER_URL`** trong `cloud-functions-source/functions/index.js`
   bằng URL Controller thật (đã có từ bước 6), và `FILE_MAU_THEO_SLUG`/
   `THU_MUC_DICH_GIAO_HANG_ID` bằng ID file/folder THẬT (khác file/folder TEST vừa dùng).
