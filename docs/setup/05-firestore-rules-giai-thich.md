# Firestore Security Rules là gì và vì sao quan trọng

## Rules là gì?

Firestore Rules là 1 tệp cấu hình RIÊNG (không phải code JavaScript trong web của bạn) mà
**chính Google kiểm tra ở phía máy chủ** mỗi khi có ai đó — bất kỳ ai, từ bất kỳ đâu — cố
đọc hoặc ghi dữ liệu vào Firestore. Nó hoạt động độc lập với trang web: kể cả khi trang web
của bạn không hề có nút nào cho phép xoá sản phẩm, nếu Rules không chặn hành động "xoá", một
người rành kỹ thuật vẫn có thể mở DevTools trình duyệt, tự gọi thẳng vào Firestore và xoá
dữ liệu — Rules chính là lớp phòng thủ CUỐI CÙNG, không phụ thuộc giao diện.

## Vì sao KHÔNG được để "chế độ test"

Khi tạo Firestore, Google cho chọn "Test mode" — chế độ này cho phép **BẤT KỲ AI TRÊN
INTERNET đọc VÀ ghi TOÀN BỘ dữ liệu**, không cần đăng nhập, không giới hạn gì (chỉ tự hết
hạn sau ~30 ngày rồi khoá luôn toàn bộ app). Nếu quên đổi sang rules thật trước khi có
khách dùng thật, hậu quả có thể là: ai đó xoá sạch sản phẩm, đọc trộm toàn bộ email/SĐT
khách hàng, hoặc tự ý sửa giá/số dư hoa hồng CTV. Đây là lý do bước 1 (tạo Firestore) đã
dặn chọn "production mode" (chế độ khoá mặc định — mọi thứ bị CHẶN cho tới khi bạn viết
Rules cho phép rõ ràng từng trường hợp).

## Cấu trúc 1 rule cơ bản

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Ai cũng ĐỌC được sản phẩm, nhưng KHÔNG ai ghi được từ trình duyệt
    // (ghi chỉ qua Firebase Console tay, hoặc qua dashboard admin đã xác thực)
    match /san_pham/{slug} {
      allow read: if true;
      allow write: if false;
    }

    // Đơn hàng: ai cũng được TẠO MỚI (khách thanh toán ẩn danh), nhưng
    // KHÔNG ai đọc/sửa/xoá được từ trình duyệt công khai (chỉ admin đã đăng nhập)
    match /don_hang/{maDon} {
      allow create: if true;
      allow read, update, delete: if false;
    }

    // Dữ liệu CTV: chỉ đúng người đó (đã đăng nhập, uid khớp) mới đọc được của mình
    match /ctv/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // ghi chỉ qua Cloud Function
    }
  }
}
```

Đọc từng dòng: `allow read/write/create/update/delete: if <điều kiện>` — điều kiện là
`true` (luôn cho phép), `false` (luôn chặn), hoặc 1 biểu thức kiểm tra (vd người đang đăng
nhập có đúng là chủ dữ liệu không).

## Vì sao 1 số việc PHẢI đi qua Cloud Function thay vì cho phép "write: if true"

Ví dụ voucher: nếu cho phép `allow update: if true` trên field "số lần đã dùng", một khách
mở DevTools có thể tự sửa lại số đó về 0 để dùng mã vô hạn lần. Cách an toàn: **chặn hẳn
việc ghi trực tiếp** (`allow write: if false`), và chỉ cho phép thay đổi qua 1 Cloud
Function — nơi có thể tự chạy logic kiểm tra (đã hết hạn chưa, đã dùng đủ số lần chưa) một
cách đáng tin cậy trước khi ghi, mà khách hàng không thể can thiệp vào logic đó.

## Cách deploy Rules

**Cách 1 — qua giao diện web (đơn giản nhất, không cần cài gì):**
1. Vào Firebase Console → project tương ứng → Firestore Database → tab **"Rules"**.
2. Xoá nội dung mặc định, dán rules tôi viết sẵn vào.
3. Bấm **"Publish" / "Xuất bản"**. Có hiệu lực trong khoảng 1 phút.
4. Trước khi Publish, có thể bấm tab **"Rules Playground"** để giả lập thử 1 lượt đọc/ghi xem có bị chặn đúng như mong đợi không.

**Cách 2 — qua dòng lệnh (nếu đã cài Firebase CLI ở bước Cloud Functions):**
```
firebase deploy --only firestore:rules --project <project-id>
```

## Việc bạn cần làm

Không cần tự viết rules — tôi sẽ viết sẵn rules cho từng collection (sản phẩm, thông báo,
voucher, CTV, đơn hàng, tra cứu bản quyền) kèm giải thích ngay trong file, bạn chỉ cần copy
dán theo Cách 1 ở trên cho đúng project (A hoặc B).
