# Prompt cho Claude Code — SwiftStreet: Footer, dropdown hỗ trợ, thông báo, giỏ hàng, luồng thanh toán

Đọc file `CLAUDE.md` trong dự án trước khi bắt đầu, để nắm đúng mạch các quyết định đã chốt trước đó.

## A. Trang nội dung footer

Tôi đã để sẵn file `Swiftstreet_NoiDung_Footer.txt` trong dự án (chuyển từ Word sang txt), bên trong chứa nội dung của 6 mục theo thứ tự:
1. Về chúng tôi
2. Câu hỏi thường gặp (áp dụng cho toàn bộ website, khác với FAQ riêng từng sản phẩm)
3. Hướng dẫn mua hàng
4. Điều khoản sử dụng
5. Chính sách đổi trả
6. Kiếm tiền CTV

Nhiệm vụ:
- Đọc file này, tách đúng 6 mục theo tiêu đề có sẵn trong file.
- Tạo 1 **thư mục mới riêng** (ví dụ `footer-pages`) chứa 6 file HTML — mỗi mục 1 file riêng biệt. **Không gộp nội dung vào `index.html` hay bất kỳ file hiện có nào khác** — làm vậy sẽ phình số dòng code không cần thiết. Footer chỉ cần trỏ link tới các file HTML riêng trong thư mục này.
- **Thiết kế lại trình bày như một trang nội dung/văn bản đẹp** (có tiêu đề, các đoạn/mục rõ ràng, khoảng cách hợp lý, đúng font và màu thương hiệu đã dùng cho toàn site) — không dán nguyên văn bản thô lên trang.
- Riêng trang "Kiếm tiền CTV", cuối trang có sẵn phần thông tin đăng ký nhanh (họ tên, SĐT/Zalo, email, biết đến từ đâu) trong nội dung — dựng thành 1 form đăng ký thật trên giao diện (chưa cần backend xử lý, chỉ cần giao diện).

## B. Hành vi các link trong footer

- Link **SwiftCopy.Drive** và **SwiftPlanner Wedding** (cột Sản phẩm): bấm vào có hành vi **tương đương với nút "Mua ngay"** của đúng sản phẩm đó — chuyển thẳng vào luồng mua sản phẩm đó, không phải trang mô tả sản phẩm.
- Link **"Nhiều sản phẩm khác..."**: bấm vào có hành vi **tương đương với việc bấm mục "Sản phẩm"** trên menu header — hiển thị toàn bộ danh sách sản phẩm.

## C. Style dòng "Quét mã Zalo kết nối"

Chữ này hiện đang cùng cấp với các dòng khác trong cột Liên hệ (email, các link...). Đổi thành: **đậm hơn, màu trắng sáng hơn** một chút so với các dòng anh em cùng cột — nhưng **không được to/đậm bằng các tiêu đề cột** (Giới thiệu, Sản phẩm, Hỗ trợ, Liên hệ). Giữ nguyên cỡ chữ (font-size), chỉ đổi độ đậm (font-weight) và độ sáng màu.

## D. Dropdown khi nhấn icon Hỗ trợ nổi (góc dưới phải)

Dropdown hiện có đúng 3 mục: **Hỗ trợ / FAQ / Báo lỗi**. Hành vi từng mục:

- **Hỗ trợ**: hiện 1 modal ở giữa màn hình, nền phía sau làm mờ, nội dung gồm: tiêu đề "Thông tin hỗ trợ kỹ thuật", 1 dòng mô tả ngắn, email liên hệ, mã QR Zalo (dùng file QR đã có sẵn trong thư mục dự án), nút "Đóng".
- **FAQ**: hiện 1 modal ở giữa màn hình, nền phía sau làm mờ, dạng danh sách câu hỏi có thể mở/đóng (accordion) — nội dung là bản **tóm tắt/rút gọn** của trang "Câu hỏi thường gặp" (mục A.2), khoảng 5 câu hỏi tiêu biểu nhất, có mũi tên chevron để mở rộng từng câu. Đây là bản modal condensed — còn link "Câu hỏi thường gặp" ở footer vẫn dẫn tới trang đầy đủ riêng.
- **Báo lỗi**: bấm vào chỉ cần hiện 1 thông báo ngắn (toast hoặc modal nhỏ đơn giản): "Hiện tại chúng tôi chưa hỗ trợ tính năng này". Không cần xây thêm gì phức tạp cho mục này.

## E. Thông báo (icon chuông trên header)

Đổi từ kiểu modal giữa màn hình hiện tại sang **dạng dropdown neo ngay dưới icon chuông**, góc trên bên phải (không làm mờ nền, không chiếm giữa màn hình — giống kiểu dropdown thông báo phổ biến của các web khác).

Viết lại nội dung thành **5 thông báo mới**, xoay quanh các chủ đề: khuyến mãi đang diễn ra, sản phẩm/công cụ mới vừa ra mắt, tính năng mới trong 1 sản phẩm cụ thể nào đó. Tự soạn nội dung hợp lý, ngắn gọn, đúng giọng văn thương hiệu.

Khung hiển thị chỉ cao đủ cho **3 thông báo nhìn thấy cùng lúc**, có thanh cuộn dọc bên trong để xem hết 5 thông báo, không kéo giãn khung theo số lượng thông báo.

## F. Giỏ hàng — thiết kế lại theo phong cách TikTok Shop

Sửa lỗi hiện tại: nút "x" xoá từng sản phẩm trong giỏ đang không thao tác được — sửa lại cho hoạt động đúng. Nền mờ phía sau modal giỏ hàng cần đồng bộ với kiểu mờ đang dùng ở các modal khác (Hỗ trợ, FAQ).

Thiết kế lại toàn bộ modal giỏ hàng như sau:

- Tiêu đề modal: **"Giỏ hàng (X)"** căn giữa, X = tổng số sản phẩm đang có trong giỏ. Nút đóng (x) ở góc.
- Mỗi dòng sản phẩm: tên sản phẩm ở trên; bên dưới là ảnh sản phẩm (thu nhỏ) bên trái, bên phải ảnh là mô tả ngắn + dòng giá dạng nổi bật kiểu "flash sale" (giá hiện tại đậm, giá gốc gạch ngang bên cạnh, hiển thị số tiền được giảm, ví dụ: giá 300.000đ gạch ngang, giá bán 260.000đ, ghi "Giảm 40.000đ").
- Icon xoá nhỏ (dạng thùng rác hoặc dấu x) đặt gọn cạnh mỗi dòng sản phẩm để xoá nhanh.
- Bên phải ảnh sản phẩm có 1 nút tròn chọn (checkbox dạng tròn) — bấm vào để chọn/bỏ chọn sản phẩm đó cho việc thanh toán. Bấm lại lần nữa để bỏ chọn.
- Cuối danh sách có 1 nút tròn "Chọn tất cả".
- Số tiền tổng hiển thị gần nút thanh toán **chỉ tính theo các sản phẩm đang được chọn** (tick), không phải toàn bộ giỏ hàng.
- Chỗ TikTok Shop mặc định hiện chữ "Freeship", SwiftStreet thay bằng mặc định chữ **"Mua ngay"** trên nút thanh toán.

## G. Thiết lập luồng "Mua ngay" — thanh toán 1 sản phẩm và nhiều sản phẩm

Hiện tại nút "Mua ngay" (ở từng thẻ sản phẩm, trang chi tiết sản phẩm, và trong giỏ hàng) **chưa được gắn luồng thật**. Xây dựng như sau, dùng **chung 1 kiểu giao diện** cho cả 2 trường hợp — chỉ khác phần danh sách sản phẩm hiển thị:

**Trường hợp 1 — mua 1 sản phẩm cụ thể**: khi bấm "Mua ngay" ở 1 sản phẩm bất kỳ (không qua giỏ hàng), mở màn hình thanh toán chỉ hiển thị đúng 1 sản phẩm đó.

**Trường hợp 2 — mua nhiều sản phẩm từ giỏ hàng**: khi khách đã tick chọn nhiều sản phẩm trong giỏ hàng rồi bấm thanh toán, mở cùng màn hình thanh toán nhưng hiển thị danh sách tất cả sản phẩm đã được chọn.

### Thiết kế màn hình thanh toán (áp dụng cho cả 2 trường hợp trên)

Gộp chung "thông tin đơn hàng + form khách điền + QR chuyển khoản" trong **cùng 1 màn hình duy nhất** (không tách 2 bước riêng biệt như một số web khác). Bố cục 2 cột:

**Cột trái:**
- Danh sách sản phẩm trong đơn: mỗi dòng gồm ảnh nhỏ, tên sản phẩm, giá. Nếu là đơn nhiều sản phẩm, thêm icon "x" nhỏ cuối mỗi dòng để khách xoá bớt sản phẩm ngay tại đây nếu muốn, danh sách có thể cuộn nếu nhiều hơn khoảng 3 sản phẩm.
- Tiêu đề nhỏ: "Điền thông tin của bạn"
- 3 ô nhập: Họ tên, Số điện thoại / Zalo, Email nhận file
- Khung "Tổng cộng" hiển thị tổng số tiền tương ứng
- Đoạn ghi chú nhỏ ngay dưới, nguyên văn:

  "Vui lòng nhập chính xác email — đây là địa chỉ chúng tôi dùng để gửi thông tin đơn hàng ngay sau khi thanh toán thành công. Cần hỗ trợ trong quá trình mua hàng, hoặc muốn được tư vấn thanh toán trực tiếp, liên hệ SĐT/Zalo 0909 821 702."

  Số điện thoại `0909 821 702` trong đoạn này hiển thị **màu xanh (accent), có gạch chân dạng link** — bấm vào sẽ mở đúng modal "Thông tin hỗ trợ kỹ thuật" đã dựng ở mục D.

**Cột phải:**
- Tiêu đề nhỏ: "Quét mã để thanh toán"
- Khung chứa mã QR chuyển khoản (VietQR hoặc tương đương), cùng bảng thông tin: Ngân hàng, Chủ tài khoản, Số tài khoản, Số tiền, Nội dung chuyển khoản (mã đơn hàng tự sinh riêng cho mỗi đơn, ví dụ dạng `SS4821`). Ảnh QR ngân hàng thật chưa có — mô phỏng tạm bằng code (hình khối/placeholder hợp lý), tôi sẽ cung cấp thông tin tài khoản ngân hàng thật để làm QR động sau.
- Nút "Tôi đã chuyển khoản" (chưa cần xử lý xác nhận tự động, chỉ cần giao diện — đơn vẫn chờ admin duyệt tay theo đúng quy trình đã thống nhất)
- Đoạn ghi chú nhỏ cuối cùng, nguyên văn:

  "Sau khi thanh toán, chúng tôi sẽ gửi thông tin đơn hàng qua email trong thời gian sớm nhất. Vui lòng kiểm tra cả hộp thư rác nếu không thấy thư."

  Cố gắng canh độ rộng khung/cỡ chữ sao cho đoạn này xuống đúng 2 dòng cân đối, không bị lệch hàng ngắn hàng dài quá mức.

Mỗi đơn hàng (dù 1 hay nhiều sản phẩm) đều cần được sinh 1 **mã đơn hàng riêng** tự động, dùng làm nội dung chuyển khoản, để sau này admin dễ đối chiếu khi duyệt tay.

## Lưu ý chung

- Nếu điểm nào chưa rõ, hỏi lại tôi trước khi tự quyết định.
- Bám sát đúng nội dung câu chữ tôi đã ghi nguyên văn ở trên (mục G), không tự diễn đạt lại.
- Giữ đúng bộ màu thương hiệu và phong cách đã thống nhất ở các vòng chỉnh sửa trước.

## Báo cáo

Sau khi hoàn thành, báo cáo ngắn gọn từng mục A đến G đã xử lý xong hay còn vướng gì, bằng ngôn ngữ đơn giản không thuật ngữ kỹ thuật.

Sau khi tôi xác nhận ổn, cập nhật lại `CLAUDE.md` để phản ánh đúng trạng thái mới nhất của dự án, rồi commit và push toàn bộ thay đổi lên GitHub.
