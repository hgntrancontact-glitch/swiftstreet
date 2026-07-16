# Project A (công khai) — Schema Firestore

Project A chứa dữ liệu KHÔNG nhạy cảm, ai cũng xem được trên web công khai: sản phẩm,
thông báo chuông, đánh giá, banner khuyến mãi, nội dung modal Hỗ trợ/FAQ rút gọn.

## Collection `san_pham/{slug}`

`{slug}` = ID document, dùng đúng chuỗi slug hiện có (`swiftcopy-drive`,
`swift-wedding-planner`...) để không phải đổi link đang tồn tại.

```js
{
  ten: "SwiftCopy.Drive",
  mo_ta_ngan: "Công cụ sao chép Google Drive & tải về máy tính tốc độ nhanh chóng",
  gia_goc: 620000,              // number, KHÔNG còn string "620.000đ" — % tự tính từ 2 số
  gia_ban: 490000,
  ghi_chu_gia: "tuỳ gói",        // "tuỳ gói" / "sắp ra mắt" / "" (trống = hiện giá bình thường)
  nhan_danh_muc: "Web App Script", // tự thêm loại mới thoải mái, không giới hạn cứng
  vi_tri: 10,                    // thứ tự trong lưới — cách quãng 10 để chèn giữa không phải renumber hết
  loai_dashboard: "drive",        // map sang renderDashboard() trong main.js — mini-dashboard MỚI vẫn cần code
  badge_trang_thai: {             // null nếu không có nhãn nào
    nhan: "Bán chạy",
    mau_bat_dau: "#e8432b",
    mau_ket_thuc: "#feb20a"
  },
  anh: [
    { url: "https://...", thu_tu: 1 },
    { url: "https://...", thu_tu: 2 }
  ],
  video_youtube_url: "https://www.youtube.com/embed/...",
  mo_ta_dai: "## Giới thiệu\n...(markdown)...",
  lich_su_cap_nhat: [
    { ngay: <timestamp>, noi_dung: "Thêm tính năng X" }
  ],
  cau_hoi_thuong_gap: [
    { cau_hoi: "...", tra_loi: "..." }
  ],
  goi_gia: [                      // TỐI ĐA 3 phần tử, cấu trúc GIỐNG NHAU cho mọi sản phẩm
    {
      id: "basic",
      ten_goi: "BASIC",
      gia: 490000,
      gia_goc: 620000,
      mo_ta: "Sao chép dữ liệu Google Drive",
      tinh_nang: [
        "Sao chép Google Drive không giới hạn dung lượng (Gb)",
        { text: "Không hỗ trợ tải Drive về máy tính cá nhân", negative: true }
      ],
      an: false,
      // CHỈ điền nếu gói này cần chế độ Nhóm + slider số thành viên (hiện chỉ SwiftCopy.Drive) —
      // để trống/bỏ field này với mọi gói khác, code tự hiểu là "giá tĩnh, không có slider".
      nhom_slider: {
        gia_min: 1998000, gia_max: 3996888,
        so_nguoi_min: 5, so_nguoi_max: 10
      }
    }
  ]
}
```

**Vì sao gộp `goi_gia`/`nhom_slider` chung 1 document sản phẩm** (quyết định cho Phần 9 —
bảng tính năng Basic/Premium × Cá nhân/Nhóm): dữ liệu này gắn chặt với 1 sản phẩm cụ thể
(SwiftCopy.Drive), không phải cấu hình chung toàn site — để trong `san_pham/swiftcopy-drive`
thay vì tách riêng 1 collection cấu hình, sửa giá/tính năng của sản phẩm nào chỉ cần mở
đúng 1 document của sản phẩm đó.

## Collection `thong_bao/{autoId}`

```js
{
  tieu_de: "Giảm 20% toàn bộ sản phẩm — chỉ đến 30/07/2026",
  ngay_tao: <timestamp>,
  hien: true
}
```
Web tự sắp theo `ngay_tao` giảm dần, lấy tối đa ~10 cái mới nhất. Thêm/xoá 1 document =
chuông tự động cập nhật, không đụng code.

## Collection `danh_gia/{autoId}`

```js
{
  email_che: "tr********ork@gmail.com",
  so_sao: 5,
  noi_dung: "Dùng SwiftCopy.Drive sao chép hồ sơ khách hàng nhanh gấp nhiều lần...",
  ngay_tao: <timestamp>
}
```

## Document đơn (singleton) `cau_hinh/hero_banner`

```js
{
  hien: true,
  dong_1: "Giảm ngay 20% cho tất cả sản phẩm",
  dong_2: "Chỉ đến ngày 30/07/2026",
  ma_code: "SSGIFT28"
}
```

## Document đơn `cau_hinh/ho_tro`

```js
{
  email: "hgntran.contact@gmail.com",
  faq_rut_gon: [
    { cau_hoi: "Mua một lần thì dùng được trong bao lâu?", tra_loi: "..." }
  ]
}
```

## Rules

Xem file [`project-a.rules`](project-a.rules) — nguyên tắc chung: **ai cũng ĐỌC được mọi
collection ở đây, KHÔNG ai ghi được từ trình duyệt** (ghi chỉ qua Firebase Console tay, hoặc
qua dashboard Khu C sau khi đã xác thực admin — xem Phần 4/5).
