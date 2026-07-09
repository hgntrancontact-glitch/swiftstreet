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

3 modal dùng chung (thông báo / giỏ hàng / hỗ trợ) được `setupModals()` trong `js/main.js` tự động chèn vào `<body>` của MỌI trang có include `js/main.js` — không cần viết HTML modal thủ công ở từng trang. Bất kỳ phần tử nào có `data-modal="notify|cart|support"` sẽ mở modal tương ứng khi bấm (dùng cho icon chuông/giỏ hàng ở header, nút hỗ trợ nổi). Modal `notify` và `support` vẫn là nội dung mẫu tĩnh (`MODAL_CONTENT.notify`/`.support`); modal `cart` từ vòng sửa 19 trở đi là **nội dung động**, xem mục "Giỏ hàng (localStorage)" ngay bên dưới.

### Giỏ hàng (localStorage) — không backend, không đăng nhập

Từ vòng sửa 19: giỏ hàng lưu trong `localStorage` của trình duyệt, key `swiftstreet_cart` (mảng JSON các item `{ slug, name, price (số nguyên VNĐ), type, qty }`). Toàn bộ logic nằm trong `js/main.js`:

- `getCart()`/`setCart()`: đọc/ghi localStorage, `setCart()` tự gọi `syncCartUI()` sau khi ghi.
- `addToCart(product)`: nếu sản phẩm (theo `slug`) đã có trong giỏ thì tăng `qty`, chưa có thì thêm mới với `qty:1`. Giá lưu dạng SỐ (parse từ chuỗi `p.priceCurrent` như `"199.000đ"` bằng `parsePriceVN()`, bỏ hết ký tự không phải số) — không lưu chuỗi giá gốc, để cộng tổng tiền chính xác.
- `removeFromCart(slug)`: xoá hẳn 1 item khỏi giỏ (không có nút giảm số lượng, chỉ có xoá — đúng yêu cầu khách "nút xoá từng sản phẩm").
- `syncCartUI()`: gọi sau mỗi lần thêm/xoá — cập nhật SONG SONG 2 chỗ: (1) badge số lượng ở MỌI icon giỏ hàng header (`.icon-btn .icon-dot`, dùng `querySelectorAll` vì về mặt kỹ thuật mỗi trang chỉ có 1 icon giỏ hàng nhưng viết tổng quát cho an toàn), (2) nội dung modal `#modal-cart` (`buildCartModalHTML()`).
- `.icon-dot` mặc định `display:none`; chỉ hiện (`display:flex`, class `.show`) khi giỏ hàng có ít nhất 1 sản phẩm, hiển thị TỔNG SỐ LƯỢNG (cộng dồn `qty`, không phải số loại sản phẩm khác nhau), tối đa hiển thị "9+" nếu vượt quá 9.
- Nút "Thêm giỏ hàng" trong thẻ sản phẩm (render bởi `renderProductGrid()`) dùng `data-add-to-cart="${slug}"` (KHÔNG còn dùng `data-modal="cart"` trực tiếp) — bấm vào sẽ vừa gọi `addToCart()` vừa tự mở modal giỏ hàng (`openModal("cart")`) để khách thấy ngay sản phẩm vừa thêm, xử lý trong `setupCartActions()`.
- Ảnh nhỏ trong modal giỏ hàng thực chất là icon SVG đơn giản (tái dùng `DASH_ICONS`, map qua field `type` của sản phẩm bằng bảng `PRODUCT_TYPE_ICON` vì tên `type` trong `data/products.js` — "drive"/"wedding"/"finance"... — không trùng tên key trong `DASH_ICONS` — "folder"/"heart"/"trend"...) — KHÔNG phải ảnh chụp thật, vì sản phẩm chưa có ảnh thật.
- Giỏ hàng persist qua việc mở tab mới/đóng tab (cùng trình duyệt, cùng origin) vì đọc/ghi cùng 1 key localStorage; đổi trình duyệt hoặc xoá dữ liệu duyệt web thì mất — đây LÀ hành vi đúng theo yêu cầu khách, không phải lỗi cần sửa.
- Nút "Tiến hành thanh toán" trong modal hiện CHƯA có chức năng thật (chỉ là nút UI) — đúng theo yêu cầu "chưa cần chức năng thật ở bước này".
- Trang chi tiết sản phẩm (`products/*.html`) hiện chỉ có nút "Mua ngay" trong `.buy-box`, KHÔNG có nút "Thêm giỏ hàng" riêng — nên chưa được nối vào hệ thống giỏ hàng này. Nếu sau này thêm nút "Thêm giỏ hàng" ở đó, dùng lại đúng `data-add-to-cart="<slug>"` là đủ (không cần viết lại logic).

### Trạng thái active của menu header

`.main-nav a.active` (CSS: `font-weight:700`, giữ nguyên màu `var(--color-black)`) đánh dấu mục đang được xem. Đây là class gắn TĨNH thủ công vào đúng thẻ `<a>` trong từng file HTML (không phải tính toán bằng JS theo URL hiện tại) — vì đây là các trang HTML tĩnh riêng biệt, mỗi file tự "biết" nó là trang nào: `san-pham.html`/`khuyen-mai.html`/`kiem-tien.html`/`products/*.html` (mục "Sản phẩm") đều đã gắn `class="active"` vào đúng mục nav tương ứng. **`index.html` (trang chủ) KHÔNG gắn `active` cho mục nào** — đúng yêu cầu khách "cả 4 mục đều hiển thị bình thường". Nếu nhân bản thêm trang mới (vd sản phẩm chi tiết khác), nhớ gắn `class="active"` cho mục "Sản phẩm" ở nav của trang đó để nhất quán.

### QUAN TRỌNG: cache CSS trên trình duyệt của khách

Link `css/style.css` ở mọi trang HTML có query string phá cache dạng `?v=N` (vd `css/style.css?v=7`). **Mỗi lần đẩy thay đổi CSS lên GitHub Pages, PHẢI tăng số `N` này ở tất cả các trang HTML** — nếu không, trình duyệt khách hàng có thể tiếp tục hiển thị bản CSS cache cũ (GitHub Pages trả `cache-control: max-age=600`) và khách sẽ tưởng nhầm là "chưa sửa gì cả" dù code đã đúng trên server. Đã xảy ra 1 lần: khách báo "không thấy thay đổi" nhưng kiểm tra trực tiếp file CSS trên server thì đã đúng bản mới — do trình duyệt cache. Luôn tăng version này cùng lúc với mỗi lần sửa `css/style.css`.

### Lưu ý về kích thước thẻ sản phẩm

Khung "laptop" (`.device-display`) cố định `height: 138px` — đây là ngân sách chiều cao cho toàn bộ mini-dashboard bên trong (tiêu đề + 3 ô số liệu + 1 hàng nội dung phụ như donut/list/bars/table/calendar). Nếu thêm loại mini-dashboard mới hoặc thêm dòng nội dung, phải kiểm tra bằng ảnh chụp thật (không chỉ đọc code) vì `overflow: hidden` sẽ âm thầm cắt mất phần tràn ra — đã gặp lỗi này 2 lần khi thêm quá nhiều dòng cho danh sách file/bảng đơn hàng. Badge góc trên thẻ (`.product-thumb .badge`, `top/left: 8px`) và phần đệm trên của `.product-thumb` (`padding-top: 24px`) phải khớp nhau — giảm cỡ badge mà không giảm padding-top tương ứng (hoặc ngược lại) sẽ làm tiêu đề mini-dashboard bị badge đè lên.

**`.product-card` có `max-width: 340px` (căn giữa bằng `margin: 0 auto`)** — áp dụng cho MỌI lưới sản phẩm (cả `.hero-products .product-grid` lẫn `san-pham.html`). Lý do: trước vòng sửa 18, thẻ không có giới hạn nên ở trang `san-pham.html` (không bị chia cột bởi hero, container rộng tới 1360px), mỗi thẻ bị kéo dãn tới ~440px — trông "kéo dài, khoảng trống giữa các thẻ bị hẹp", nút Thêm giỏ hàng/Mua ngay dù đúng kích thước tuyệt đối nhưng trông "nhỏ/dẹt" bất thường so với thẻ quá to. Giới hạn 340px giữ tỉ lệ thẻ nhất quán ở mọi ngữ cảnh (hero lẫn trang danh sách đầy đủ). Trên mobile (`max-width:720px`) có override `.product-card { max-width: none; }` để thẻ full-width như thiết kế 1 cột.

### Breakpoint xếp dọc của `.hero-shop-grid` (1300px) và độ nhạy của mini-dashboard 3-ô

`.hero-shop-grid` (cột `.hero-intro` + lưới sản phẩm bên phải) chuyển sang xếp dọc (1 cột) ở `@media (max-width: 1300px)`. Con số này đã được xác định bằng cách chụp ảnh thật và ZOOM vào từng ô mini-dashboard ở nhiều độ rộng khác nhau (không chỉ nhìn tổng thể) — vì lỗi bóp méo ở đây rất khó thấy bằng mắt thường ở cỡ ảnh chụp bình thường:

- Nguyên nhân gốc: cột `.hero-intro` dùng `minmax(320px, 600px)` — khi tổng bề rộng container không đủ chỗ cho CẢ `.hero-intro` ở gần mức tối đa LẪN lưới sản phẩm 3 cột đủ rộng, ô số liệu thứ 3 trong mini-dashboard (ví dụ "Dung lượng / 256,8GB" — chuỗi số không có khoảng trắng nên KHÔNG tự xuống dòng được) bị cắt chữ bởi `overflow:hidden` của `.device-display`, dù nhìn tổng thể ở cỡ ảnh nhỏ trông vẫn "có vẻ ổn".
- Đã test thực nghiệm: dưới ~1250-1280px chữ bắt đầu bị cắt; từ 1300px trở lên hiển thị sạch hoàn toàn (chỉ tên sản phẩm dài có thể tự xuống 2 dòng — đây KHÔNG phải lỗi, không ảnh hưởng căn chỉnh vì `.product-body` có `flex:1` đẩy nút xuống đều nhau).
- Đã giảm nhẹ đệm/gap của `.dash-stat`/`.dash-stats` (padding `4px 5px`→`4px 3px`, gap `4px`→`3px`, cỡ chữ giá trị `10.5px`→`10px`) để có thêm biên an toàn — nếu không có bước này, ngưỡng an toàn sẽ cao hơn nhiều (~1450-1500px thay vì 1300px).
- **Trước vòng sửa 18, breakpoint là 1500px** — khiến các laptop phổ biến (1440px, 1512px logical...) bị xếp dọc dù thực ra dư sức hiển thị 2 cột, đây chính là lỗi khách báo cáo ("giao diện bị sai ở màn hình nhỏ, phải giống hình 2 xếp 2 cột").
- **Nếu sau này cần đổi lại độ rộng `.hero-intro` (hiện `minmax(320px,600px)`) hoặc thêm/sửa nội dung mini-dashboard**, PHẢI test lại bằng ảnh chụp zoom cận cảnh từng ô số liệu ở dải 1200-1500px trước khi chốt breakpoint mới — đừng chỉ tin vào ảnh chụp tổng thể, lỗi cắt chữ 1-2 ký tự cuối rất dễ bị bỏ sót.

### Lưu ý về tiêu đề Hero (h1)

Tiêu đề lớn trong `.hero-intro h1` dùng `<br />` ngắt dòng CỨNG. **Quan trọng: khách muốn 3 dòng có độ dài SO LE tự nhiên** (hiện tại: "Kho công cụ số giúp bạn" ngắn / "làm việc nhanh hơn," ngắn hơn nữa / "mua một lần và dùng mãi mãi." dài nhất) — KHÔNG cân bằng độ dài 3 dòng cho đều nhau (đã từng làm vậy ở vòng sửa 9-10 và bị khách chê "thiết kế bằng nhau khi xuống hàng, phải thụt ra thụt vô nhìn mới đẹp"). Không dựa vào wrap tự nhiên theo độ rộng cột (kết quả không ổn định, phụ thuộc font render trình duyệt) — luôn ngắt dòng CỨNG rồi test bằng ảnh chụp thật.

Vì dòng dài nhất khá dài, cột `.hero-intro` (`grid-template-columns` trong `.hero-shop-grid`, hiện `minmax(320px, 600px)`) phải đủ rộng để dòng đó không tự wrap thêm lần nữa. **Mỗi lần đổi độ rộng tối đa của cột này, PHẢI đổi luôn breakpoint xếp dọc tương ứng** (media query `@media (max-width: 1500px)` gần cuối file, phần Responsive) — nếu không, vùng giữa 960px và breakpoint đó sẽ bị bóp nghẹt (lỗi đã lặp lại 2 lần: cột 500px/breakpoint 1300px, rồi cột 540px/breakpoint 1400px).

**Riêng mobile (`@media max-width: 720px`) có `.hero-intro h1 { font-size: 26px }` override riêng** — bắt buộc phải có, vì cỡ chữ desktop (32-39px) sẽ khiến mỗi dòng đã ngắt cứng TỰ WRAP THÊM 1 LẦN NỮA trên màn hình hẹp (vỡ thành 6 dòng, rất xấu — lỗi thực tế đã xảy ra). Nếu đổi cỡ chữ desktop, phải kiểm tra lại xem override mobile này có cần chỉnh theo không (test bằng ảnh chụp ở viewport ~390-430px).

### Nút "Tự động hoá giúp tối ưu công việc" (hero-cta)

Đây LÀ một nút thật (`.btn.btn-dark.hero-cta`, nền đen bo góc), KHÔNG phải chữ thường. Ở vòng sửa trước có lúc đổi thành `<p>` chữ thường theo yêu cầu, nhưng đã đổi lại thành nút vì khách xác nhận hình mẫu tham khảo của họ luôn hiển thị phần tử này dạng nút đen — nếu nhận yêu cầu đổi lại thành text, hỏi lại kỹ trước khi sửa vì đã đổi qua lại 1 lần.

### Nút "Xem thêm" trên trang chủ

Nằm bên trong `.hero-products` (cùng cột với `.product-grid`, không phải block riêng full-width) và căn trái (`text-align:left`) — để nó bám sát ngay dưới lưới sản phẩm thay vì trôi giữa trang. Mũi tên dùng SVG inline (không dùng ký tự "→") để nét luôn đậm rõ, nhất quán với các icon khác trên trang.

### Nút hỗ trợ nổi (support-fab)

Nhãn "Hỗ trợ" nằm `position:absolute` đè lên góc trên-phải của vòng tròn cam — xem `.support-fab .fab-label` trong `css/style.css`. Vòng tròn cỡ nhỏ (50px, không phải to) kèm hiệu ứng phát sáng mềm (`box-shadow: 0 0 22px 4px rgba(254,178,10,.55)`) — đã từng bị làm quá to ("khủng bố" theo lời khách) và từng bị bỏ mất hiệu ứng phát sáng, phải giữ đúng 2 đặc điểm này. Chữ "Hỗ trợ" màu cam/vàng (`var(--color-orange)`) trên nền đen, KHÔNG phải màu trắng. Icon tai nghe dùng path đơn giản (1 vòng cung + 2 `<rect>` bo góc làm tai nghe), không có chi tiết mic phụ ở dưới — bản có mic đã bị khách chê "sai".

### Tên thương hiệu — viết đúng chính tả và đúng font

Viết là **"Swiftstreet"** (chỉ hoa chữ S đầu), KHÔNG phải "SwiftStreet". Áp dụng cho mọi nơi xuất hiện tên thương hiệu (logo header/footer, title trang, nút, meta description...). Tên các sản phẩm riêng lẻ (SwiftCopy.Drive, SwiftPlanner Wedding...) giữ nguyên cách viết hoa của chúng — không liên quan đến quy tắc này.

Font chữ thương hiệu là **Poppins** (Google Fonts, đã nhúng link trong `<head>` của mọi trang HTML), khai báo qua biến `--font-brand` trong `css/style.css` và áp dụng cho `.brand`, `.main-nav a`, `.hero-rate-btn`. Nếu thêm trang HTML mới, phải copy nguyên khối `<link rel="preconnect">`/`<link href="...fonts.googleapis.com/css2?family=Poppins...">` trong `<head>`, nếu không chữ thương hiệu sẽ rơi về font hệ thống mặc định.

Trọng lượng chữ (`font-weight`) từng giảm dần qua nhiều vòng do bị chê "in đậm quá": `.brand` và `.main-nav a` cùng đi từ 800→700→600→500. Đến vòng sửa 17, khách gửi ảnh logo mẫu (chữ đen đậm rõ) và yêu cầu riêng `.brand` "đậm nhẹ 1 tí" — đã tăng lại `.brand` từ 500→**600** (CHỈ áp dụng cho `.brand`/logo, KHÔNG đụng tới `.main-nav a` — menu điều hướng vẫn giữ 500). Đây là ngoại lệ đi ngược xu hướng giảm; nếu khách chê đậm lại, cân nhắc quay về 500 nhưng đừng tự ý giảm xuống dưới 500 hay tăng vượt 600 vì khách nhấn mạnh "đậm nhẹ 1 tí thôi, đừng quá đậm".

### Chiều rộng container / khoảng trắng 2 bên

`--container-width` hiện là `1360px`. Lưu ý: đã từng tăng lên 1560px để giảm khoảng trắng ở màn hình rộng, nhưng bị chê footer bị kéo dãn xấu (khoảng cách giữa các cột footer quá lớn) — 1360px là điểm cân bằng giữa 2 lần phản hồi trái ngược nhau. Nếu chỉnh lại, luôn kiểm tra ảnh chụp CẢ phần hero/lưới sản phẩm LẪN phần footer ở viewport rộng (≥1900px), vì 2 khu vực này phản ứng ngược nhau với việc đổi container-width.

### Gradient nút cam (hero-rate-btn)

Gradient 2 màu phải GẦN NHAU (vd `#ffbb2e` → `#fa9a05`), không được chọn 2 màu tương phản mạnh — vì nút có dạng viên thuốc (border-radius 999px) nên 2 đầu bo tròn gần như chỉ nhận 1 màu duy nhất của gradient, nếu 2 màu cách xa nhau (vd vàng nhạt và cam đậm) thì 2 đầu sẽ trông như 2 khối màu tách biệt ("2 cái đuôi" theo lời khách) thay vì 1 dải gradient mượt.

Nút này có animation `heroRateGlow` (2.2s, lặp vô hạn) tạo hiệu ứng tỏa sáng/nhấp nháy nhẹ liên tục (không chỉ khi hover) — khách yêu cầu cụ thể "hiệu ứng tỏa sáng hoặc nhấp nháy tỏa ra". Khi hover, animation tạm dừng (`animation-play-state: paused`) và chuyển sang hiệu ứng phóng to + bóng đổ đậm hơn.

### Nút "Thêm giỏ hàng"/"Mua ngay" trong thẻ sản phẩm — chiều rộng 80%

`.product-card-actions` có `width: 80%` (không phải 100%) và `padding` chỉ có bên trái (13px), không có bên phải — để 2 nút dồn sát trái, chừa khoảng trống ~20% bên phải thẻ. Đây là yêu cầu cụ thể của khách ("đẩy về sát trái, chiếm ~80% chiều ngang"), KHÔNG phải lỗi — nếu thấy nút không full-width thì đó là chủ đích, đừng "sửa" lại thành 100%.

**`.btn-sm` bắt buộc `white-space: nowrap`** (không phải `normal`) — chữ "Thêm giỏ hàng" (13 ký tự) từng bị xuống dòng làm thẻ cao không đều, khách yêu cầu rõ "không được xuống hàng". Vì nowrap không tự wrap khi hết chỗ (sẽ tràn ra ngoài thay vì xuống dòng), cỡ chữ và padding phải luôn đủ chỗ trong 80% chiều rộng thẻ, ngay cả ở layout 3 cột hẹp nhất (~800px viewport). Nếu tăng cỡ chữ nút này, PHẢI test bằng ảnh chụp ở nhiều độ rộng (800/1920px) để chắc chắn chữ không tràn ra ngoài khung nút.

**Lịch sử cỡ chữ/padding `.btn-sm` đã dao động rất nhiều lần** (11→10.5→11.5→11→10px qua các vòng 8-15, luôn theo hướng thu nhỏ do sợ vỡ dòng). Đến **vòng sửa 19**, khách gửi ảnh trang sản phẩm của đối thủ (Optimate) làm chuẩn, chê nút hiện tại "chiều cao và size không đúng" so với tổng thể — đã **tăng ngược lại đáng kể**: `padding: 9px 4px`→`13px 6px`, `font-size: 10px`→`12px` (đã test kỹ không tràn chữ ở cả 2 ngữ cảnh hẹp nhất: lưới 3 cột 800px VÀ cột hero bị chia đôi). Đây là NGOẠI LỆ đảo ngược xu hướng giảm nhiều vòng trước — nếu nhận phản hồi "nút to quá" trong tương lai, đừng tự động quay về mốc 10px cũ vì đó chưa chắc còn là ý khách; hỏi lại hoặc so khớp với ảnh mẫu mới nhất trước khi giảm. Cũng đã xoá override riêng `padding: 12px 5px` cho mobile (vòng 13) vì padding gốc mới đã đủ cao hơn giá trị override đó.

### Cấu trúc Footer (5 cột: logo/mô tả + 4 cột nav)

Footer gồm **5 cột**: `.footer-brand` (logo header + tên "Swiftstreet" + đoạn mô tả ngắn, cột rộng hơn — `grid-template-columns: 1.6fr 1fr 1fr 1fr 1fr`) rồi mới đến **Giới thiệu | Sản phẩm | Hỗ trợ | Liên hệ** (đúng thứ tự này). Cột "Liên hệ" gồm: email dạng text thường (không icon), dòng chữ "Quét mã Zalo kết nối" (`font-weight: 400`, KHÔNG in đậm), và khung mã QR bên dưới.

**LƯU Ý QUAN TRỌNG (đã xảy ra 1 lần)**: ở vòng sửa 14, khi viết lại footer từ 3-cột-có-logo sang 4-cột (Giới thiệu/Sản phẩm/Hỗ trợ/Liên hệ), cột `.footer-brand` (logo + mô tả) đã bị xoá nhầm — khách CHỈ yêu cầu chỉnh 4 mục kia, không hề yêu cầu bỏ khối logo/mô tả. Đã khôi phục lại ở vòng sửa 16. Nếu sau này cần chỉnh lại thứ tự/nội dung 4 cột nav, **không được xoá `.footer-brand`** trừ khi khách yêu cầu rõ ràng.

**Mã QR Zalo là ảnh THẬT** — `assets/img/zalo-qr.png` (khách đã có sẵn file này trong thư mục dự án, đặt tên `zalo-qr.png` ở gốc, đã di chuyển vào `assets/img/` cho gọn cấu trúc). Khối `<div class="footer-qr">` chứa thẻ `<img src=".../assets/img/zalo-qr.png">` ở footer của cả 5 trang HTML — không phải SVG giả lập. Nếu khách đổi mã QR (đổi số Zalo...), chỉ cần thay file `assets/img/zalo-qr.png` bằng ảnh mới, giữ nguyên tên file.

`.footer-bottom` dùng CSS Grid 3 cột (`1fr auto 1fr`) để hàng icon mạng xã hội (`.footer-social`) luôn nằm CHÍNH GIỮA bất kể độ dài text 2 bên (copyright bên trái, "Made with care in Vietnam" bên phải) — không dùng flex `space-between` vì sẽ không căn giữa đúng khi 2 đoạn text 2 bên có độ dài khác nhau. Icon mạng xã hội hiện có: Facebook, TikTok, Instagram, Threads (mô phỏng đơn giản, không phải logo chính thức), YouTube — toàn bộ là SVG inline vẽ tay đơn giản hoá, màu xám (`#9a9a9a`) chuyển cam khi hover, size 18px. Trên mobile (`max-width:720px`), `.footer-bottom` chuyển thành 1 cột, mọi phần tử căn giữa.

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
- ✅ Vòng sửa 9: khách muốn nhìn thấy tới tận chữ "Mua hàng đơn giản trong 3 bước" mà không phải cuộn quá xa (so với hình mẫu) — giảm padding dọc `.hero-shop` (56/48→44/36), `.section` (64→48), margin-bottom các dòng trong hero-intro, và cỡ chữ hero (h1 max 38→35px, promo-text 17→16px). Giảm thêm 1 nấc nút Thêm giỏ hàng/Mua ngay (12→11.5px) và các phần tử trong thẻ sản phẩm (tên 15→14px, giá 17→16px, padding product-body/thumb giảm nhẹ). Đã test kỹ không bị đè badge lên tiêu đề mini-dashboard (rủi ro quen thuộc khi đổi padding-top của `.product-thumb`).
- ✅ Vòng sửa 10: khách gửi ảnh chính site của mình làm chuẩn, yêu cầu "tăng tất cả lên cỡ này" (h1, promo-text, tên/giá sản phẩm tăng lại gần mức vòng 8) VÀ đồng thời giảm lề 2 bên (`--container-width` 1360→1480px, padding container clamp max 56→40px) — 2 việc này làm cùng lúc nên tổng thể không bị "phình" thêm nhiều. Nút Thêm giỏ hàng/Mua ngay lại được yêu cầu giảm tiếp (11.5→11px) — đây là NGOẠI LỆ, không tăng theo xu hướng chung. Do cột `.hero-intro` tăng lên `minmax(320px,540px)`, đã nâng breakpoint xếp dọc tương ứng từ 1300px lên 1400px để tránh lặp lại lỗi bóp nghẹt lưới sản phẩm.
- ✅ Vòng sửa 11: tăng CHIỀU CAO nút Thêm giỏ hàng/Mua ngay (`.btn-sm` padding dọc 6px→9px, chỉ tăng chiều cao, không đổi cỡ chữ — khác vòng 10 là giảm cỡ chữ) — dùng chung 1 class cho cả desktop/mobile nên tự động đồng bộ. Tăng nhẹ khu vực sản phẩm (`.device-display` height 138→150px, `.product-thumb` padding tăng nhẹ). Thêm box-shadow phát sáng cam nhẹ cho `.hero-rate-btn:hover` (kèm giảm scale 1.08→1.04) cho cảm giác hover "nhẹ" hơn thay vì chỉ phóng to.
- ✅ Vòng sửa 12: sửa lỗi NGHIÊM TRỌNG trên mobile — tiêu đề hero vỡ thành 6 dòng (do font desktop quá to cho màn hình hẹp làm mỗi dòng đã ngắt cứng tự wrap thêm lần nữa) — thêm override `font-size:26px` riêng cho `.hero-intro h1` ở `@media max-width:720px`. Đồng thời khách chê 3 dòng tiêu đề "đều nhau quá" khi đã cân bằng độ dài ở vòng 9-10 — đổi lại về 3 dòng so le tự nhiên như thiết kế gốc (ngắn/ngắn hơn/dài), nới cột `.hero-intro` lên `minmax(320px,600px)` để dòng dài nhất vẫn vừa 1 hàng, và nâng breakpoint xếp dọc từ 1400px lên 1500px tương ứng. Tăng thêm khu vực sản phẩm 1 nấc nữa (`.device-display` height 150→162px).
- ✅ Vòng sửa 13: chữ "Swiftstreet" bị chê "ngày càng cứng và đậm" — giảm `.brand` font-weight 600→500 (giữ nguyên font Poppins + size 20px, chỉ giảm độ đậm). Tăng thêm khu vực sản phẩm 1 nấc nữa (`.device-display` height 162→174px, `.product-thumb` padding tăng nhẹ). Giảm nhẹ nút "Xem thêm" (`.hero-more .btn-outline` padding/font/icon giảm 1 chút). Nút Thêm giỏ hàng/Mua ngay bị chê THẤP trên mobile dù đã tăng cho desktop ở vòng 11 (cùng 1 class `.btn-sm` nên lẽ ra phải giống nhau) — thêm override riêng `padding: 12px 5px` cho `.btn-sm` trong `@media max-width:720px` để mobile cao hơn desktop một chút, giải quyết theo đúng yêu cầu thay vì cố tìm "lỗi code" không tồn tại.
- ✅ Vòng sửa 14: 2 nút Thêm giỏ hàng/Mua ngay trong thẻ sản phẩm đổi sang chiếm 80% chiều ngang, dồn sát trái (xem mục riêng bên dưới). Thêm animation tỏa sáng/nhấp nháy liên tục cho nút "Đánh giá Swiftstreet". Viết lại HOÀN TOÀN cấu trúc footer: bỏ cột logo/mô tả, đổi thành 4 cột Giới thiệu/Sản phẩm/Hỗ trợ/Liên hệ, và thêm hàng 5 icon mạng xã hội (Facebook/TikTok/Instagram/Threads/YouTube) căn giữa ở `.footer-bottom` bằng CSS Grid 3 cột. Đã áp dụng đồng bộ cho cả 5 trang HTML bằng script thay thế footer tự động. Ban đầu dùng SVG placeholder cho mã QR Zalo, nhưng phát hiện khách đã để sẵn file `zalo-qr.png` (mã QR thật) trong thư mục dự án nên đã dùng luôn ảnh thật (đưa vào `assets/img/zalo-qr.png`).
- ✅ Vòng sửa 15: giảm độ đậm menu header (`.main-nav a` font-weight 600→500, đồng bộ với `.brand` đã giảm ở vòng 13) — bị chê "sao nay đậm vậy". Sửa lỗi chữ "Thêm giỏ hàng" xuống dòng làm 2 nút cao không đều — đổi `.btn-sm` sang `white-space: nowrap` (không cho xuống dòng nữa) và giảm cỡ chữ 11px→10px, padding ngang 5px→4px để luôn đủ chỗ trong 80% chiều rộng thẻ.
- ✅ Vòng sửa 16: tăng nhẹ khu vực thẻ sản phẩm (`.device-display` height 174→186px, `.product-thumb` padding tăng nhẹ, tên sản phẩm 15→16px, giá 17→18px, giá gạch 13→14px, badge 10→10.5px kèm tăng top/left 8→9px tương ứng để giữ khoảng cách). Tăng cỡ chữ đoạn khuyến mãi (`.hero-promo-text` 17→18.5px). Khôi phục lại cột logo/mô tả thương hiệu (`.footer-brand`) đã bị xoá nhầm ở vòng 14 — xem mục "Cấu trúc Footer" bên dưới.
- ✅ Vòng sửa 17: tăng lại độ đậm chữ thương hiệu "Swiftstreet" (`.brand` font-weight 500→600) theo ảnh logo mẫu khách gửi, yêu cầu "đậm nhẹ 1 tí, đừng quá đậm" — CHỈ áp dụng cho `.brand`, không đổi `.main-nav a` (vẫn 500).
- ✅ Vòng sửa 18: sửa lỗi `.hero-shop-grid` xếp dọc quá sớm (breakpoint cũ 1500px khiến laptop thường 1440-1512px hiển thị sai, xếp dọc thay vì 2 cột như hình mẫu khách gửi) — hạ breakpoint xuống 1300px sau khi test bằng ảnh chụp zoom cận cảnh (phát hiện mini-dashboard ô "Dung lượng 256,8GB" bị cắt chữ dưới ~1280px, đã giảm nhẹ đệm/gap `.dash-stat` để có biên an toàn — xem mục riêng bên dưới). Thêm `max-width: 340px` cho `.product-card` (áp dụng mọi lưới sản phẩm) để sửa lỗi thẻ bị kéo dãn quá to/nút trông nhỏ dẹt trên `san-pham.html` (container rộng không bị hero chia cột) — trước đó thẻ có thể rộng tới ~440px không giới hạn.
- ✅ Vòng sửa 19: theo ảnh trang sản phẩm của đối thủ (Optimate) khách gửi làm chuẩn — tăng đáng kể chiều cao/cỡ chữ nút Thêm giỏ hàng/Mua ngay (xem mục riêng ở trên, đảo ngược xu hướng thu nhỏ nhiều vòng trước). Xây **giỏ hàng thật bằng localStorage** (thêm/xoá sản phẩm, badge số lượng ở icon header, modal hiển thị danh sách kèm icon/tên/giá + tổng tiền — xem mục "Giỏ hàng (localStorage)"). Thêm **trạng thái active cho menu header** — mục tương ứng in đậm khi đang ở đúng trang, trang chủ không đậm mục nào (xem mục riêng).
- ❌ Chưa có nội dung chi tiết thật (mô tả sản phẩm, FAQ, tính năng... hiện đang là placeholder).
- ❌ Giỏ hàng đã lưu thật bằng localStorage (xem vòng 19) nhưng CHƯA có trang/luồng thanh toán thật — nút "Tiến hành thanh toán" trong modal mới chỉ là UI.
- ❌ Trang "Khuyến mãi" và "Kiếm Tiền" chỉ là placeholder, chưa có nội dung.
- ❌ Chưa kết nối Firebase, chưa xử lý thanh toán thật.
- ❌ Chưa có trang admin, chưa có trang CTV.
- ❌ Chưa deploy Vercel (dự kiến chưa dùng ở giai đoạn này).

## Việc cần làm tiếp theo (gợi ý cho phiên sau)

1. Viết nội dung thật cho từng sản phẩm (mô tả, tính năng, FAQ đầy đủ).
2. Nhân bản `products/swiftcopy-drive.html` cho các sản phẩm còn lại trong `data/products.js`.
3. Giỏ hàng đã lưu thật bằng localStorage (vòng 19) — còn thiếu trang/luồng thanh toán thật cho nút "Tiến hành thanh toán".
4. Viết nội dung thật cho trang "Khuyến mãi" và "Kiếm Tiền".
5. Kết nối Firebase Firestore để lưu đơn hàng.
6. Xây trang admin duyệt đơn + gửi email giao file.
