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
 */
const PRODUCTS = [
  {
    slug: "swiftcopy-drive",
    badge: "Công cụ",
    type: "drive",
    name: "SwiftCopy.Drive",
    shortDesc: "Công cụ sao chép Google Drive & tải về máy tính tốc độ nhanh chóng",
    priceCurrent: "490.000đ (nhiều gói)",
    priceOld: "",
  },
  {
    slug: "swift-wedding-planner",
    badge: "File kế hoạch",
    type: "wedding",
    name: "Swift Wedding Planner",
    shortDesc: "Tự lên kế hoạch đám cưới: Đơn giản, tiện lợi, mọi lúc trên mọi thiết bị",
    priceCurrent: "149.000đ",
    priceOld: "220.000đ",
  },
  {
    slug: "swift-content-planner",
    badge: "Google Sheets",
    type: "content",
    name: "Swift Content Planner",
    shortDesc: "Công cụ lập kế hoạch nội dung, chiến dịch marketing và lịch đăng bài chuyên nghiệp.",
    priceCurrent: "90.000đ",
    priceOld: "200.000đ",
  },
  {
    slug: "swift-travel-planner",
    badge: "Google Sheets",
    type: "travel",
    name: "Swift Travel Planner",
    shortDesc: "Lưu trữ địa điểm và lên kế hoạch du lịch thông minh, tiện lợi.",
    priceCurrent: "79.000đ",
    priceOld: "150.000đ",
  },
  {
    slug: "swift-shop-admin",
    badge: "Google Sheets",
    type: "shop",
    name: "Swift Shop Admin",
    shortDesc: "Giải pháp bán hàng tinh gọn: Quản lý đơn, kho, doanh thu và nhân sự",
    priceCurrent: "129.000đ",
    priceOld: "220.000đ",
  },
  {
    slug: "swift-hotel-homestay-manager",
    badge: "Google Sheets",
    type: "hotel",
    name: "Swift Hotel & Homestay Manager",
    shortDesc: "Quản lý vận hành homestay/khách sạn: Từ đặt phòng, thông tin khách đến vệ sinh và thanh toán.",
    priceCurrent: "159.000đ",
    priceOld: "250.000đ",
  },
];
