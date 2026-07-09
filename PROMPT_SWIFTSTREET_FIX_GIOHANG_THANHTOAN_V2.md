# Prompt cho Claude Code — SwiftStreet: Fix giỏ hàng, thanh toán, footer, đánh giá

Đọc file `CLAUDE.md` trong dự án trước khi bắt đầu.

## A. Giỏ hàng

1. Khi bấm "Thêm giỏ hàng" ở bất kỳ đâu (landing page, trang sản phẩm): **không hiện modal to giữa màn hình** như hiện tại. Thay bằng 1 bảng nhỏ trượt từ mép trái màn hình chạy vào, giữ khoảng 2 giây rồi tự ẩn đi — tạo cảm giác xác nhận "đã thêm vào giỏ" mà không làm gián đoạn thao tác xem hàng.
2. Khi bấm cùng 1 sản phẩm "Thêm giỏ hàng" lần thứ 2 trở đi: **không được nhân đôi/nhân ba số lượng trong giỏ**. Thay vào đó hiện thông báo dạng bảng nhỏ tương tự mục 1, nội dung: "Sản phẩm này đã có trong giỏ hàng". Mỗi sản phẩm trong giỏ luôn chỉ có đúng 1 dòng duy nhất, không hiển thị dạng nhân số lượng (ví dụ không hiển thị "x2").
3. Khi bấm icon giỏ hàng ở header: **mở thẳng trang thanh toán nhiều sản phẩm** (chính là màn hình mô tả ở mục D bên dưới), không cần modal xem trước giỏ hàng riêng nữa — gộp làm một.

## B. Trang "Khuyến mãi" / "Kiếm Tiền" đang trống nội dung

Hiện đang có khoảng trắng rất lớn giữa nội dung placeholder ("Nội dung đang được cập nhật") và footer. Bỏ khoảng trắng thừa này — nội dung kết thúc thì footer nối liền ngay sau, không để trang co giãn theo chiều cao cố định gây khoảng trống.

## C. Thiết kế lại toàn bộ màn hình "Hoàn tất đơn hàng" (áp dụng cho cả mua 1 sản phẩm và mua nhiều sản phẩm từ giỏ hàng)

Đây là phần quan trọng nhất cần sửa. Yêu cầu tổng quát: **gọn trong đúng 1 màn hình, không cuộn dọc**, tự co giãn theo kích thước màn hình desktop lẫn mobile — tham khảo đúng tỉ lệ gọn của trang thanh toán ChatGPT (ảnh đã gửi ở lượt trao đổi trước).

Chi tiết cần sửa:

1. **Bỏ khoảng trống thừa** ngay dưới dòng breadcrumb "Trang chủ / Thanh toán" — hiện đang có 1 khoảng trắng lớn không cần thiết gây cuộn trang.
2. **Bỏ hẳn badge màu vàng "THANH TOÁN"** phía trên tiêu đề "Hoàn tất đơn hàng" — chỉ giữ lại tiêu đề, không cần badge này.
3. Breadcrumb **"Trang chủ / Thanh toán"** phải luôn hiển thị, bất kể người dùng vào màn hình này từ đâu (mua ngay 1 sản phẩm, hay từ giỏ hàng nhiều sản phẩm).
4. **Đổi nền toàn bộ khối "Quét mã để thanh toán" từ nền đen sang nền trắng** (hoặc xám rất nhạt `var(--surface-1)`) — hiện đang dùng nền đen trông nặng nề, không hợp với phần còn lại của trang.
5. **Bỏ chữ "Quét mã để thanh toán" bị lặp lại 2 lần** (hiện có cả ở tiêu đề khối và bên trong khối chứa QR) — chỉ giữ đúng 1 lần.
6. **Mã QR chỉnh về kích thước vừa phải**, không chiếm quá nhiều diện tích như hiện tại.
7. **Nút "Tôi đã chuyển khoản" thu gọn lại** — hiện đang kéo dài thành hình chữ nhật dẹt mảnh trông xấu, đổi thành nút có tỉ lệ cân đối, chiều cao và bo góc hợp lý hơn.
8. **Các ô nhập liệu (input)** hiện đang kéo dài hết chiều ngang cột một cách không cần thiết — thu gọn lại độ rộng hợp lý, không dài quá mức nội dung cần nhập. Mỗi ô có nhãn (label) riêng phía trên và placeholder mẫu, cụ thể:
   - Nhãn "Họ tên", placeholder "Nguyễn Văn A"
   - Nhãn "Số điện thoại / Zalo", placeholder "09xx xxx xxx"
   - Nhãn "Email nhận file", placeholder "your@gmail.com"
9. Mỗi dòng sản phẩm trong danh sách đơn hàng hiển thị: tên sản phẩm, giá bán hiện tại, và **ngay bên dưới giá bán là giá gốc gạch ngang** (nếu sản phẩm có giảm giá) — hiện tại phần giá gốc gạch ngang đang bị thiếu, cần bổ sung lại.
10. **Tách riêng 2 khối thông tin** thay vì gộp chung như hiện tại:
    - Khối **"Thông tin đơn hàng"**: gồm các dòng theo thứ tự:
      - Tổng tiền (tổng giá gốc của các sản phẩm trong đơn)
      - Tổng khuyến mãi (tổng phần chênh lệch giữa giá gốc và giá bán của các sản phẩm — ví dụ 1 sản phẩm giá gốc 400.000đ bán 360.000đ thì phần khuyến mãi của riêng sản phẩm đó là 40.000đ, cộng dồn tất cả sản phẩm trong đơn lại; số này luôn nhỏ hơn Tổng tiền)
      - Voucher: có mũi tên chevron (▾) bên phải chữ "Voucher" — bấm vào chevron sẽ mở ra 1 ô nhập mã voucher dạng text ngay bên dưới (chưa cần xử lý logic áp mã thật, chỉ cần hiện ô nhập trước, xử lý sau)
      - Dòng tổng "Cần thanh toán": số tiền hiển thị **màu nổi bật (dùng màu vàng cam thương hiệu), đậm hơn các dòng khác** để dễ nhìn thấy ngay
    - Khối **"Thông tin chuyển khoản"** (tách biệt, đặt sau khối trên): mã QR + Ngân hàng, Chủ tài khoản, Số tài khoản, Nội dung chuyển khoản. Không lặp lại số tiền ở khối này vì đã có ở dòng "Cần thanh toán" phía trên.
11. **Đoạn ghi chú cuối cùng** dưới nút "Tôi đã chuyển khoản", giữ đúng nguyên văn sau, không tự diễn đạt lại (gạch chân các cụm từ được đánh dấu, giống cách ChatGPT trình bày điều khoản ở cuối trang thanh toán của họ):

    "Sau khi thanh toán, chúng tôi sẽ gửi thông tin đơn hàng qua email trong thời gian sớm nhất. Vui lòng kiểm tra cả hộp thư rác nếu không thấy thư. Khi thanh toán, bạn đồng ý với <u>Điều khoản sử dụng</u>, <u>Khuyến mãi</u> và <u>Chính sách đổi trả dịch vụ</u>, và cho phép Swiftstreet lưu trữ và tính phí phương thức thanh toán của bạn."

    Căn chỉnh đoạn này đều, không bị thụt lề lệch so với khối phía trên nó.
12. Nếu người dùng bấm vào tên 1 sản phẩm trong danh sách đơn hàng (ví dụ "SwiftCopy.Drive"), chuyển sang trang chi tiết sản phẩm đó. Hiện tại chỉ `products/swiftcopy-drive.html` đã có thật — áp dụng link này trước, các sản phẩm khác để placeholder chờ sau.

## D. Riêng màn hình thanh toán nhiều sản phẩm (từ giỏ hàng)

Bổ sung thêm các phần sau, tham khảo bố cục danh sách sản phẩm có ô tích chọn kiểu các sàn thương mại điện tử phổ biến:

- 1 ô "Chọn tất cả" phía trên danh sách sản phẩm.
- Mỗi dòng sản phẩm có ô tích (checkbox) riêng.
- Mỗi sản phẩm gói gọn trong 1 khung: tên sản phẩm phía trên, mô tả ngắn (nếu có) ngay dưới.
- Giá: dòng giá đang bán hiển thị màu như hiện tại (nổi bật), dòng nhỏ hơn bên dưới hiển thị giá gốc gạch ngang.
- Icon xoá sản phẩm ở mỗi dòng.
- Danh sách hiển thị tối đa 5 sản phẩm cùng lúc, nếu nhiều hơn thì có thanh cuộn riêng cho danh sách này (không cuộn cả trang).
- Áp dụng đầy đủ toàn bộ các điểm sửa ở mục C (giá gạch ngang, khối thông tin đơn hàng tách riêng, voucher, ghi chú cuối trang...) cho màn hình này.

## E. Footer — hành vi link sản phẩm (cập nhật, thay thế yêu cầu trước đó)

**Đây là bản cập nhật mới nhất, ưu tiên áp dụng thay cho hướng dẫn trước:** link "SwiftCopy.Drive" và các sản phẩm khác dưới footer bấm vào phải dẫn tới **trang chi tiết sản phẩm** (ví dụ `products/swiftcopy-drive.html`), **không phải** dẫn thẳng tới trang thanh toán như đã yêu cầu ở prompt trước. Hiện tại chỉ SwiftCopy.Drive có trang thật, áp dụng trước cho link này, các sản phẩm khác giữ nguyên/chờ.

## F. Modal "Đánh giá Swiftstreet"

Khi bấm nút "★ Đánh giá Swiftstreet", hiện 1 modal gồm:

- Danh sách 10 đánh giá giả lập, mỗi đánh giá gồm: địa chỉ email được che một phần (ví dụ `tr********work@gmail.com`), số sao (dùng ký hiệu ★), và 1 câu nhận xét ngắn liên quan đến trải nghiệm sử dụng sản phẩm. Số sao phân bố thực tế, xen kẽ giữa 4 và 5 sao — không để toàn bộ là 5 sao.
- Chỉ hiện 4 đánh giá trong khung nhìn thấy cùng lúc, có thanh cuộn dọc để xem hết 10 đánh giá.
- Bên dưới danh sách, có khu vực "Để lại đánh giá của bạn" với 5 icon sao có thể bấm chọn.
- Khi người dùng bấm vào bất kỳ sao nào (từ 1 đến 5 sao), hiện thêm: nhãn "Nội dung ý kiến phản hồi" và 1 ô nhập text với placeholder "Nhập trải nghiệm thực tế của bạn tại đây...".
- 2 nút bên dưới: "Không phải bây giờ" (nền xám nhạt, chữ tối) và "Gửi đánh giá" (nền **vàng cam thương hiệu** `#FFB020`, không phải màu xanh). **2 nút này đẩy về sát bên phải khung**, chừa khoảng trống trắng bên trái chiếm khoảng 40% chiều ngang — không kéo giãn 2 nút full chiều ngang.

## Lưu ý chung

- Giữ đúng bộ màu thương hiệu đã thống nhất (trắng/đen/vàng cam `#FFB020`) cho mọi nút chính và số tiền nổi bật, không tự đổi sang màu khác (kể cả xanh dương mặc định của một số thư viện UI).
- Nếu điểm nào chưa rõ, hỏi lại tôi trước khi tự quyết định.

## Báo cáo

Sau khi hoàn thành, báo cáo ngắn gọn theo đúng thứ tự các mục A đến F ở trên, mục nào xong, mục nào còn vướng — dùng ngôn ngữ đơn giản, không thuật ngữ kỹ thuật.

Sau khi tôi xác nhận ổn, cập nhật lại `CLAUDE.md` phản ánh đúng trạng thái mới nhất, rồi commit và push toàn bộ thay đổi lên GitHub.

---

## Danh sách để tôi tự kiểm tra (thuật ngữ đơn giản)

- [ ] Thêm giỏ hàng: hiện bảng nhỏ trượt từ trái, tự biến mất sau 2 giây, không hiện bảng to giữa màn hình.
- [ ] Thêm cùng 1 món 2 lần: báo "đã có trong giỏ", không bị nhân đôi, không hiện "x2".
- [ ] Bấm icon giỏ hàng: vào thẳng trang thanh toán, không hiện bảng xem trước riêng.
- [ ] Trang Khuyến mãi/Kiếm Tiền: không còn khoảng trắng to trước footer.
- [ ] Trang thanh toán (1 hoặc nhiều sản phẩm): nhìn gọn trong 1 màn hình, không phải cuộn xuống mới thấy hết.
- [ ] Không còn thấy badge vàng "THANH TOÁN" phía trên tiêu đề.
- [ ] Dòng "Trang chủ / Thanh toán" luôn hiện.
- [ ] Khối thanh toán nền trắng, không còn nền đen.
- [ ] Chữ "Quét mã để thanh toán" chỉ còn 1 lần, không bị lặp.
- [ ] Mã QR không quá to.
- [ ] Nút "Tôi đã chuyển khoản" trông cân đối, không dẹt dài.
- [ ] Mỗi sản phẩm trong đơn có giá gốc gạch ngang bên dưới giá bán.
- [ ] Có 2 khối tách riêng: 1 khối tổng tiền/khuyến mãi/voucher/cần thanh toán, 1 khối ngân hàng/QR.
- [ ] Voucher có mũi tên bấm ra ô nhập mã.
- [ ] Số tiền "Cần thanh toán" có màu vàng cam nổi bật, đậm hơn các dòng khác.
- [ ] Ghi chú cuối trang đúng câu đã chốt, có gạch chân vài cụm từ.
- [ ] Bấm tên sản phẩm SwiftCopy.Drive trong đơn hàng: vào đúng trang sản phẩm đó.
- [ ] Mua nhiều sản phẩm: có nút chọn tất cả, tích từng món, giá gạch ngang, icon xoá, tối đa 5 món rồi cuộn.
- [ ] Footer bấm "SwiftCopy.Drive": vào trang sản phẩm, không nhảy thẳng vào thanh toán.
- [ ] Bấm "Đánh giá Swiftstreet": hiện 10 đánh giá (không toàn 5 sao), xem 4 cái rồi cuộn, có ô để tự đánh giá.
- [ ] 2 nút trong khung đánh giá ("Không phải bây giờ" / "Gửi đánh giá") nằm dồn về bên phải, không kéo full chiều ngang.
