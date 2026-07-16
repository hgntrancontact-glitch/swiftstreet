# Test lặp 50-100 lần Drive API/Apps Script API (Phần 6.3) — hướng dẫn tự làm

**Vì sao cần**: Google KHÔNG công bố rõ hạn mức/ngày cho việc "copy file lặp lại nhiều lần
trong thời gian ngắn" — cần tự kiểm tra trước khi có khách thật dùng đồng loạt, tránh vừa
khai trương đã bị Google tạm khoá vì vượt hạn mức không biết trước. Việc này **không phụ
thuộc "cửa sau" ở file `06-tu-dong-hoa-gas-de-xuat.md`** — làm ngay được, độc lập.

## Chuẩn bị

1. Dùng **1 tài khoản Google PHỤ** (không phải tài khoản chính bạn đang bán hàng) — để nếu
   có bị Google tạm giới hạn, không ảnh hưởng tài khoản đang vận hành thật.
2. Tự làm 1 bản copy gas-dashboard bằng tài khoản phụ này (đúng quy trình khách hàng thật sẽ
   trải qua): mở Drive, "Tạo bản sao" cả thư mục gas-dashboard.
3. Chuẩn bị sẵn 1 file nhỏ bất kỳ (vd 1 ảnh nhỏ) và 1 thư mục đích trong Drive của tài khoản
   phụ này — để dùng làm "vật thử" copy đi copy lại, không đụng dữ liệu thật.

## Cách test — tận dụng hàm `dsTestCopy()` ĐÃ CÓ SẴN trong Code.gs

`gas-dashboard/Code.gs` dòng 271 đã có sẵn hàm `dsTestCopy(fileId, name, destId)` — tự copy
1 file rồi XOÁ NGAY (round-trip, không để lại rác), trả về `null` nếu thành công hoặc 1
chuỗi mô tả lỗi nếu thất bại. Đây chính xác là công cụ cần dùng để test lặp.

**Các bước:**
1. Mở bản copy gas-dashboard (tài khoản phụ) → menu Extensions → Apps Script.
2. Trong Script Editor, tạo 1 hàm MỚI tạm thời (chỉ dùng để test, xoá sau khi xong — KHÔNG
   để lẫn vào code thật):

```js
function TAM_testLap50Lan() {
  var fileIdThuNghiem = "DÁN_ID_FILE_NHỎ_DÙNG_ĐỂ_THỬ_VÀO_ĐÂY";
  var destIdThuNghiem = "DÁN_ID_THƯ_MỤC_ĐÍCH_VÀO_ĐÂY";
  var soLan = 50; // tăng lên 100 nếu 50 lần đầu chạy êm
  var thanhCong = 0, thatBai = 0;
  var log = [];

  for (var i = 0; i < soLan; i++) {
    var batDau = new Date().getTime();
    var loi = dsTestCopy(fileIdThuNghiem, "test" + i, destIdThuNghiem);
    var thoiGian = new Date().getTime() - batDau;
    if (loi === null) {
      thanhCong++;
      log.push("Lần " + i + ": OK (" + thoiGian + "ms)");
    } else {
      thatBai++;
      log.push("Lần " + i + ": LỖI — " + loi + " (" + thoiGian + "ms)");
    }
    Utilities.sleep(300); // nghỉ 0.3s giữa mỗi lần, tránh dồn dập quá mức cần thiết
  }

  Logger.log("KẾT QUẢ: " + thanhCong + " thành công / " + thatBai + " thất bại trên " + soLan + " lần.");
  Logger.log(log.join("\n"));
}
```

3. Cách lấy `fileIdThuNghiem`/`destIdThuNghiem`: mở file/thư mục trên Drive, copy đoạn ID
   trong URL (vd `drive.google.com/file/d/`**`ĐOẠN_NÀY_LÀ_ID`**`/view`).
4. Chọn hàm `TAM_testLap50Lan` trong dropdown trên cùng Script Editor → bấm ▶ (Run).
5. Lần đầu chạy sẽ hỏi cấp quyền — bấm "Review permissions" → chọn đúng tài khoản phụ →
   "Advanced" → "Go to [tên project] (unsafe)" → "Allow" (bình thường, vì đây là script
   riêng tư của bạn, Google chỉ chưa "xác minh" công khai).
6. Xem kết quả: menu **View → Executions** (hoặc **View → Logs**) để đọc `Logger.log()` in
   ra — đếm số lần "LỖI" và đọc đúng nội dung lỗi.

## Cách đọc kết quả

- **Toàn bộ "OK"**: tốt, tăng `soLan` lên 100 rồi chạy lại 1 lần nữa để chắc chắn hơn.
- **Bắt đầu có "LỖI — Hết hạn mức tạm thời (rate limit)"** ở lần thứ N: đây chính là con số
  cần biết — ghi lại N, và cân nhắc thêm cơ chế "xếp hàng" (không xử lý quá N đơn cùng lúc)
  cho luồng tự động sau này nếu N quá thấp so với kỳ vọng lượng khách.
- **Lỗi khác (403 "Không có quyền copy", 404...)**: kiểm tra lại `fileIdThuNghiem`/
  `destIdThuNghiem` có đúng không, không phải lỗi hạn mức.

## Lưu ý

- Có thể cần thử lại vào NGÀY KHÁC nếu chạm hạn mức — 1 số hạn mức Google reset theo ngày
  (giờ Thái Bình Dương, tức khoảng 14-15h chiều giờ Việt Nam).
- Xoá hàm `TAM_testLap50Lan` khỏi Code.gs sau khi test xong, không để lẫn vào bản phát hành
  cho khách.
- Việc test này CHỈ đo hạn mức Drive API (copy file) — chưa đo hạn mức Apps Script API (sửa
  code/deploy, dùng cho "cửa sau" ở file `06-tu-dong-hoa-gas-de-xuat.md`) vì thao tác đó
  chưa có hàm sẵn để test tương tự — sẽ bổ sung cách test riêng khi cửa sau đã có code thật.
