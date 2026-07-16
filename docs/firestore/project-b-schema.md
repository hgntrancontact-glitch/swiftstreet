# Project B (nhạy cảm) — Schema Firestore

Chứa voucher, CTV, khách hàng/đơn hàng — mọi ghi/đọc quan trọng đi qua Cloud Function, KHÔNG
cho phép client tự ghi trực tiếp các field có thể bị lợi dụng (số lần dùng voucher, số dư
hoa hồng CTV...).

## Collection `voucher/{ma_code}`

Dùng CHÍNH mã code làm ID document (vd `voucher/SSGIFT28`) — tra cứu bằng
`.doc(code).get()` thay vì query, vừa nhanh vừa không lộ danh sách toàn bộ mã ra client.

```js
{
  loai_ma: "le",              // "le" | "xa_hang" | "sinh_nhat" | "minigame" | "ctv"
  ctv_id: null,                // uid của CTV nếu mã gắn riêng 1 người, null nếu không
  kieu_giam: "phan_tram",      // "phan_tram" | "so_tien"
  gia_tri_giam: 20,            // 20 (%) hoặc số tiền cố định tuỳ kieu_giam
  ngay_bat_dau: <timestamp>,
  ngay_ket_thuc: <timestamp>,
  gioi_han_tong: null,         // null = không giới hạn; số = tổng số lần được dùng
  gioi_han_moi_khach: null,    // null = không giới hạn; số = số lần/1 khách (theo email)
  so_lan_da_dung: 0,           // CHỈ Cloud Function được tăng số này, client không ghi trực tiếp
  dang_hoat_dong: true
}
```

**Quy tắc dùng nhiều mã cùng lúc** (đã chốt): khách nhập 1-3 mã, MỖI mã hiển thị số tiền
giảm RIÊNG (không gộp %), tổng giảm = cộng dồn tất cả mã hợp lệ. Mã CTV dùng chung được với
mã khuyến mãi thường (không độc quyền). Việc kiểm tra hợp lệ + tính số tiền giảm của từng mã
nằm trong Cloud Function `kiemTraVoucher` (xem `cloud-functions-source/functions/index.js`).

## Collection `ctv/{uid}`

`{uid}` = Firebase Auth UID của chính CTV đó (Phương án B — xem `03b-ctv-auth-phuong-an-b.md`).

```js
{
  ma_ctv: "CTV001",
  ten: "Nguyễn Văn A",
  email: "...",
  trang_thai: "cho_duyet",      // "cho_duyet" | "hoat_dong" | "tam_ngung"
  hoa_hong_phan_tram: 10,        // % hoa hồng/đơn (đơn giản nhất — có thể đổi công thức sau)
  tong_don_gioi_thieu: 0,
  tong_hoa_hong: 0,
  da_tra: 0,
  ngay_dang_ky: <timestamp>
}
```

## Collection `don_hang/{ma_don_hang}`

`{ma_don_hang}` = mã "SS"+5 số (Phần 3), sinh DUY NHẤT 1 lần bởi Cloud Function lúc tạo đơn
(có kiểm tra trùng — xem hàm `taoDonHang`).

```js
{
  khach: { ten: "...", email: "...", sdt: "..." },
  san_pham: [ { slug: "swiftcopy-drive", ten_goi: "Basic", gia: 490000 } ],
  ma_voucher_da_dung: [                    // mỗi mã hiện RIÊNG trên hoá đơn, không gộp
    { ma: "SSGIFT28", giam: 20000 },
    { ma: "SALE10", giam: 15000 }
  ],
  tam_tinh: 490000,
  tong_giam: 35000,
  thanh_tien: 455000,
  trang_thai: "nhap",                      // "nhap" | "cho_duyet" | "da_duyet" | "da_huy" | "loi"
  // "nhap" = vừa tạo lúc khách VÀO trang thanh toán (chưa có khach/voucher) — mã đơn hàng đã
  // CỐ ĐỊNH từ bước này để khách ghi đúng nội dung chuyển khoản (không đổi khi tải lại
  // trang). "cho_duyet" = khách đã bấm "Thanh toán" (đã điền info + chọn voucher xong). Xem
  // 2 hàm `taoDonHangNhap()`/`xacNhanThanhToan()` trong cloud-functions-source/functions/index.js.
  trang_thai_cham_soc: "moi",              // "moi" | "da_lien_he" | "san_sang_nang_cap" | "khong_quan_tam"
  ma_ban_quyen: null,                      // set khi duyệt xong (khác mã đơn hàng, xem dưới)
  ctv_id: null,                            // ai được ghi công hoa hồng (link giới thiệu HOẶC mã CTV)
  admin_xu_ly: null,                       // tên admin đã bấm Duyệt/Từ chối (chống 2 admin cùng duyệt)
  ngay_tao: <timestamp>,
  ngay_duyet: null
}
```

## Collection CÔNG KHAI `tra_cuu_ban_quyen/{ma_ban_quyen}`

**Tách RIÊNG khỏi `don_hang`** — vì đây là collection duy nhất trong Project B cho phép ĐỌC
công khai không cần đăng nhập (phục vụ trang Check bản quyền), nên CHỈ chứa dữ liệu AN
TOÀN để hiện public, không phải toàn bộ đơn hàng (có email/SĐT thật):

```js
{
  ten_san_pham: "SwiftCopy.Drive — Basic",
  ngay_mua: <timestamp>,
  ten_khach_che: "Nguyễn V*** A",     // che 1 phần, không hiện đầy đủ
  ma_don_hang_lien_ket: "SS48219"     // để admin đối chiếu nội bộ nếu cần, không hiện ra UI
}
```

`ma_ban_quyen` là chuỗi DÀI, KHÓ ĐOÁN (vd UUID rút gọn ~12 ký tự), khác hẳn mã đơn hàng
ngắn (SS+5 số) — vì ai cũng gõ thử được ô tra cứu này, mã đơn hàng ngắn dễ đoán/dò hơn nhiều.

## Rules

Xem [`project-b.rules`](project-b.rules). Nguyên tắc:
- `voucher`: đọc CHỈ theo đúng field cụ thể qua Cloud Function (không cho client đọc thẳng —
  tránh lộ danh sách mã); ghi luôn `false` từ client.
- `ctv/{uid}`: đọc CHỈ đúng chủ (`request.auth.uid == uid`), ghi `false` (mọi thay đổi qua
  Cloud Function).
- `don_hang`: cho phép `create` (khách thanh toán ẩn danh tạo đơn — nhưng thực tế đơn hàng
  cũng nên tạo qua Cloud Function để đảm bảo sinh mã đúng/kiểm tra trùng, xem ghi chú trong
  file rules), không cho `read/update/delete` từ client công khai.
- `tra_cuu_ban_quyen`: đọc công khai (`allow read: if true`), ghi `false`.
