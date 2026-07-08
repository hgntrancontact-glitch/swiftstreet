# SwiftStreet

## Mô hình kinh doanh

SwiftStreet là 1 "store" bán nhiều sản phẩm số nhỏ, độc lập với nhau (ví dụ: SwiftCopy.Drive — công cụ sao chép Google Drive; SwiftPlanner Wedding — file kế hoạch cưới; các file Google Sheets khác...).

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
index.html                     Trang chủ
products/swiftcopy-drive.html  Trang chi tiết sản phẩm (mẫu — nhân bản file này cho sản phẩm khác)
css/style.css                  Toàn bộ style + biến màu (:root) + responsive
js/main.js                     Render lưới sản phẩm + xử lý menu mobile
data/products.js               Danh sách sản phẩm (PRODUCTS)
assets/icons/                  favicon.ico, favicon-32x32.png, apple-touch-icon.png
assets/img/                    logo-header.png (nền trong suốt), logo-trimmed.png (bản gốc đã cắt viền)
```

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

- ✅ Đã dựng xong khung giao diện: trang chủ (`index.html`) và 1 trang chi tiết sản phẩm mẫu (`products/swiftcopy-drive.html`).
- ✅ Logo đã xử lý thành favicon + apple-touch-icon + logo header (nền trong suốt).
- ✅ Đã kiểm tra responsive cơ bản (mobile + desktop).
- ❌ Chưa có nội dung chi tiết thật (mô tả sản phẩm, FAQ, tính năng... hiện đang là placeholder).
- ❌ Chưa kết nối Firebase, chưa xử lý thanh toán thật.
- ❌ Chưa có trang admin, chưa có trang CTV.
- ❌ Chưa deploy Vercel (dự kiến chưa dùng ở giai đoạn này).

## Việc cần làm tiếp theo (gợi ý cho phiên sau)

1. Viết nội dung thật cho từng sản phẩm (mô tả, tính năng, FAQ đầy đủ).
2. Nhân bản `products/swiftcopy-drive.html` cho các sản phẩm còn lại trong `data/products.js`.
3. Thiết kế trang giỏ hàng / trang thanh toán (hiện chưa có).
4. Kết nối Firebase Firestore để lưu đơn hàng.
5. Xây trang admin duyệt đơn + gửi email giao file.
