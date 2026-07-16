# Bước 4 — VietQR (tạo mã QR chuyển khoản có sẵn số tiền + nội dung)

## Tin tốt: có 1 cách dùng NGAY, không cần đăng ký gì

VietQR có sẵn 1 dịch vụ ẢNH QR CÔNG KHAI, miễn phí, không cần tài khoản, dùng được ngay lập
tức bằng cách ghép URL — code sẽ dùng cách này để KHÔNG bị chặn tiến độ vì bạn chưa đăng ký
`my.vietqr.io`. Cú pháp:

```
https://img.vietqr.io/image/<BANK_BIN>-<SO_TAI_KHOAN>-<MAU>.png?amount=<SO_TIEN>&addInfo=<NOI_DUNG_CK>&accountName=<TEN_CHU_TK>
```

Ví dụ thật (Vietcombank, số tài khoản giả định `0071000123456`, chuyển 490.000đ, nội dung
`SS12345`):
```
https://img.vietqr.io/image/970436-0071000123456-compact2.png?amount=490000&addInfo=SS12345&accountName=CTY%20SWIFTSTREET
```
Mở thử link này trên trình duyệt sẽ thấy ảnh QR thật, quét bằng app ngân hàng bất kỳ sẽ tự
điền sẵn đúng số tiền + nội dung — khách không cần tự gõ tay.

## Thông tin bạn cần cung cấp

| Placeholder trong code | Là gì | Lấy ở đâu |
|---|---|---|
| `BANK_BIN` | Mã ngân hàng (6 số) | Tra tại https://api.vietqr.io/v2/banks (danh sách công khai) — tìm đúng tên ngân hàng của bạn, lấy cột `bin`. Ví dụ: Vietcombank=970436, Techcombank=970407, MB Bank=970422, ACB=970416... |
| `BANK_ACCOUNT_NUMBER` | Số tài khoản ngân hàng thật của bạn/công ty | Tài khoản bạn dùng nhận tiền |
| `BANK_ACCOUNT_NAME` | Tên chủ tài khoản (in hoa, không dấu, đúng như ngân hàng cấp) | Ghi trên thẻ/sổ tài khoản |
| `MAU` (template) | Kiểu hiển thị ảnh QR | Có sẵn vài mẫu: `compact2` (chỉ QR, gọn — khuyên dùng), `compact`, `qr_only`, `print` — không cần đăng ký, chọn tự do |

**Việc bạn cần làm ngay**: gửi lại 3 giá trị `BANK_BIN`/`BANK_ACCOUNT_NUMBER`/
`BANK_ACCOUNT_NAME` thật cho tôi (hoặc tự sửa trực tiếp vào đúng dòng placeholder tôi để
sẵn trong code, tìm dòng có chữ `ĐIỀN_SỐ_TK_CỦA_BẠN_VÀO_ĐÂY`).

## Khi nào cần đăng ký tài khoản `my.vietqr.io` chính thức (không bắt buộc ngay)

Endpoint ảnh công khai ở trên đủ dùng để khai trương đúng hạn. Đăng ký tài khoản chính thức
tại https://my.vietqr.io chỉ cần thiết nếu về sau bạn muốn:
- Đối chiếu tự động biến động số dư (webhook báo "đã nhận tiền") thay vì admin tự nhìn app
  ngân hàng — tính năng này thường yêu cầu gói trả phí/liên kết ngân hàng qua cổng thanh
  toán, KHÔNG nằm trong phạm vi đợt này (đợt này admin vẫn tự kiểm tra ngân hàng bằng mắt).
- Có SLA/độ ổn định cao hơn cho ảnh QR ở quy mô lớn.

Nếu muốn đăng ký ngay: vào https://my.vietqr.io, bấm Đăng ký, làm theo hướng dẫn xác minh
doanh nghiệp/cá nhân của họ (cần thông tin ngân hàng tương tự bảng trên). Không cần làm gấp
cho ngày khai trương.
