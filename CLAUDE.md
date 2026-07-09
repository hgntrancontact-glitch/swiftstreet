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
footer-pages/                  6 trang nội dung footer riêng biệt (Về chúng tôi, Câu hỏi thường gặp,
                                Hướng dẫn mua hàng, Điều khoản sử dụng, Chính sách đổi trả, Kiếm tiền
                                CTV) — xem mục "Trang nội dung footer" bên dưới
thanh-toan.html                 Trang thanh toán DÙNG CHUNG cho mua 1 sản phẩm (?slug=) và mua nhiều
                                sản phẩm từ giỏ hàng — xem mục "Trang thanh toán" bên dưới
css/style.css                  Toàn bộ style + biến màu (:root) + responsive
js/main.js                     Render lưới sản phẩm (khung "laptop" mô phỏng giao diện), xử lý menu
                                mobile, hệ thống modal (giỏ hàng/hỗ trợ/FAQ), dropdown thông báo,
                                dropdown hỗ trợ nổi, và logic trang thanh toán
data/products.js               Danh sách sản phẩm (mảng PRODUCTS, field `type` quyết định
                                mini-dashboard mô phỏng nào hiển thị trong khung laptop)
assets/icons/                  favicon.ico, favicon-32x32.png, apple-touch-icon.png
assets/img/                    logo-header.png (nền trong suốt), logo-square-master.png (bản gốc đã cắt vuông)
```

### Thẻ sản phẩm (product card)

Mỗi thẻ sản phẩm trên `index.html`/`san-pham.html` gồm 3 phần, render bởi `renderProductGrid()` trong `js/main.js`:
1. `product-card-link` (bấm vào ảnh/tên → trang chi tiết): khung "laptop" (`.device-screen/.device-display/.device-base`) chứa mini-dashboard mô phỏng bằng code (không phải ảnh thật) — màu sắc bên trong `.device-display` được đổi sang tông sáng qua CSS variables override (không viết lại CSS mini-dashboard).
2. Tên sản phẩm + giá.
3. `product-card-actions`: 2 nút "Thêm giỏ hàng" (thêm vào giỏ localStorage) và "Mua ngay" (từ vòng sửa 24, đi THẲNG tới trang thanh toán `thanh-toan.html?slug=<slug>` — KHÔNG còn link sang trang chi tiết sản phẩm nữa, xem mục "Trang thanh toán" bên dưới).

### Hệ thống modal

3 modal dùng chung (giỏ hàng / hỗ trợ / FAQ rút gọn) được `setupModals()` trong `js/main.js` tự động chèn vào `<body>` của MỌI trang có include `js/main.js` — không cần viết HTML modal thủ công ở từng trang. Bất kỳ phần tử nào có `data-modal="cart|support|faq"` sẽ mở modal tương ứng khi bấm. **Từ vòng sửa 24, "thông báo" KHÔNG còn là modal nữa** — đã đổi thành dropdown neo dưới icon chuông, xem mục "Dropdown thông báo" bên dưới; `MODAL_CONTENT` không còn key `notify`. Modal `support`/`faq` được build bằng hàm (`buildSupportModalHTML()`/`buildFaqModalHTML()`) vì cần tính đường dẫn tương đối (`getRootPrefix()`) tới ảnh/QR/trang khác tuỳ theo trang đang đứng ở thư mục nào; modal `cart` là **nội dung động** theo giỏ hàng, xem mục "Giỏ hàng (localStorage)" ngay bên dưới.

### `getRootPrefix()` — tính đường dẫn tương đối theo độ sâu thư mục

Trang web có 3 cấp thư mục dùng chung `js/main.js`: gốc (`index.html`...), `products/`, `footer-pages/`. Hàm `getRootPrefix()` kiểm tra `location.pathname` — trả về `"../"` nếu đang ở `products/` hoặc `footer-pages/`, ngược lại trả về chuỗi rỗng. Dùng để build link/ảnh đúng từ JS (vd link "Xem tất cả câu hỏi" trong modal FAQ, ảnh QR Zalo trong modal Hỗ trợ, link "Mua ngay" trong giỏ hàng tới `thanh-toan.html`) mà không phải viết cứng HTML khác nhau cho từng trang.

### Giỏ hàng (localStorage) — không backend, không đăng nhập

Giỏ hàng lưu trong `localStorage` của trình duyệt, key `swiftstreet_cart` (mảng JSON các item `{ slug, name, price, priceOld (số nguyên VNĐ), shortDesc, type, qty, selected }`). Toàn bộ logic nằm trong `js/main.js`:

- `getCart()`/`setCart()`: đọc/ghi localStorage, `setCart()` tự gọi `syncCartUI()` sau khi ghi. `getCart()` tự gán `selected: true` cho item cũ lưu từ trước khi có field này (tương thích ngược).
- `addToCart(product)`: nếu sản phẩm (theo `slug`) đã có trong giỏ thì tăng `qty`, chưa có thì thêm mới với `qty:1, selected:true`. Giá + giá gốc lưu dạng SỐ (`parsePriceVN()`), và lưu cả `shortDesc` (từ `data/products.js`) — để trang giỏ hàng/thanh toán có đủ dữ liệu hiển thị mà KHÔNG cần `PRODUCTS` phải có mặt trên mọi trang (vd `khuyen-mai.html`, `footer-pages/*.html` không load `data/products.js`).
- `removeFromCart(slug)` / `toggleCartItemSelected(slug)` / `toggleSelectAllCart()`: xoá 1 item / tick chọn 1 item / tick-chọn-tất-cả (bấm lần nữa khi đã chọn hết sẽ bỏ chọn hết).
- `syncCartUI()`: cập nhật badge số lượng (mọi `.icon-btn .icon-dot`) + nội dung modal `#modal-cart` (`buildCartModalHTML()`).
- Nút "Thêm giỏ hàng" dùng `data-add-to-cart="${slug}"` — bấm vào vừa gọi `addToCart()` vừa mở modal giỏ hàng, xử lý trong `setupCartActions()` (cũng xử lý `data-remove-slug`, `data-toggle-select`, `data-toggle-select-all`, `data-cart-checkout`).

**Giao diện giỏ hàng kiểu TikTok Shop (vòng sửa 24)** — xem `buildCartModalHTML()`:
- Tiêu đề "Giỏ hàng (X)" CĂN GIỮA (`.cart-modal-head`, dùng CSS Grid `1fr auto 1fr` để tiêu đề giữa mà nút đóng vẫn ở góc — cùng kỹ thuật với `.footer-bottom`), X = tổng SỐ LƯỢNG (cộng dồn `qty`).
- Mỗi sản phẩm (`.cart-item`): tên + icon xoá (thùng rác SVG) ở hàng trên; hàng dưới gồm ảnh thu nhỏ (icon SVG mô phỏng, KHÔNG phải ảnh thật) + mô tả ngắn + giá kiểu "flash sale" (giá hiện tại đậm, giá gốc gạch ngang, badge đỏ "Giảm Xđ" nếu có chênh lệch) + nút tròn chọn (`.cart-item-select`, class `.checked` khi được chọn, hiện dấu ✓).
- "Chọn tất cả" (`.cart-select-all`) nằm cuối danh sách, dùng chung style nút tròn.
- Tổng tiền CHỈ cộng các item có `selected:true`. Nút cuối cùng đổi tên "Mua ngay" (không phải "Tiến hành thanh toán" nữa) — bấm vào điều hướng tới `thanh-toan.html` (không kèm `?slug=`, trang thanh toán sẽ tự đọc các item `selected` trong giỏ).
- Giỏ hàng persist qua việc mở tab mới/đóng tab (cùng trình duyệt, cùng origin); đổi trình duyệt hoặc xoá dữ liệu duyệt web thì mất — đây LÀ hành vi đúng theo yêu cầu khách, không phải lỗi cần sửa.

### Trang thanh toán (`thanh-toan.html`) — vòng sửa 24

Trang DUY NHẤT xử lý cả 2 luồng mua hàng, phân biệt qua query string `?slug=`:
- **Có `?slug=<slug>`** (bấm "Mua ngay" ở thẻ sản phẩm/trang chi tiết sản phẩm, KHÔNG qua giỏ hàng): chỉ hiển thị đúng 1 sản phẩm đó (tra cứu trực tiếp trong `PRODUCTS`, không đụng tới giỏ hàng thật), KHÔNG có nút xoá từng dòng (vì chỉ có 1 sản phẩm, không có ý nghĩa xoá).
- **Không có `?slug=`** (bấm "Mua ngay" trong modal giỏ hàng): đọc `getCart().filter(item => item.selected)` — chỉ những sản phẩm đang được tick trong giỏ. Có nút xoá từng dòng (`data-checkout-remove`) — xoá ở đây XOÁ LUÔN khỏi giỏ hàng thật (gọi `removeFromCart()`) để đồng bộ, không chỉ ẩn khỏi màn hình thanh toán.
- Giỏ hàng rỗng/không có sản phẩm hợp lệ → ẩn `#checkout-main`, hiện `#checkout-empty` (thông báo + nút "Xem sản phẩm").
- Bố cục 2 cột (`.checkout-grid`, đổi thành 1 cột dưới `max-width:860px`): cột trái = danh sách sản phẩm + form 3 ô (Họ tên/SĐT-Zalo/Email, dùng lại class `.simple-form` — xem bên dưới) + khung tổng tiền + đoạn ghi chú có link SĐT/Zalo `0909 821 702` (`.checkout-phone-link`, mở modal Hỗ trợ qua `data-modal="support"`). Cột phải = mockup "Quét mã để thanh toán" (tái dùng `.payment-mock` đã có từ trang Hướng dẫn mua hàng, thêm dòng "Số tài khoản" + "Nội dung CK") + nút "Tôi đã chuyển khoản" (chỉ hiện toast xác nhận, CHƯA xử lý thật — đơn vẫn chờ admin duyệt tay) + đoạn ghi chú đóng (`.checkout-note-2`, `max-width:385px` để xuống đúng 2 dòng cân đối — nếu đổi nội dung đoạn này, PHẢI test lại bằng ảnh chụp vì đổi vài chữ có thể làm lệch số dòng).
- **Mã đơn hàng**: `generateOrderCode()` sinh chuỗi `"SS" + 4 số ngẫu nhiên` MỖI LẦN TẢI TRANG (không lưu, không cần thiết vì chỉ là placeholder hiển thị ở "Nội dung CK" để admin đối chiếu tay sau này khi có backend thật).
- Toàn bộ logic nằm trong `setupCheckoutPage()` (chỉ chạy nếu trang có `#checkout-product-list`, nên an toàn khi include `js/main.js` ở các trang khác không có phần tử này).
- **`.simple-form`** (đổi tên từ `.ctv-form` ở vòng 24 để dùng chung cho cả trang Kiếm tiền CTV lẫn trang thanh toán — 2 form có style giống hệt nhau, tránh lặp CSS).

**QUAN TRỌNG — "Mua ngay" đổi hành vi ở vòng sửa 24, ảnh hưởng dây chuyền tới nhiều nơi**: trước đó "Mua ngay" = link tới trang chi tiết sản phẩm (`products/<slug>.html`); từ vòng 24, "Mua ngay" ở MỌI nơi (thẻ sản phẩm, trang chi tiết sản phẩm, `.sticky-buy-bar`, và cả 2 link "SwiftCopy.Drive"/"SwiftPlanner Wedding" ở cột "Sản phẩm" trong footer — vì 2 link đó được khách định nghĩa "tương đương Mua ngay") đều trỏ tới `thanh-toan.html?slug=<slug>`. Nếu sau này thêm sản phẩm mới hoặc trang chi tiết mới, nhớ áp dụng đúng pattern này thay vì trỏ về trang mô tả sản phẩm.

### Trạng thái active của menu header

`.main-nav a.active` (CSS: `font-weight:700`, giữ nguyên màu `var(--color-black)`) đánh dấu mục đang được xem. Đây là class gắn TĨNH thủ công vào đúng thẻ `<a>` trong từng file HTML (không phải tính toán bằng JS theo URL hiện tại) — vì đây là các trang HTML tĩnh riêng biệt, mỗi file tự "biết" nó là trang nào: `san-pham.html`/`khuyen-mai.html`/`kiem-tien.html`/`products/*.html` (mục "Sản phẩm") đều đã gắn `class="active"` vào đúng mục nav tương ứng. **`index.html` (trang chủ) KHÔNG gắn `active` cho mục nào** — đúng yêu cầu khách "cả 4 mục đều hiển thị bình thường". Nếu nhân bản thêm trang mới (vd sản phẩm chi tiết khác), nhớ gắn `class="active"` cho mục "Sản phẩm" ở nav của trang đó để nhất quán.

### QUAN TRỌNG: cache CSS trên trình duyệt của khách

Link `css/style.css` ở mọi trang HTML có query string phá cache dạng `?v=N` (vd `css/style.css?v=7`). **Mỗi lần đẩy thay đổi CSS lên GitHub Pages, PHẢI tăng số `N` này ở tất cả các trang HTML** — nếu không, trình duyệt khách hàng có thể tiếp tục hiển thị bản CSS cache cũ (GitHub Pages trả `cache-control: max-age=600`) và khách sẽ tưởng nhầm là "chưa sửa gì cả" dù code đã đúng trên server. Đã xảy ra 1 lần: khách báo "không thấy thay đổi" nhưng kiểm tra trực tiếp file CSS trên server thì đã đúng bản mới — do trình duyệt cache. Luôn tăng version này cùng lúc với mỗi lần sửa `css/style.css`.

### Lưu ý về kích thước thẻ sản phẩm

Khung "laptop" (`.device-display`) cố định `height: 138px` — đây là ngân sách chiều cao cho toàn bộ mini-dashboard bên trong (tiêu đề + 3 ô số liệu + 1 hàng nội dung phụ như donut/list/bars/table/calendar). Nếu thêm loại mini-dashboard mới hoặc thêm dòng nội dung, phải kiểm tra bằng ảnh chụp thật (không chỉ đọc code) vì `overflow: hidden` sẽ âm thầm cắt mất phần tràn ra — đã gặp lỗi này 2 lần khi thêm quá nhiều dòng cho danh sách file/bảng đơn hàng. Badge góc trên thẻ (`.product-thumb .badge`, `top/left: 8px`) và phần đệm trên của `.product-thumb` (`padding-top: 24px`) phải khớp nhau — giảm cỡ badge mà không giảm padding-top tương ứng (hoặc ngược lại) sẽ làm tiêu đề mini-dashboard bị badge đè lên.

**`.product-card` có `max-width: 340px` (căn giữa bằng `margin: 0 auto`)** — áp dụng cho MỌI lưới sản phẩm (cả `.hero-products .product-grid` lẫn `san-pham.html`). Lý do: trước vòng sửa 18, thẻ không có giới hạn nên ở trang `san-pham.html` (không bị chia cột bởi hero, container rộng tới 1360px), mỗi thẻ bị kéo dãn tới ~440px — trông "kéo dài, khoảng trống giữa các thẻ bị hẹp", nút Thêm giỏ hàng/Mua ngay dù đúng kích thước tuyệt đối nhưng trông "nhỏ/dẹt" bất thường so với thẻ quá to. Giới hạn 340px giữ tỉ lệ thẻ nhất quán ở mọi ngữ cảnh (hero lẫn trang danh sách đầy đủ). Trên mobile (`max-width:720px`) có override `.product-card { max-width: none; }` để thẻ full-width như thiết kế 1 cột.

### `.hero-shop-grid` KHÔNG BAO GIỜ xếp dọc trên desktop — chỉ xếp dọc ở mobile thật (≤720px)

**Đây là yêu cầu tường minh của khách** (vòng sửa 20): "hero auto bên trái trừ trường hợp xem trên mobile" — tức cột `.hero-intro` ("Kho công cụ số giúp bạn...") phải LUÔN nằm bên trái ở MỌI độ rộng desktop khi kéo thu nhỏ cửa sổ trình duyệt, không được rơi xuống xếp dọc (hero trên, lưới sản phẩm dưới) cho tới khi thật sự là màn hình mobile.

Ở vòng sửa 18, breakpoint xếp dọc từng được đặt ở 1300px (xem lịch sử `git log` nếu cần) vì lưới sản phẩm 3 cột không đủ chỗ dưới ngưỡng đó (ô "Dung lượng 256,8GB" trong mini-dashboard — chuỗi số không khoảng trắng nên không tự xuống dòng — bị `overflow:hidden` cắt chữ). Khách phản hồi lại rằng cách "né" bằng xếp dọc là SAI hướng — thay vào đó phải giữ hero bên trái và co giãn lưới sản phẩm. Giải pháp hiện tại (vòng 20) dùng **3 tầng breakpoint, không tầng nào xếp dọc**, chỉ đổi số cột của LƯỚI SẢN PHẨM và thu nhỏ cột `.hero-intro`/cỡ chữ H1:

| Độ rộng viewport | `.hero-intro` | Lưới sản phẩm (`.hero-products .product-grid`) | H1 font-size |
|---|---|---|---|
| ≥ 1301px (mặc định) | `minmax(320px, 600px)` | 3 cột | `clamp(32px, 3.4vw, 39px)` |
| 961–1300px | `minmax(260px, 420px)` | 2 cột | `clamp(26px, 3vw, 32px)` |
| 721–960px | `minmax(200px, 300px)` | **1 cột** (danh sách dọc, mỗi thẻ full chiều rộng còn lại) | `22px` |
| ≤ 720px (mobile thật) | `position: static`, `grid-template-columns: 1fr` (xếp dọc, đúng hành vi mobile cũ) | 1 cột | `26px` |

Lý do tầng 721-960px phải giảm về **1 cột** (không phải 2): ở độ rộng này cột `.hero-intro` cần tối thiểu ~200-300px để chữ H1 không vỡ dòng thêm, không còn đủ chỗ cho 2 thẻ sản phẩm cạnh nhau mà không tái diễn lỗi cắt chữ mini-dashboard — nhưng 1 cột thì mỗi thẻ được full chiều rộng còn lại (rất rộng rãi), không hề bị bóp. `.product-card` vẫn tự giới hạn `max-width: 340px` nên không bị kéo dãn quá to trong cột rộng.

**Nếu sau này cần đổi lại các con số min/max trong bảng trên** (vd đổi độ dài dòng H1, đổi nội dung mini-dashboard...), PHẢI test lại bằng ảnh chụp zoom cận cảnh từng ô số liệu VÀ kiểm tra H1 không vỡ thêm dòng, ở toàn bộ dải 721-1300px (không chỉ 2 đầu mút) — lỗi cắt chữ 1-2 ký tự cuối hoặc H1 tự wrap thêm dòng rất dễ bị bỏ sót nếu chỉ nhìn ảnh chụp tổng thể không zoom.

**Lưu ý về `.product-grid` KHÔNG nằm trong `.hero-products`** (tức trang `san-pham.html`, không bị hero chia cột): trang này vẫn giữ 3 cột tới tận 961px vì không có cột hero cạnh tranh không gian, chỉ giảm xuống 2 cột ở tầng 721-960px (lý do: nút Thêm giỏ hàng/Mua ngay cỡ to riêng cho trang này — xem mục bên dưới — sẽ tràn chữ nếu vẫn ép 3 cột lúc thẻ bị bóp hẹp).

### Lưu ý về tiêu đề Hero (h1)

Tiêu đề lớn trong `.hero-intro h1` dùng `<br />` ngắt dòng CỨNG. **Quan trọng: khách muốn 3 dòng có độ dài SO LE tự nhiên** (hiện tại: "Kho công cụ số giúp bạn" ngắn / "làm việc nhanh hơn," ngắn hơn nữa / "mua một lần và dùng mãi mãi." dài nhất) — KHÔNG cân bằng độ dài 3 dòng cho đều nhau (đã từng làm vậy ở vòng sửa 9-10 và bị khách chê "thiết kế bằng nhau khi xuống hàng, phải thụt ra thụt vô nhìn mới đẹp"). Không dựa vào wrap tự nhiên theo độ rộng cột (kết quả không ổn định, phụ thuộc font render trình duyệt) — luôn ngắt dòng CỨNG rồi test bằng ảnh chụp thật.

Vì dòng dài nhất khá dài, cột `.hero-intro` ở độ rộng mặc định (`minmax(320px, 600px)`, dùng khi viewport ≥1301px) phải đủ rộng để dòng đó không tự wrap thêm lần nữa. Từ vòng sửa 20, `.hero-shop-grid` không còn xếp dọc ở các độ rộng desktop hẹp hơn nữa — thay vào đó cột `.hero-intro` thu nhỏ dần qua 3 tầng breakpoint (1300px/960px/720px, xem bảng ở mục "`.hero-shop-grid` KHÔNG BAO GIỜ xếp dọc" phía trên) kèm cỡ chữ H1 giảm tương ứng ở mỗi tầng để dòng dài nhất luôn vừa 1 hàng. **Nếu đổi độ rộng mặc định 600px của cột, hoặc đổi nội dung 3 dòng H1, PHẢI kiểm tra lại cả 3 tầng breakpoint đó bằng ảnh chụp thật** (không chỉ tầng mặc định) — vì mỗi tầng có cỡ chữ H1 riêng, đổi 1 chỗ mà quên đổi các tầng còn lại sẽ tái diễn lỗi vỡ dòng ở đúng khoảng đang không được kiểm tra.

**Riêng mobile (`@media max-width: 720px`) có `.hero-intro h1 { font-size: 26px }` override riêng** — bắt buộc phải có, vì cỡ chữ desktop (32-39px) sẽ khiến mỗi dòng đã ngắt cứng TỰ WRAP THÊM 1 LẦN NỮA trên màn hình hẹp (vỡ thành 6 dòng, rất xấu — lỗi thực tế đã xảy ra). Nếu đổi cỡ chữ desktop, phải kiểm tra lại xem override mobile này có cần chỉnh theo không (test bằng ảnh chụp ở viewport ~390-430px).

### Nút "Tự động hoá giúp tối ưu công việc" (hero-cta)

Đây LÀ một nút thật (`.btn.btn-dark.hero-cta`, nền đen bo góc), KHÔNG phải chữ thường. Ở vòng sửa trước có lúc đổi thành `<p>` chữ thường theo yêu cầu, nhưng đã đổi lại thành nút vì khách xác nhận hình mẫu tham khảo của họ luôn hiển thị phần tử này dạng nút đen — nếu nhận yêu cầu đổi lại thành text, hỏi lại kỹ trước khi sửa vì đã đổi qua lại 1 lần.

### Nút "Xem thêm" trên trang chủ

Nằm bên trong `.hero-products` (cùng cột với `.product-grid`, không phải block riêng full-width) và căn trái (`text-align:left`) — để nó bám sát ngay dưới lưới sản phẩm thay vì trôi giữa trang. Mũi tên dùng SVG inline (không dùng ký tự "→") để nét luôn đậm rõ, nhất quán với các icon khác trên trang.

### Nút hỗ trợ nổi (support-fab) — dropdown 3 mục từ vòng sửa 24

Nhãn "Hỗ trợ" nằm `position:absolute` đè lên góc trên-phải của vòng tròn cam — xem `.support-fab .fab-label` trong `css/style.css`. Vòng tròn cỡ nhỏ (50px, không phải to) kèm hiệu ứng phát sáng mềm (`box-shadow: 0 0 22px 4px rgba(254,178,10,.55)`) — đã từng bị làm quá to ("khủng bố" theo lời khách) và từng bị bỏ mất hiệu ứng phát sáng, phải giữ đúng 2 đặc điểm này. Chữ "Hỗ trợ" màu cam/vàng (`var(--color-orange)`) trên nền đen, KHÔNG phải màu trắng. Icon tai nghe dùng path đơn giản (1 vòng cung + 2 `<rect>` bo góc làm tai nghe), không có chi tiết mic phụ ở dưới — bản có mic đã bị khách chê "sai".

Từ vòng sửa 24, bấm vào vòng tròn cam (`.support-fab-trigger`, KHÔNG còn `data-modal` trực tiếp) không mở modal ngay mà mở dropdown 3 mục (`.support-fab-menu`, neo phía trên vòng tròn) — xử lý trong `setupSupportFab()`:
- **"Hỗ trợ"** (`data-modal="support"`) → modal `buildSupportModalHTML()`: tiêu đề "Thông tin hỗ trợ kỹ thuật", email, ảnh QR Zalo thật (`assets/img/zalo-qr.png`, qua `getRootPrefix()`), nút "Đóng".
- **"FAQ"** (`data-modal="faq"`) → modal `buildFaqModalHTML()`: bản RÚT GỌN 5 câu hỏi tiêu biểu nhất (khác với trang FAQ đầy đủ ở footer — chỉ chọn lọc, không phải toàn bộ 10 câu), có link "Xem tất cả câu hỏi" trỏ sang `footer-pages/cau-hoi-thuong-gap.html`.
- **"Báo lỗi"** (`data-report-bug`) → KHÔNG mở modal, chỉ hiện toast nhỏ tự ẩn (`showToast()`) với nội dung "Hiện tại chúng tôi chưa hỗ trợ tính năng này." — cố tình đơn giản, không xây thêm gì phức tạp cho mục này theo đúng yêu cầu khách.

`.support-fab-trigger` (nút tròn) và `.support-fab-menu button` (3 mục dropdown) PHẢI có 2 selector CSS RIÊNG — lúc đầu dùng chung `.support-fab button` sẽ khiến 3 nút trong dropdown bị dính kiểu vòng tròn cam 50px của nút trigger (vì cả 2 đều là `<button>` con của `.support-fab`).

### Dropdown thông báo (icon chuông) — vòng sửa 24

Từ vòng sửa 24, icon chuông KHÔNG còn mở modal giữa màn hình — đổi thành dropdown neo NGAY DƯỚI icon chuông (`.notify-dropdown`, `position:absolute` trong `.notify-wrap`), không làm mờ nền, không dùng chung hệ `modal-overlay`. Xử lý trong `setupNotifyDropdown()`. Nội dung 5 thông báo mẫu nằm trong hằng số `NOTIFICATIONS` (mảng `{title, time}`) — xoay quanh 3 chủ đề: khuyến mãi đang diễn ra, sản phẩm mới ra mắt, tính năng mới trong 1 sản phẩm cụ thể — đổi nội dung trực tiếp trong mảng này nếu cần cập nhật, không phải sửa HTML từng trang (danh sách render động).

`.notify-dropdown-list` giới hạn `max-height: 214px` (đủ cao cho ĐÚNG 3 thông báo, thông báo thứ 4-5 phải cuộn mới thấy — cố tình KHÔNG giãn khung theo số lượng) kèm `overflow-y:auto`. Dropdown thông báo và dropdown/menu hỗ trợ nổi LOẠI TRỪ LẪN NHAU (mở cái này tự đóng cái kia) và đều tự đóng khi mở bất kỳ modal nào (`closeDropdowns()` gọi trong `openModal()`) hoặc bấm ra ngoài.

### Toast nhỏ (`showToast()`)

Thông báo ngắn tự ẩn sau ~2.6 giây, neo giữa-dưới màn hình (`.toast`, nền đen, chữ trắng, bo tròn viên thuốc) — hiện dùng cho "Báo lỗi" (support-fab) và nút "Tôi đã chuyển khoản" ở trang thanh toán. Nếu cần thêm thông báo dạng này ở chỗ khác, gọi lại `showToast("nội dung")` là đủ, không cần tạo phần tử DOM mới (hàm tự tạo/tái sử dụng 1 `<div id="swiftstreet-toast">` dùng chung).

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

**Lịch sử cỡ chữ/padding `.btn-sm` đã dao động rất nhiều lần** (11→10.5→11.5→11→10px qua các vòng 8-15, luôn theo hướng thu nhỏ do sợ vỡ dòng). Đến **vòng sửa 19**, khách gửi ảnh trang sản phẩm của đối thủ (Optimate) làm chuẩn, chê nút hiện tại "chiều cao và size không đúng" so với tổng thể — đã **tăng ngược lại đáng kể**: `padding: 9px 4px`→`13px 6px`, `font-size: 10px`→`12px`. Cũng đã xoá override riêng `padding: 12px 5px` cho mobile (vòng 13) vì padding gốc mới đã đủ cao hơn giá trị override đó.

**QUAN TRỌNG — vòng sửa 20 thu hẹp phạm vi áp dụng của thay đổi trên**: khách làm rõ lại rằng yêu cầu tăng size ở vòng 19 CHỈ áp dụng cho trang **`san-pham.html`** ("khi nhấn vào mục Sản phẩm"), KHÔNG áp dụng cho lưới sản phẩm ở trang chủ/landing (`index.html`, bên trong `.hero-products`) — nhưng vòng 19 đã lỡ đổi `.btn-sm` DÙNG CHUNG nên ảnh hưởng cả 2 trang. Đã sửa bằng cách thêm rule ghi đè **`.hero-products .btn-sm { padding: 9px 4px; font-size: 10px; }`** (đặt ngay sau `.btn-sm` gốc trong `css/style.css`) để khôi phục cỡ nhỏ ban đầu CHỈ cho trang chủ, còn `san-pham.html` (không có `.hero-products` bao ngoài) vẫn nhận style to từ rule `.btn-sm` gốc. **Nếu cần chỉnh cỡ nút này trong tương lai, luôn tự hỏi: đang nói về trang chủ hay trang Sản phẩm** — 2 trang này CỐ Ý có cỡ nút khác nhau, không phải lỗi thiếu đồng bộ.

### Khoảng cách giữa các thẻ sản phẩm (`.product-grid` gap) — cùng kiểu scoping với `.btn-sm`

Vòng sửa 21: khách so với trang sản phẩm của đối thủ (Optimate) và chê "khoảng cách và thiết kế giữa các thẻ chưa tốt" trên `san-pham.html` — thẻ trông chật/dính vào nhau. Đã tăng `.product-grid` gap từ `14px` lên `28px`, nhưng dùng ĐÚNG PATTERN scoping đã áp dụng cho `.btn-sm` ở vòng 20: base `.product-grid` (dùng cho `san-pham.html`) nhận gap mới 28px, còn thêm rule ghi đè **`.hero-products .product-grid { gap: 14px; }`** để giữ nguyên khoảng cách hẹp cũ ở trang chủ (không được yêu cầu đổi, và trang chủ vốn ít chỗ hơn do phải chia sẻ với cột hero). Không đổi kiểu bo góc/border/shadow của `.product-card` — chỉ đổi khoảng cách, vì thiết kế "khung laptop" mô phỏng là đặc trưng riêng của Swiftstreet, không nên bắt chước hoàn toàn phong cách ảnh phẳng của đối thủ.

**Vòng sửa 22 — sửa tiếp lỗi khoảng trắng THỪA giữa các thẻ (khách chụp ảnh khoanh đỏ chỉ ra)**: tăng `gap` ở vòng 21 chưa giải quyết đúng gốc vấn đề. Nguyên nhân thật sự: `.product-grid` dùng `grid-template-columns: repeat(3, 1fr)` — mỗi cột lưới giãn đều theo bề rộng container (vd container 1480px → mỗi cột ~450px), trong khi `.product-card` bị giới hạn `max-width:340px` và tự canh giữa bằng `margin:0 auto` bên trong cột đó, để lại khoảng trắng thừa ~55px MỖI BÊN thẻ — cộng với `gap` thật, tổng khoảng cách nhìn thấy giữa 2 thẻ lên tới ~130-270px tuỳ độ rộng màn hình (càng rộng càng thừa nhiều), dù giá trị `gap` chỉ là 28px. Khách phản hồi đúng: đây không phải do `gap` quá lớn mà do khoảng trắng thừa trong lòng mỗi cột.

**Cách sửa đúng**: đổi `grid-template-columns` từ `repeat(N, 1fr)` sang **`repeat(N, minmax(0, 340px))`** (áp dụng cho MỌI khai báo cột của `.product-grid`/`.hero-products .product-grid` ở mọi tầng breakpoint — 3 cột mặc định, 2 cột ở tầng 960px/1300px) kèm **`justify-content: center`** trên `.product-grid`. Cách này giới hạn TRẦN mỗi cột đúng bằng `max-width` của thẻ nên không còn khoảng trắng thừa trong lòng cột; phần dư của container (nếu có) được dồn ra 2 RÌA NGOÀI CÙNG của cả lưới (nhờ `justify-content:center`) thay vì chen vào giữa từng cặp thẻ. Khoảng cách giữa các thẻ sau khi sửa đúng bằng giá trị `gap` đã khai báo (28px ở `san-pham.html`, 14px ở trang chủ).

**Nếu sau này thêm breakpoint mới hoặc đổi số cột của bất kỳ `.product-grid` nào, LUÔN dùng `minmax(0, 340px)` thay vì `1fr`** — dùng `1fr` sẽ lặp lại đúng lỗi khoảng trắng thừa này bất cứ khi nào cột lưới rộng hơn 340px (tức container đủ rộng, thẻ chưa cần co lại theo cột).

### Cấu trúc Footer (5 cột: logo/mô tả + 4 cột nav)

Footer gồm **5 cột**: `.footer-brand` (logo header + tên "Swiftstreet" + đoạn mô tả ngắn, cột rộng hơn — `grid-template-columns: 1.6fr 1fr 1fr 1fr 1fr`) rồi mới đến **Giới thiệu | Sản phẩm | Hỗ trợ | Liên hệ** (đúng thứ tự này). Cột "Liên hệ" gồm: email dạng text thường (không icon), dòng chữ "Quét mã Zalo kết nối", và khung mã QR bên dưới.

**`.footer-zalo-label` (dòng "Quét mã Zalo kết nối") đổi từ `font-weight:400`/`#b5b5b5` sang `font-weight:600`/`#e2e2e2` ở vòng sửa 24** — đậm hơn và sáng hơn các dòng anh em cùng cột (email, link...) nhưng vẫn KHÔNG được đậm/to bằng tiêu đề cột (`.footer-col h4`, trắng thuần + bold mặc định của thẻ h4). Giữ nguyên `font-size: 13px`, chỉ đổi weight + màu.

**LƯU Ý QUAN TRỌNG (đã xảy ra 1 lần)**: ở vòng sửa 14, khi viết lại footer từ 3-cột-có-logo sang 4-cột (Giới thiệu/Sản phẩm/Hỗ trợ/Liên hệ), cột `.footer-brand` (logo + mô tả) đã bị xoá nhầm — khách CHỈ yêu cầu chỉnh 4 mục kia, không hề yêu cầu bỏ khối logo/mô tả. Đã khôi phục lại ở vòng sửa 16. Nếu sau này cần chỉnh lại thứ tự/nội dung 4 cột nav, **không được xoá `.footer-brand`** trừ khi khách yêu cầu rõ ràng.

**Mã QR Zalo là ảnh THẬT** — `assets/img/zalo-qr.png` (khách đã có sẵn file này trong thư mục dự án, đặt tên `zalo-qr.png` ở gốc, đã di chuyển vào `assets/img/` cho gọn cấu trúc). Khối `<div class="footer-qr">` chứa thẻ `<img src=".../assets/img/zalo-qr.png">` ở footer của cả 5 trang HTML — không phải SVG giả lập. Nếu khách đổi mã QR (đổi số Zalo...), chỉ cần thay file `assets/img/zalo-qr.png` bằng ảnh mới, giữ nguyên tên file.

`.footer-bottom` dùng CSS Grid 3 cột (`1fr auto 1fr`) để hàng icon mạng xã hội (`.footer-social`) luôn nằm CHÍNH GIỮA bất kể độ dài text 2 bên (copyright bên trái, "Made with care in Vietnam" bên phải) — không dùng flex `space-between` vì sẽ không căn giữa đúng khi 2 đoạn text 2 bên có độ dài khác nhau. Icon mạng xã hội hiện có: Facebook, TikTok, Instagram, Threads (mô phỏng đơn giản, không phải logo chính thức), YouTube — toàn bộ là SVG inline vẽ tay đơn giản hoá, màu xám (`#9a9a9a`) chuyển cam khi hover, size 18px. Trên mobile (`max-width:720px`), `.footer-bottom` chuyển thành 1 cột, mọi phần tử căn giữa.

### Trang nội dung footer (`footer-pages/`) — vòng sửa 23

6 trang nội dung thật (KHÔNG phải placeholder) tách riêng thành 6 file HTML độc lập trong `footer-pages/` — cố tình KHÔNG gộp vào `index.html` hay các file hiện có để tránh phình code, theo đúng yêu cầu khách:

- `ve-chung-toi.html` — Về chúng tôi
- `cau-hoi-thuong-gap.html` — Câu hỏi thường gặp (dùng lại `.faq-item`/`<details>` giống FAQ ở `products/swiftcopy-drive.html`, có link chéo sang Điều khoản/Chính sách đổi trả/Kiếm tiền CTV ngay trong câu trả lời)
- `huong-dan-mua-hang.html` — Hướng dẫn mua hàng (5 bước dọc dùng class mới `.guide-steps`/`.guide-step`, tái dùng `.step-number` từ khối "Quy trình" ở trang chủ)
- `dieu-khoan-su-dung.html` — Điều khoản sử dụng (7 mục đánh số)
- `chinh-sach-doi-tra.html` — Chính sách đổi trả
- `kiem-tien-ctv.html` — Kiếm tiền CTV, có thêm form UI "Đăng ký nhanh" (`.ctv-form`, các input thật nhưng CHƯA nối backend — giống tinh thần nút "Tiến hành thanh toán" trong giỏ hàng, chỉ là giao diện)

**Nguồn nội dung**: `Swiftstreet_NoiDung_Footer.txt` ở gốc dự án (khách tự chuyển từ Word sang txt). File này bị lỗi font khi chuyển đổi — rất nhiều ký tự dấu tiếng Việt bị mất, một phần giải mã được bằng `iconv -f VISCII -t UTF-8`, phần còn lại (khoảng 1650 dấu `?` rải khắp file) đã được khôi phục dựa theo NGỮ CẢNH (không phải chép nguyên văn 100% chắc chắn, vì dữ liệu gốc đã mất một phần không thể phục hồi tuyệt đối). Nội dung 6 trang hiện tại là bản diễn giải lại theo đúng ý từng đoạn của file gốc — nếu khách cần đối chiếu chính xác tuyệt đối từng chữ (đặc biệt 2 trang Điều khoản sử dụng/Chính sách đổi trả), nên nhờ khách xác nhận lại hoặc cung cấp lại bản Word gốc.

**CSS dùng chung** (thêm ở vòng 23, đặt trong `css/style.css` ngay trước mục Modal): `.legal-content` (khung nội dung dạng bài viết, max-width 760px, style cho `h2`/`p`/`ul`), `.guide-steps`/`.guide-step` (danh sách bước dọc), `.payment-mock` (mockup màn hình "Quét mã để thanh toán" — dùng lại ở CẢ trang Hướng dẫn mua hàng LẪN trang thanh toán từ vòng 24), `.simple-form` (đổi tên từ `.ctv-form` ở vòng 24, dùng chung cho form CTV và form thanh toán). **Lưu ý một lỗi CSS đã gặp và sửa trong vòng này**: ban đầu `.legal-content ul li` dùng `display:flex` để đặt chấm tròn đầu dòng — nhưng vì mọi PHẦN TỬ con trực tiếp (kể cả `<strong>`) đều tự động trở thành flex-item RIÊNG BIỆT trong flex container, phần `<strong>Nhãn:</strong>` bị tách thành "cột" riêng khỏi phần mô tả theo sau, làm bullet list trông như bảng 2 cột sai lệch. Đã sửa bằng cách bỏ `display:flex`, dùng `position:relative` + `::before` định vị tuyệt đối (`position:absolute`) làm chấm tròn thay thế — đây là cách an toàn hơn cho bullet list có chứa phần tử inline (`<strong>`, `<a>`...) bên trong `<li>`.

**Ảnh minh hoạ "Quét mã để thanh toán"** (`.payment-mock`, dùng ở bước 4 trang Hướng dẫn mua hàng VÀ ở trang `thanh-toan.html`): mô phỏng bằng code (SVG giả QR + các dòng thông tin ngân hàng/số tiền/nội dung CK dạng text), KHÔNG phải ảnh chụp thật — đúng yêu cầu khách "chưa có, mô phỏng tạm bằng code, để tôi bổ sung ảnh thật sau".

**Hành vi link đặc biệt trong footer** (áp dụng ở TẤT CẢ trang: 6 trang footer-pages, 5 trang cũ index/san-pham/khuyen-mai/kiem-tien/products-swiftcopy-drive, và `thanh-toan.html`):
- "SwiftCopy.Drive" / "SwiftPlanner Wedding" → **từ vòng sửa 24**, cả 2 trỏ tới `thanh-toan.html?slug=<slug>` (KHÔNG còn trỏ tới trang chi tiết sản phẩm nữa — xem mục "Trang thanh toán" để hiểu lý do đổi). Link `thanh-toan.html?slug=swiftplanner-wedding` sẽ hiển thị đúng sản phẩm (tra trực tiếp trong `PRODUCTS`, không cần trang chi tiết `products/swiftplanner-wedding.html` tồn tại) — khác với link cũ ở vòng 23 (trỏ thẳng vào `products/swiftplanner-wedding.html`, file chưa tồn tại nên sẽ 404); cách làm mới ở vòng 24 KHÔNG bị lỗi 404 này nữa vì không phụ thuộc trang chi tiết sản phẩm có tồn tại hay không.
- "Nhiều sản phẩm khác..." → `san-pham.html` (đã đúng sẵn, tương đương mục nav "Sản phẩm").
- "Kiếm tiền CTV" ở footer trỏ `footer-pages/kiem-tien-ctv.html` (trang nội dung thật). Lưu ý: mục nav "Kiếm Tiền" trên header (`kiem-tien.html`) vẫn là placeholder riêng — 2 trang "Kiếm Tiền" (nav placeholder) và "Kiếm tiền CTV" (footer, nội dung thật) tồn tại song song, không phải trùng lặp nhầm.

Cả 6 trang `footer-pages/*.html` đều KHÔNG gắn `class="active"` cho bất kỳ mục nav nào (không tương ứng trực tiếp với 1 trong 4 mục Trang chủ/Sản phẩm/Khuyến mãi/Kiếm Tiền).

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
- ✅ Vòng sửa 20: khách làm rõ tăng size nút Thêm giỏ hàng/Mua ngay ở vòng 19 CHỈ áp dụng cho `san-pham.html`, không áp dụng cho trang chủ — đã thu hẹp phạm vi bằng rule `.hero-products .btn-sm` (khôi phục cỡ nhỏ ban đầu cho riêng trang chủ, xem mục riêng). Thiết kế lại HOÀN TOÀN cách `.hero-shop-grid` phản hồi khi thu nhỏ màn hình: KHÔNG còn xếp dọc ở bất kỳ độ rộng desktop nào (khách yêu cầu rõ "hero auto bên trái trừ mobile") — thay bằng 3 tầng breakpoint (1300/960/720px) giảm dần độ rộng cột `.hero-intro`, cỡ chữ H1, và số cột lưới sản phẩm (3→2→1), chỉ xếp dọc thật ở ≤720px. San-pham.html cũng giảm xuống 2 cột ở tầng 721-960px để nút cỡ to (vòng 19) không tràn chữ khi thẻ bị bóp hẹp. Đã test toàn bộ dải 720-1350px bằng ảnh chụp thật (xem mục "`.hero-shop-grid` KHÔNG BAO GIỜ xếp dọc" phía trên).
- ✅ Vòng sửa 21: theo ảnh so sánh với đối thủ (Optimate), khách chê khoảng cách giữa các thẻ sản phẩm trên `san-pham.html` "chưa tốt" (chật/dính nhau) — tăng `.product-grid` gap 14px→28px CHỈ cho trang này, giữ nguyên 14px ở trang chủ qua rule `.hero-products .product-grid` (cùng pattern scoping với `.btn-sm` ở vòng 20 — xem mục "Khoảng cách giữa các thẻ sản phẩm").
- ✅ Vòng sửa 22: khách chụp ảnh khoanh đỏ chỉ ra khoảng trắng giữa các thẻ trên `san-pham.html` VẪN quá rộng dù đã tăng gap ở vòng 21 — hoá ra gốc lỗi không phải do gap mà do `grid-template-columns: repeat(N, 1fr)` khiến mỗi cột giãn hết cỡ container trong khi thẻ bị chặn `max-width:340px` và tự canh giữa, tạo khoảng trắng thừa lớn trong lòng mỗi cột. Sửa bằng cách đổi toàn bộ khai báo cột (mọi breakpoint) sang `repeat(N, minmax(0, 340px))` + `justify-content: center` trên `.product-grid` — xem mục "Khoảng cách giữa các thẻ sản phẩm" (đã cập nhật).
- ✅ Vòng sửa 23: tạo 6 trang nội dung footer thật trong `footer-pages/` (Về chúng tôi, Câu hỏi thường gặp, Hướng dẫn mua hàng, Điều khoản sử dụng, Chính sách đổi trả, Kiếm tiền CTV) từ nội dung khách cung cấp trong `Swiftstreet_NoiDung_Footer.txt` (file bị lỗi font khi chuyển từ Word, đã giải mã + khôi phục theo ngữ cảnh — xem mục "Trang nội dung footer"). Cập nhật link footer ở cả 5 trang cũ trỏ đúng tới 6 trang mới, sửa link "SwiftPlanner Wedding" và đổi link "Kiếm tiền CTV" sang trang nội dung thật thay vì trang placeholder cũ. Thêm mockup "Quét mã để thanh toán" bằng code cho bước 4 hướng dẫn mua hàng, và form UI "Đăng ký nhanh" cho trang CTV (cả 2 đều chưa nối backend thật).
- ❌ Nội dung sản phẩm riêng lẻ (mô tả, tính năng, FAQ theo từng sản phẩm cụ thể trên `products/*.html`) vẫn là placeholder — khác với 6 trang footer (đã có nội dung thật từ vòng 23).
- ✅ Vòng sửa 24 (theo file kế hoạch `PROMPT_SWIFTSTREET_FOOTER_GIOHANG_THANHTOAN.md`, mục C-G): đổi style dòng "Quét mã Zalo kết nối" (đậm/sáng hơn — mục C). Đổi nút hỗ trợ nổi thành dropdown 3 mục Hỗ trợ/FAQ/Báo lỗi (mục D). Đổi thông báo (icon chuông) từ modal sang dropdown neo dưới chuông, viết lại 5 thông báo mới (mục E). Thiết kế lại HOÀN TOÀN giỏ hàng kiểu TikTok Shop: checkbox tròn chọn từng sản phẩm/chọn tất cả, giá kiểu flash-sale (giá gốc gạch ngang + badge "Giảm Xđ"), tổng tiền chỉ tính sản phẩm được chọn, nút đổi tên "Mua ngay" (mục F). Xây trang `thanh-toan.html` DÙNG CHUNG cho luồng mua 1 sản phẩm (`?slug=`) và mua nhiều sản phẩm đã chọn từ giỏ hàng, bố cục 2 cột, mã đơn tự sinh, mockup QR thanh toán (mục G). Xem các mục riêng ở trên (Giỏ hàng, Trang thanh toán, Dropdown thông báo, Nút hỗ trợ nổi) để biết chi tiết kỹ thuật.
- ❌ Trang "Khuyến mãi" và "Kiếm Tiền" (2 trang placeholder ở nav, khác với `footer-pages/kiem-tien-ctv.html` đã có nội dung) chỉ là placeholder, chưa có nội dung.
- ❌ Chưa kết nối Firebase, chưa xử lý thanh toán thật — nút "Tôi đã chuyển khoản" ở trang thanh toán và "Đăng ký" ở trang CTV mới chỉ là UI (toast xác nhận / không submit thật).
- ❌ Chưa có trang admin, chưa có trang CTV (trang quản lý CTV thật — khác với trang giới thiệu chương trình `kiem-tien-ctv.html` đã làm).
- ❌ Chưa deploy Vercel (dự kiến chưa dùng ở giai đoạn này).
- ❌ `products/swiftplanner-wedding.html` chưa tồn tại — nhưng từ vòng 24, link "SwiftPlanner Wedding" (thẻ sản phẩm + footer) đã trỏ tới `thanh-toan.html?slug=swiftplanner-wedding` (không phụ thuộc trang chi tiết sản phẩm) nên KHÔNG còn bị 404 nữa. Vẫn cần tạo trang chi tiết này khi click vào ảnh/tên sản phẩm (khác với nút "Mua ngay").

## Việc cần làm tiếp theo (gợi ý cho phiên sau)

1. Viết nội dung thật cho từng sản phẩm (mô tả, tính năng, FAQ đầy đủ) — khác với nội dung footer đã xong ở vòng 23.
2. Nhân bản `products/swiftcopy-drive.html` cho các sản phẩm còn lại trong `data/products.js` (ưu tiên `swiftplanner-wedding.html` vì click vào ảnh/tên sản phẩm vẫn cần trang chi tiết, dù nút "Mua ngay" đã không còn phụ thuộc trang này từ vòng 24).
3. Nối luồng thanh toán thật: nút "Tôi đã chuyển khoản" ở `thanh-toan.html` và form "Đăng ký" ở trang CTV hiện chưa gửi dữ liệu đi đâu — cần backend (Firebase) để lưu đơn hàng/đăng ký CTV thật.
4. Viết nội dung thật cho trang "Khuyến mãi" và "Kiếm Tiền" (2 trang placeholder ở nav).
5. Kết nối Firebase Firestore để lưu đơn hàng.
6. Xây trang admin duyệt đơn + gửi email giao file, và trang quản lý CTV thật (khác với trang giới thiệu chương trình đã có).
7. Nếu khách xác nhận nội dung 6 trang footer cần khớp chính xác 100% với file Word gốc, xin lại bản gốc để đối chiếu (file txt hiện tại bị lỗi font mất một phần dấu, đã khôi phục theo ngữ cảnh chứ không phải chép nguyên văn chắc chắn tuyệt đối).
