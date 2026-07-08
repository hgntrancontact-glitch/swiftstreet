# Swiftstreet

## Mô hình kinh doanh

Swiftstreet là 1 "store" bán nhiều sản phẩm số nhỏ, độc lập với nhau (ví dụ: SwiftCopy.Drive — công cụ sao chép Google Drive; SwiftPlanner Wedding — file kế hoạch cưới; các file Google Sheets khác...).

- Mỗi sản phẩm được bán **1 lần duy nhất** (mua đứt, không phải thuê bao).
- Quy trình: khách chọn sản phẩm → thanh toán → **admin duyệt thanh toán thủ công** → khách nhận file/hướng dẫn sử dụng qua **email**.
- Dự án này hoàn toàn tách biệt với code cũ của SwiftCopy.Drive (dự án Next.js/Firebase cũ) — không liên quan, không tái sử dụng code cũ.

## Quyết định kỹ thuật đã chốt

- **Giai đoạn hiện tại (dựng khung giao diện)**: dùng HTML/CSS/JavaScript thuần, không dùng framework (không Next.js/React). Mục tiêu: chạy được ngay bằng GitHub Pages, không cần bước build.
- **Giai đoạn sau (backend)**: dự kiến dùng **Firebase Firestore** để lưu dữ liệu đơn hàng/sản phẩm — không dùng Supabase.
- **Ảnh**: lưu trực tiếp trong repo (thư mục `assets/`).
- **Video hướng dẫn**: dùng YouTube **Unlisted**, nhúng qua iframe (xem `.video-embed` trong `products/swiftcopy-drive.html`).
- Dữ liệu sản phẩm hiển thị trên trang chủ nằm trong `data/products.js` (mảng `PRODUCTS`), được `js/main.js` render ra `#product-grid`.

## Cấu trúc thư mục

```
index.html                     Trang chủ (hero 2 cột + lưới sản phẩm nổi bật)
san-pham.html                  Trang danh sách đầy đủ tất cả sản phẩm (cùng lưới, không có hero)
khuyen-mai.html                Trang placeholder "Khuyến mãi" (chưa có nội dung thật)
kiem-tien.html                 Trang placeholder "Kiếm Tiền" (chưa có nội dung thật)
products/swiftcopy-drive.html  Trang chi tiết sản phẩm (mẫu — nhân bản file này cho sản phẩm khác)
css/style.css                  Toàn bộ style + biến màu (:root) + responsive
js/main.js                     Render lưới sản phẩm (khung "laptop" mô phỏng giao diện),
                                xử lý menu mobile, và hệ thống modal (thông báo/giỏ hàng/hỗ trợ)
data/products.js               Danh sách sản phẩm (mảng PRODUCTS, field `type` quyết định
                                mini-dashboard mô phỏng nào hiển thị trong khung laptop)
assets/icons/                  favicon.ico, favicon-32x32.png, apple-touch-icon.png
assets/img/                    logo-header.png (nền trong suốt), logo-square-master.png (bản gốc đã cắt vuông)
```

### Thẻ sản phẩm (product card)

Mỗi thẻ sản phẩm trên `index.html`/`san-pham.html` gồm 3 phần, render bởi `renderProductGrid()` trong `js/main.js`:
1. `product-card-link` (bấm vào ảnh/tên → trang chi tiết): khung "laptop" (`.device-screen/.device-display/.device-base`) chứa mini-dashboard mô phỏng bằng code (không phải ảnh thật) — màu sắc bên trong `.device-display` được đổi sang tông sáng qua CSS variables override (không viết lại CSS mini-dashboard).
2. Tên sản phẩm + giá.
3. `product-card-actions`: 2 nút "Thêm giỏ hàng" (mở modal giỏ hàng mẫu) và "Mua ngay" (link sang trang chi tiết).

### Hệ thống modal

3 modal dùng chung (thông báo / giỏ hàng / hỗ trợ) được `setupModals()` trong `js/main.js` tự động chèn vào `<body>` của MỌI trang có include `js/main.js` — không cần viết HTML modal thủ công ở từng trang. Bất kỳ phần tử nào có `data-modal="notify|cart|support"` sẽ mở modal tương ứng khi bấm (dùng cho icon chuông/giỏ hàng ở header, nút hỗ trợ nổi, và nút "Thêm giỏ hàng" trong thẻ sản phẩm).

### QUAN TRỌNG: cache CSS trên trình duyệt của khách

Link `css/style.css` ở mọi trang HTML có query string phá cache dạng `?v=N` (vd `css/style.css?v=7`). **Mỗi lần đẩy thay đổi CSS lên GitHub Pages, PHẢI tăng số `N` này ở tất cả các trang HTML** — nếu không, trình duyệt khách hàng có thể tiếp tục hiển thị bản CSS cache cũ (GitHub Pages trả `cache-control: max-age=600`) và khách sẽ tưởng nhầm là "chưa sửa gì cả" dù code đã đúng trên server. Đã xảy ra 1 lần: khách báo "không thấy thay đổi" nhưng kiểm tra trực tiếp file CSS trên server thì đã đúng bản mới — do trình duyệt cache. Luôn tăng version này cùng lúc với mỗi lần sửa `css/style.css`.

### Lưu ý về kích thước thẻ sản phẩm

Khung "laptop" (`.device-display`) cố định `height: 138px` — đây là ngân sách chiều cao cho toàn bộ mini-dashboard bên trong (tiêu đề + 3 ô số liệu + 1 hàng nội dung phụ như donut/list/bars/table/calendar). Nếu thêm loại mini-dashboard mới hoặc thêm dòng nội dung, phải kiểm tra bằng ảnh chụp thật (không chỉ đọc code) vì `overflow: hidden` sẽ âm thầm cắt mất phần tràn ra — đã gặp lỗi này 2 lần khi thêm quá nhiều dòng cho danh sách file/bảng đơn hàng. Badge góc trên thẻ (`.product-thumb .badge`, `top/left: 8px`) và phần đệm trên của `.product-thumb` (`padding-top: 24px`) phải khớp nhau — giảm cỡ badge mà không giảm padding-top tương ứng (hoặc ngược lại) sẽ làm tiêu đề mini-dashboard bị badge đè lên.

### Lưu ý về tiêu đề Hero (h1)

Tiêu đề lớn trong `.hero-intro h1` dùng `<br />` ngắt dòng CỨNG (hiện tại: "Kho công cụ số giúp bạn" / "làm việc nhanh hơn, mua" / "một lần và dùng mãi mãi." — 3 dòng độ dài khá đều nhau), KHÔNG dựa vào wrap tự nhiên theo độ rộng cột (thử wrap tự nhiên bằng cách chỉnh font-size/độ rộng cột không cho kết quả ổn định, phụ thuộc font render của trình duyệt). Vì vậy cột `.hero-intro` (`grid-template-columns` trong `.hero-shop-grid`, hiện `minmax(320px, 500px)`) phải đủ rộng để dòng dài nhất không tự bị wrap thêm lần nữa — nếu đổi font-size của h1 (hiện `clamp(30px, 3.2vw, 38px)`) hoặc đổi lại nội dung/vị trí ngắt dòng, phải test bằng ảnh chụp thật để chỉnh lại độ rộng cột cho khớp (từng bị lệch nhiều lần vì việc này). Khi tăng cỡ chữ h1, ưu tiên chia lại vị trí ngắt dòng sao cho 3 dòng có độ dài ký tự tương đối bằng nhau (thay vì giữ nguyên vị trí ngắt cũ) để không cần nới cột quá rộng, ảnh hưởng lưới sản phẩm bên cạnh.

### Nút "Tự động hoá giúp tối ưu công việc" (hero-cta)

Đây LÀ một nút thật (`.btn.btn-dark.hero-cta`, nền đen bo góc), KHÔNG phải chữ thường. Ở vòng sửa trước có lúc đổi thành `<p>` chữ thường theo yêu cầu, nhưng đã đổi lại thành nút vì khách xác nhận hình mẫu tham khảo của họ luôn hiển thị phần tử này dạng nút đen — nếu nhận yêu cầu đổi lại thành text, hỏi lại kỹ trước khi sửa vì đã đổi qua lại 1 lần.

### Nút "Xem thêm" trên trang chủ

Nằm bên trong `.hero-products` (cùng cột với `.product-grid`, không phải block riêng full-width) và căn trái (`text-align:left`) — để nó bám sát ngay dưới lưới sản phẩm thay vì trôi giữa trang. Mũi tên dùng SVG inline (không dùng ký tự "→") để nét luôn đậm rõ, nhất quán với các icon khác trên trang.

### Nút hỗ trợ nổi (support-fab)

Nhãn "Hỗ trợ" nằm `position:absolute` đè lên góc trên-phải của vòng tròn cam — xem `.support-fab .fab-label` trong `css/style.css`. Vòng tròn cỡ nhỏ (50px, không phải to) kèm hiệu ứng phát sáng mềm (`box-shadow: 0 0 22px 4px rgba(254,178,10,.55)`) — đã từng bị làm quá to ("khủng bố" theo lời khách) và từng bị bỏ mất hiệu ứng phát sáng, phải giữ đúng 2 đặc điểm này. Chữ "Hỗ trợ" màu cam/vàng (`var(--color-orange)`) trên nền đen, KHÔNG phải màu trắng. Icon tai nghe dùng path đơn giản (1 vòng cung + 2 `<rect>` bo góc làm tai nghe), không có chi tiết mic phụ ở dưới — bản có mic đã bị khách chê "sai".

### Tên thương hiệu — viết đúng chính tả và đúng font

Viết là **"Swiftstreet"** (chỉ hoa chữ S đầu), KHÔNG phải "SwiftStreet". Áp dụng cho mọi nơi xuất hiện tên thương hiệu (logo header/footer, title trang, nút, meta description...). Tên các sản phẩm riêng lẻ (SwiftCopy.Drive, SwiftPlanner Wedding...) giữ nguyên cách viết hoa của chúng — không liên quan đến quy tắc này.

Font chữ thương hiệu là **Poppins** (Google Fonts, đã nhúng link trong `<head>` của mọi trang HTML), khai báo qua biến `--font-brand` trong `css/style.css` và áp dụng cho `.brand`, `.main-nav a`, `.hero-rate-btn`. Nếu thêm trang HTML mới, phải copy nguyên khối `<link rel="preconnect">`/`<link href="...fonts.googleapis.com/css2?family=Poppins...">` trong `<head>`, nếu không chữ thương hiệu sẽ rơi về font hệ thống mặc định. Trọng lượng chữ (`font-weight`) của `.brand` là **600**, không phải 700/800 — từng bị chê "in đậm quá".

### Chiều rộng container / khoảng trắng 2 bên

`--container-width` hiện là `1360px`. Lưu ý: đã từng tăng lên 1560px để giảm khoảng trắng ở màn hình rộng, nhưng bị chê footer bị kéo dãn xấu (khoảng cách giữa các cột footer quá lớn) — 1360px là điểm cân bằng giữa 2 lần phản hồi trái ngược nhau. Nếu chỉnh lại, luôn kiểm tra ảnh chụp CẢ phần hero/lưới sản phẩm LẪN phần footer ở viewport rộng (≥1900px), vì 2 khu vực này phản ứng ngược nhau với việc đổi container-width.

### Gradient nút cam (hero-rate-btn)

Gradient 2 màu phải GẦN NHAU (vd `#ffbb2e` → `#fa9a05`), không được chọn 2 màu tương phản mạnh — vì nút có dạng viên thuốc (border-radius 999px) nên 2 đầu bo tròn gần như chỉ nhận 1 màu duy nhất của gradient, nếu 2 màu cách xa nhau (vd vàng nhạt và cam đậm) thì 2 đầu sẽ trông như 2 khối màu tách biệt ("2 cái đuôi" theo lời khách) thay vì 1 dải gradient mượt.

## Bảng màu thương hiệu

Lấy từ logo gốc (`Logo Swiftstreet.png`), khai báo trong `css/style.css` mục `:root`:

| Vai trò | Mã màu |
|---|---|
| Đen thương hiệu | `#1a1a1a` (đậm hơn: `#2b2b2b`) |
| Vàng cam thương hiệu | `#feb20a` (đậm hơn: `#e59900`) |
| Trắng nền | `#ffffff` |
| Nền phụ (section xen kẽ) | `#faf9f7` |
| Chữ phụ/mờ | `#6b6b6b` |
| Viền | `#ececec` |
| Badge thành công | nền `#e8f5ee`, chữ `#2e7d52` |
| Badge lỗi | nền `#fbeae8`, chữ `#c94b3f` |
| Badge info | nền `#eaf1f8`, chữ `#3a6ea5` |

Nguyên tắc: đen + vàng cam + trắng luôn là màu chủ đạo chiếm ưu thế; các màu phụ (success/error/info) chỉ dùng cho badge/trạng thái, không lấn át màu thương hiệu.

## Trạng thái hiện tại

- ✅ Đã dựng khung giao diện: trang chủ, trang danh sách sản phẩm đầy đủ (`san-pham.html`), 2 trang placeholder (`khuyen-mai.html`, `kiem-tien.html`), và 1 trang chi tiết sản phẩm mẫu (`products/swiftcopy-drive.html`).
- ✅ Logo đã xử lý thành favicon + apple-touch-icon + logo header (nền trong suốt, không méo).
- ✅ Thẻ sản phẩm dạng khung "laptop" với mini-dashboard mô phỏng riêng cho từng loại sản phẩm.
- ✅ Modal mẫu cho thông báo / giỏ hàng / hỗ trợ (dữ liệu placeholder, chưa có logic thật).
- ✅ Đã kiểm tra responsive (mobile + desktop) và test modal mở/đóng thực tế bằng trình duyệt.
- ✅ Đã thu gọn kích thước chữ/khoảng cách toàn bộ (hero, thẻ sản phẩm, nút bấm, nút hỗ trợ nổi) theo phản hồi để bớt thô/nặng, giống hình mẫu tham khảo.
- ✅ Nút "★ Đánh giá Swiftstreet" dạng bầu dục, nền gradient cam→vàng cam, có hiệu ứng phóng to khi rê chuột.
- ✅ Nút hỗ trợ nổi làm phẳng (bỏ bóng đổ/hiệu ứng phát sáng). Nút "Xem thêm" chuyển vào trong cột lưới sản phẩm, căn trái ngay dưới lưới thay vì căn giữa trang.
- ✅ Tiêu đề hero ngắt dòng cứng theo đúng 3 dòng khách yêu cầu (xem "Lưu ý về tiêu đề Hero" bên dưới).
- ✅ Vòng sửa 2: tăng lại cỡ chữ hero cho vừa tỉ lệ, menu header thu nhỏ rõ so với tên thương hiệu, nút hỗ trợ nổi vẽ lại đúng mẫu (nhãn đè góc trên-phải, icon lớn), mũi tên "Xem thêm" đổi sang SVG đậm nét, và sửa chính tả thương hiệu thành "Swiftstreet" (chữ s thường) trên toàn bộ trang.
- ✅ Vòng sửa 3: đối chiếu lại toàn bộ với ảnh chụp hình mẫu gốc của khách — khôi phục "Tự động hoá giúp tối ưu công việc" về dạng nút đen (đã có lúc đổi thành chữ thường ở vòng 2 rồi phải đổi lại), giảm line-height tiêu đề/đoạn khuyến mãi cho khít hơn.
- ✅ Vòng sửa 4: thêm font thương hiệu Poppins (logo, menu, nút đánh giá), tăng `--container-width` lên 1560px để giảm khoảng trắng 2 bên ở màn hình rộng, nút "Xem thêm" đổi sang dạng bầu dục hoàn toàn, gradient nút đánh giá chỉnh lại cho ngả cam rõ hơn (bớt vàng), nút hỗ trợ nổi thu nhỏ lại (50px) và thêm lại hiệu ứng phát sáng mềm màu cam.
- ✅ Vòng sửa 5: sửa gradient nút đánh giá dùng 2 màu gần nhau hơn (hết lỗi "2 cái đuôi" ở 2 đầu bo tròn), đổi màu chữ "Hỗ trợ" sang cam/vàng, vẽ lại icon tai nghe đơn giản hơn (bỏ chi tiết mic), giảm độ đậm + cỡ chữ tên thương hiệu (700→600, 23px→20px), giảm `--container-width` từ 1560 xuống 1360 vì 1560 làm footer bị dãn xấu.
- ✅ Vòng sửa 6: khách so sánh với web đối thủ (OKX) ở cùng mức zoom 100%, thấy chữ hero của mình quá nhỏ/thiếu tự tin — tăng đáng kể cỡ chữ hero (h1 26-30px → 30-38px, promo-text 15.5px → 17px, các nút liên quan cũng tăng theo), nới cột `.hero-intro` lên `minmax(320px,500px)` và chia lại vị trí ngắt dòng h1 cho 3 dòng đều nhau hơn để không phải nới cột quá mức.
- ✅ Vòng sửa 7: phát hiện khách bị cache CSS cũ trên trình duyệt (đã kiểm tra server, code đã đúng) — thêm cơ chế phá cache `?v=N` cho `css/style.css`. Đồng thời tăng thêm cỡ chữ bên trong thẻ sản phẩm (tên sản phẩm 13→15px, giá 15→17px, nút Thêm giỏ hàng/Mua ngay 11→12.5px, badge 9→10px) vì so với nút "Xem thêm" thì các thành phần này nhỏ hơn hẳn, tạo cảm giác lệch tỉ lệ.
- ✅ Vòng sửa 8: nút "Thêm giỏ hàng"/"Mua ngay" bị vỡ 2-3 dòng do vòng 7 tăng cỡ chữ hơi quá — giảm nhẹ lại (12.5px→12px, padding 8px 8px→8px 6px). Phát hiện và sửa lỗi responsive nghiêm trọng: ở độ rộng ~1000-1300px (laptop phổ biến), `.hero-shop-grid` vẫn giữ 2 cột trong khi cột `.hero-intro` đã rộng tới 500px khiến lưới sản phẩm bị bóp nghẹt (chữ vỡ dòng, nút bể 3 dòng) — thêm breakpoint riêng `@media (max-width: 1300px)` để hero+lưới chuyển sang xếp dọc SỚM hơn, tránh hẳn vùng bị bóp. Đã test lại toàn bộ các mốc 1000/1200/1300/1350/1440/1920/mobile.
- ❌ Chưa có nội dung chi tiết thật (mô tả sản phẩm, FAQ, tính năng... hiện đang là placeholder).
- ❌ Nút "Mua ngay"/"Thêm giỏ hàng" chưa có logic giỏ hàng thật (giỏ hàng trong modal là dữ liệu mẫu cố định).
- ❌ Trang "Khuyến mãi" và "Kiếm Tiền" chỉ là placeholder, chưa có nội dung.
- ❌ Chưa kết nối Firebase, chưa xử lý thanh toán thật.
- ❌ Chưa có trang admin, chưa có trang CTV.
- ❌ Chưa deploy Vercel (dự kiến chưa dùng ở giai đoạn này).

## Việc cần làm tiếp theo (gợi ý cho phiên sau)

1. Viết nội dung thật cho từng sản phẩm (mô tả, tính năng, FAQ đầy đủ).
2. Nhân bản `products/swiftcopy-drive.html` cho các sản phẩm còn lại trong `data/products.js`.
3. Xây logic giỏ hàng thật (hiện "Thêm giỏ hàng" chỉ mở modal mẫu tĩnh) + trang thanh toán.
4. Viết nội dung thật cho trang "Khuyến mãi" và "Kiếm Tiền".
5. Kết nối Firebase Firestore để lưu đơn hàng.
6. Xây trang admin duyệt đơn + gửi email giao file.
