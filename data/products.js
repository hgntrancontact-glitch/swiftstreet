/**
 * Danh sách sản phẩm (mảng PRODUCTS) — vòng 41: khôi phục lại 6 sản phẩm sau
 * khi vòng 32 từng thu gọn xuống còn 1 (SwiftCopy.Drive). Tên/mô tả/thứ tự
 * theo đúng yêu cầu khách; 3 sản phẩm SAU (Travel Planner/Shop Admin/Hotel &
 * Homestay Manager) là MỚI, thay thế hẳn 3 sản phẩm cũ (SwiftTrack Finance/
 * SwiftHR Attendance/SwiftOrder Group) — tái dùng lại type mini-dashboard cũ
 * (renderDashboard() trong js/main.js) nhưng đổi tên type + nội dung hiển thị
 * cho khớp sản phẩm mới (finance→travel, hr→hotel, order→shop).
 * slug: dùng để tạo link tới trang chi tiết products/<slug>.html — CHỈ
 * "swiftcopy-drive" có trang chi tiết thật, 5 sản phẩm còn lại CHƯA có (bấm
 * vào ảnh/tên sẽ 404, giống hệt tình trạng trước vòng 32).
 * type: quyết định mini-dashboard mô phỏng nào được vẽ trong js/main.js.
 *
 * Vòng 42: tách phần chữ chú thích trong ngoặc (trước đây viết dính vào
 * priceCurrent, vd "490.000đ (nhiều gói)") ra field riêng `priceNote` — để
 * renderProductGrid() dựng đúng cấu trúc giá 2 HÀNG (hàng 1: giá hiện tại +
 * chú thích, hàng 2: giá gạch ngang + % giảm tự tính từ priceCurrent/priceOld
 * qua computeDiscountPercent() trong js/main.js). SwiftCopy.Drive dùng
 * "tuỳ gói" (có nhiều gói Basic/Premium, xem trang Bảng giá); 5 sản phẩm còn
 * lại dùng "sắp ra mắt" (CHƯA thật sự bán được — chỉ SwiftCopy.Drive có luồng
 * mua hàng + trang chi tiết thật, đúng thực tế kinh doanh hiện tại).
 *
 * Vòng 52: `badge` (góc phải ảnh thẻ, vàng cam) đổi từ lặp lại "Google Sheets"
 * cho 4 sản phẩm sang phân loại RIÊNG theo bản chất từng sản phẩm — 3 nhóm
 * dùng chung theo ví dụ khách cho: "Web App Script" (SwiftCopy.Drive — 1 công
 * cụ/script chạy thật, khác hẳn 1 file mẫu tĩnh), "File kế hoạch" (Wedding/
 * Content/Travel Planner — file lập kế hoạch cá nhân), "Công cụ hỗ trợ" (Shop
 * Admin/Hotel & Homestay Manager — giải pháp quản lý vận hành). Thêm 2 field
 * boolean MỚI, cả 2 đều tuỳ chọn (`undefined` = không hiện badge tương ứng):
 * `bestSeller` (huy hiệu đỏ "🔥 Bán chạy", góc trái) — hiện CHỈ ở SwiftCopy.
 * Drive; `updated` (huy hiệu xanh lá "Cập nhật", xếp CHỒNG ngay dưới badge
 * vàng ở góc phải) — hiện ở Swift Wedding Planner + Swift Content Planner,
 * theo đúng bản mockup khách gửi (ảnh mockup đầu tiên có gắn nhầm "Cập nhật"
 * vào Content Planner dù chữ mô tả ghi Wedding Planner — bản mockup THỨ HAI
 * khách tự sửa vị trí xác nhận rõ CẢ 2 sản phẩm đều có, không phải lỗi đọc
 * nhầm của Claude). Xem `renderProductGrid()` trong js/main.js để biết cách
 * 2 field này dựng HTML, và mục "Thẻ sản phẩm" trong CLAUDE.md để biết vị trí/
 * màu sắc CSS tương ứng.
 */
const PRODUCTS = [
  {
    slug: "swiftcopy-drive",
    badge: "Web App Script",
    bestSeller: true,
    type: "drive",
    name: "SwiftCopy.Drive",
    shortDesc: "Công cụ sao chép Google Drive & tải về máy tính tốc độ nhanh chóng",
    priceCurrent: "490.000đ",
    priceNote: "tuỳ gói",
    priceOld: "620.000đ",
  },
  {
    slug: "swift-wedding-planner",
    badge: "File kế hoạch",
    updated: true,
    type: "wedding",
    name: "Swift Wedding Planner",
    shortDesc: "Tự lên kế hoạch đám cưới: Đơn giản, tiện lợi, mọi lúc trên mọi thiết bị",
    priceCurrent: "149.000đ",
    priceNote: "sắp ra mắt",
    priceOld: "220.000đ",
  },
  {
    slug: "swift-content-planner",
    badge: "File kế hoạch",
    updated: true,
    type: "content",
    name: "Swift Content Planner",
    shortDesc: "Công cụ lập kế hoạch nội dung, chiến dịch marketing và lịch đăng bài chuyên nghiệp.",
    priceCurrent: "90.000đ",
    priceNote: "sắp ra mắt",
    priceOld: "200.000đ",
  },
  {
    slug: "swift-travel-planner",
    badge: "File kế hoạch",
    type: "travel",
    name: "Swift Travel Planner",
    shortDesc: "Lưu trữ địa điểm và lên kế hoạch du lịch thông minh, tiện lợi.",
    priceCurrent: "79.000đ",
    priceNote: "sắp ra mắt",
    priceOld: "150.000đ",
  },
  {
    slug: "swift-shop-admin",
    badge: "Công cụ hỗ trợ",
    type: "shop",
    name: "Swift Shop Admin",
    shortDesc: "Giải pháp bán hàng tinh gọn: Quản lý đơn, kho, doanh thu và nhân sự",
    priceCurrent: "129.000đ",
    priceNote: "sắp ra mắt",
    priceOld: "220.000đ",
  },
  {
    slug: "swift-hotel-homestay-manager",
    badge: "Công cụ hỗ trợ",
    type: "hotel",
    name: "Swift Hotel & Homestay Manager",
    shortDesc: "Quản lý vận hành homestay/khách sạn: Từ đặt phòng, thông tin khách đến vệ sinh và thanh toán.",
    priceCurrent: "159.000đ",
    priceNote: "sắp ra mắt",
    priceOld: "250.000đ",
  },
];
