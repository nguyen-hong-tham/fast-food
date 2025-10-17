# Nền Tảng FoodFast - Yêu Cầu Dự Án Xây Mới

## 1. Tầm Nhìn & Mục Tiêu
- Xây dựng hệ sinh thái giao đồ ăn đa bên, kết nối khách hàng, nhà hàng đối tác và đội vận hành trung tâm thông qua giao hàng drone tự động.
- Mang lại trải nghiệm đặt món tuyệt vời, công cụ vận hành cho nhà hàng và trung tâm điều phối để quản lý drone và toàn bộ nền tảng.
- Phát triển kiến trúc cloud-native dễ mở rộng, hỗ trợ triển khai nhanh và mở đường cho các tính năng tương lai.

### Chỉ số thành công
- Độ trễ < 10 giây cho các hành trình chính (danh sách nhà hàng, cập nhật trạng thái đơn hàng).
- Thời gian hoạt động của hệ thống đạt ≥ 99,5%.
- Mô phỏng giao hàng drone phản ánh trạng thái thực với độ trễ đến người dùng < 2 giây.
- Onboard nhà hàng mới (end-to-end) < 10 phút mà không cần can thiệp kỹ thuật.
- Tỷ lệ thanh toán thành công qua VNPay ≥ 97%.

## 2. Chân Dung Người Dùng
| Nhân vật | Mô tả | Kênh truy cập |
|----------|-------|---------------|
| Khách hàng | Người dùng cuối đặt món và theo dõi đơn. | Ứng dụng di động (React Native) và web responsive. |
| Chủ nhà hàng | Đối tác quản lý menu, đơn hàng, vận hành. | Cổng web (Next.js) và ứng dụng phụ trợ nếu cần. |
| Admin FoodFast | Đội vận hành trung tâm quản lý marketplace, drone, analytics. | Trang quản trị web (Next.js). |
| Hệ tích hợp (tương lai) | Hệ thống bên ngoài: thanh toán, CRM, logistics. | REST / Webhook APIs. |

## 3. Trụ Cột Sản Phẩm Cốt Lõi
1. **Trải nghiệm đặt món cho khách**
   - Duyệt nhà hàng, menu, khuyến mãi.
   - Quản lý giỏ hàng và thanh toán an toàn (VNPay chính; dễ mở rộng thêm cổng khác).
   - Theo dõi đơn hàng và drone theo thời gian thực với bản đồ và mô phỏng 60 giây đến nơi.
   - Lịch sử đơn, đặt lại, đánh giá và nhận xét.
2. **Cổng vận hành nhà hàng**
   - Quy trình tự đăng ký có bước phê duyệt của FoodFast.
   - Quản lý hồ sơ (địa chỉ, tọa độ, liên hệ, giờ hoạt động).
   - CRUD menu với danh mục, giá, tồn kho, hình ảnh.
   - Bảng điều khiển đơn hàng trực tiếp: nhận, chuẩn bị, sẵn sàng cho drone.
   - Dashboard insight: món bán chạy, doanh thu, lý do hủy.
3. **Bảng điều khiển Admin FoodFast**
   - Quản lý người dùng theo vai trò (admin/operator/auditor).
   - Xét duyệt hồ sơ nhà hàng, kích hoạt/tạm ngưng.
   - Giám sát đơn toàn hệ thống và điều phối thủ công khi cần.
   - Quản lý đội drone: đăng ký, trạng thái (Idle, Delivering, Maintenance), theo dõi telemetry.
   - Động cơ mô phỏng drone tùy chỉnh (đếm ngược 60 giây, overlay bản đồ).
   - Phân tích kinh doanh: GMV, top nhà hàng, hiệu suất drone, SLA.

## 4. Yêu Cầu Chức Năng Theo Module

### 4.1 Xác thực & Phân quyền
- Đồng bộ danh tính bằng Firebase Auth hoặc Appwrite Auth hỗ trợ email/password và tùy chọn OAuth.
- Thuộc tính vai trò: `admin`, `restaurant`, `customer` (mở rộng `operator`, `analyst`).
- Bật xác thực đa yếu tố cho tài khoản admin.
- Duy trì phiên đăng nhập trên web và mobile.

### 4.2 Ứng dụng/Web Khách hàng
1. **Gia nhập**
   - Đăng ký với tên, email, điện thoại, mật khẩu.
   - Quản lý địa chỉ cùng bản đồ ghim và geocoding.
2. **Khám phá**
   - Danh sách nhà hàng với bộ lọc (ẩm thực, điểm đánh giá, ETA giao hàng).
   - Tìm kiếm nhà hàng và món ăn.
   - Trang chi tiết nhà hàng: menu, đánh giá, khuyến mãi.
3. **Đặt hàng**
   - Giỏ hàng với chỉnh số lượng, add-on, mã khuyến mãi.
   - Thanh toán: tóm tắt đơn, chọn địa chỉ, VNPay (tùy chọn COD dự phòng).
   - Cập nhật trạng thái thời gian thực (Pending → Preparing → Drone En Route → Delivered).
   - Theo dõi drone: đếm ngược 60 giây + mô phỏng trên bản đồ, nhận push notification.
4. **Sau khi giao**
   - Lịch sử đơn kèm hóa đơn.
   - Quy trình đánh giá món và nhà hàng.
   - Gửi yêu cầu hỗ trợ (liên kết ticket/email).

### 4.3 Cổng Nhà hàng
1. **Vòng đời tài khoản**
   - Form đăng ký gồm thông tin pháp lý, chứng từ, liên hệ.
   - Hàng chờ xét duyệt admin; thông báo email tự động.
   - Chỉ đăng nhập được khi trạng thái `ACTIVE`.
2. **Hồ sơ & Cài đặt**
   - Cập nhật địa chỉ (có bản đồ), điện thoại, mô tả, logo, ảnh cover.
   - Quản lý giờ mở cửa, ngày nghỉ, hướng dẫn giao hàng.
3. **Quản lý menu**
   - Danh mục (Breakfast, Lunch, Drinks...).
   - Món ăn với giá, mô tả, tình trạng, thẻ (vegan, spicy), biến thể/add-on, upload ảnh.
   - Import/export hàng loạt qua CSV.
4. **Vận hành đơn hàng**
   - Luồng đơn mới realtime kèm âm báo.
   - Điều khiển trạng thái: Accept/Reject, Start Preparing, Ready for Drone.
   - Hẹn giờ SLA cho khâu chuẩn bị, cảnh báo đơn trễ.
   - Lịch sử đơn có tìm kiếm/lọc.
5. **Insight**
   - Dashboard doanh thu, đơn hoàn tất/hủy, món bán chạy.
   - Xuất CSV/PDF cho kế toán.

### 4.4 Bảng điều khiển Admin
1. **Quản lý người dùng & vai trò**
   - CRUD tài khoản admin; gán quyền.
   - Xem và hành động với tài khoản khách, nhà hàng (cấm, reset password, trạng thái KYC).
2. **Quản trị nhà hàng**
   - Duyệt hồ sơ, ghi chú, yêu cầu bổ sung.
   - Bật/tắt hoạt động, lập lịch bảo trì.
3. **Trung tâm điều phối đơn**
   - Bảng đơn toàn hệ thống với bộ lọc trạng thái, nhà hàng, khách, thời gian.
   - Ghi đè trạng thái thủ công, đổi drone.
   - Log sự cố cho đơn thất bại.
4. **Quản lý đội drone**
   - Đăng ký drone với metadata (mã, tải trọng, bảo trì gần nhất).
   - Luồng telemetry thời gian thực (vị trí, pin, độ cao placeholder).
   - Gán đơn thủ công hoặc tự động.
   - Điều khiển mô phỏng: start/stop, chỉnh thời lượng, xem đường bay.
5. **Analytics & Báo cáo**
   - KPI: GMV, chuyển đổi đơn, lý do hủy, hiệu suất drone.
   - So sánh theo thời gian, export biểu đồ.
   - Cấu hình cảnh báo vi phạm SLA (VD: chuẩn bị > 20 phút).

### 4.5 Dịch vụ mô phỏng drone
- Mô phỏng cấu hình được cho mỗi đơn; mặc định đếm ngược 60 giây tương đương thời gian bay.
- Phát broadcast trạng thái qua WebSocket/Firestore.
- Nội suy vị trí để vẽ đường đi trên bản đồ.
- Dễ mở rộng tích hợp telemetry drone thật trong tương lai.

### 4.6 Thanh toán & Đối soát
- Tích hợp VNPay cho thanh toán online (flow phía server và client).
- Tạo payment intent, callback/webhook xác thực, lưu trữ transaction ID an toàn.
- Quy trình hoàn tiền (admin).
- Liên kết trạng thái thanh toán với vòng đời đơn (auto-cancel nếu thất bại sau N phút).

### 4.7 Thông báo & Giao tiếp
- Push notification (Firebase Cloud Messaging) cho mobile ở các mốc quan trọng.
- Email template cho onboarding, xác nhận đơn, cập nhật trạng thái.
- Thông báo trong app do admin cấu hình.

### 4.8 Hỗ trợ & Nhật ký
- Admin tạo ticket hỗ trợ gắn với đơn hoặc người dùng.
- Audit log ghi nhận hành động quan trọng (đổi vai trò, gán drone, điều chỉnh trạng thái).
- Quy trình xuất/xóa dữ liệu phù hợp GDPR.

## 5. Yêu Cầu Phi Chức Năng
- **Bảo mật**: Bắt buộc HTTPS, bảo vệ secrets, tuân thủ cơ bản OWASP ASVS.
- **Hiệu năng**: API chính phản hồi ≤ 500ms p95.
- **Khả năng mở rộng**: Backend mở rộng ngang (cloud functions, serverless, microservices container).
- **Giám sát**: Logging tập trung, tracing cho luồng quan trọng, dashboard realtime (Firebase Crashlytics, Logflare, Grafana...).
- **Độ tin cậy**: Hạ cấp graceful cho tính năng realtime (fallback polling khi WebSocket lỗi).
- **Khả năng bảo trì**: Code tổ chức theo domain, 100% TypeScript, tài liệu rõ ràng.
- **Khả năng tiếp cận**: Mục tiêu WCAG 2.1 AA cho web.

## 6. Tổng Quan Kiến Trúc Hệ Thống
- **Frontend**: React Native (Expo SDK ≥ 50) cho mobile, Next.js 14 (App Router) + TypeScript cho web.
- **Backend**: Lựa chọn A: Firebase (Auth, Firestore, Storage, Cloud Functions, Cloud Messaging). Lựa chọn B: Appwrite tự host với functions tùy biến.
- **Realtime**: Firestore listeners hoặc WebSocket dành riêng cho drone.
- **Bản đồ**: Google Maps SDK (mobile), Maps JavaScript API / Mapbox (web).
- **Thanh toán**: VNPay SDK + webhook backend.
- **CI/CD**: GitHub Actions (lint/test/build), Expo EAS cho build mobile.

## 7. Mô Hình Dữ Liệu (Collection/Bảng ban đầu)
| Collection/Bảng | Trường chính | Ghi chú |
|-----------------|--------------|--------|
| users | `id`, `name`, `email`, `phone`, `role`, `status`, `createdAt`, `lastLogin` | Điều khiển quyền. |
| restaurants | `id`, `ownerId`, `name`, `address`, `geo`, `status`, `operatingHours`, `rating`, `documents` | Bao gồm metadata tuân thủ. |
| menuCategories | `id`, `restaurantId`, `name`, `order` | Nhóm menu. |
| menuItems | `id`, `categoryId`, `restaurantId`, `name`, `description`, `price`, `imageUrl`, `isAvailable`, `modifiers` | Hỗ trợ biến thể/add-on. |
| orders | `id`, `customerId`, `restaurantId`, `status`, `paymentStatus`, `total`, `deliveryAddress`, `droneId`, `timestamps`, `ratings` | Lưu lịch sử trạng thái. |
| orderItems | `id`, `orderId`, `menuItemId`, `quantity`, `unitPrice`, `notes`, `addOns` | |
| drones | `id`, `code`, `status`, `currentPosition`, `batteryLevel`, `lastMaintenanceAt`, `assignedOrderId` | |
| droneEvents | `id`, `droneId`, `orderId`, `eventType`, `timestamp`, `payload` | Telemetry/audit. |
| payments | `id`, `orderId`, `provider`, `amount`, `status`, `transactionRef`, `rawResponse` | |
| reviews | `id`, `orderId`, `customerId`, `restaurantId`, `scores`, `comment`, `createdAt` | |
| notifications | `id`, `targetId`, `channel`, `title`, `body`, `data`, `status`, `sentAt` | |
| auditLogs | `id`, `actorId`, `action`, `entity`, `before`, `after`, `timestamp`, `ip` | |

## 8. Phác Thảo API
- **Gateway REST/GraphQL** (tùy backend). Endpoint ví dụ:
  - `POST /auth/register`, `POST /auth/login`, `POST /auth/reset`.
  - `GET /restaurants`, `POST /restaurants/{id}/approve`, `PATCH /restaurants/{id}`.
  - `POST /menus`, `PATCH /menus/{id}`.
  - `POST /orders`, `GET /orders/{id}`, `PATCH /orders/{id}/status`.
  - `POST /payments/vnpay/initiate`, `POST /payments/vnpay/webhook`.
  - `POST /drones`, `PATCH /drones/{id}/status`, `POST /drones/{id}/simulate`.
  - `GET /analytics/summary`, `GET /analytics/drone-utilization`.
- **Realtime Channels**
  - `orders/{orderId}`: cập nhật cho khách và nhà hàng.
  - `drones/{droneId}`: telemetry cho admin.
  - Chủ đề thông báo phân tách theo vai trò.

## 9. Phân Kỳ Dự Án & Mốc

### Phase 0 – Khởi động (Tuần 1)
- Chốt tech stack, sơ đồ kiến trúc, chuẩn coding.
- Thiết lập cấu trúc repo (mono repo Turborepo hoặc tách repo với package dùng chung).
- Cấu hình CI/CD, quản lý môi trường.

### Phase 1 – Xác thực & Dữ liệu lõi (Tuần 2-3)
- Implement auth, quản lý vai trò, seed dữ liệu.
- Định nghĩa schema, quy tắc bảo mật Firestore/Appwrite.
- Khung admin console với danh sách user/restaurant.

### Phase 2 – MVP cổng nhà hàng (Tuần 4-6)
- Luồng onboarding + phê duyệt.
- UI/API quản lý menu.
- Quy trình nhận đơn (chưa gán drone).

### Phase 3 – MVP ứng dụng khách (Tuần 7-9)
- Khám phá, giỏ hàng, checkout (COD dự phòng).
- Theo dõi đơn với mô phỏng drone giả lập.
- Push notification cho cập nhật đơn.

### Phase 4 – Admin & hệ drone (Tuần 10-12)
- Registry drone, logic gán, mô phỏng.
- Bảng điều phối đơn toàn hệ thống.
- Dashboard analytics cơ bản.

### Phase 5 – Thanh toán & nâng cấp (Tuần 13-14)
- Tích hợp VNPay với webhook, đối soát.
- Đánh giá/nhận xét, mã khuyến mãi, insight nhà hàng.

### Phase 6 – Tối ưu & chuẩn bị phát hành (Tuần 15-16)
- Kiểm thử tổng thể (unit, integration, E2E bằng Detox/Playwright).
- Tối ưu hiệu năng, rà soát bảo mật, viết tài liệu.
- Test staging, phát hành bản release candidate, bàn giao.

## 10. Chiến Lược Kiểm Thử & Chất Lượng
- **Unit Test**: Jest cho logic chung, React Testing Library (web), React Native Testing Library.
- **Integration Test**: Kiểm thử contract API, security rules Firestore.
- **E2E Test**: Playwright (web), Detox (mobile) cho hành trình chính.
- **Load Test**: k6 hoặc Artillery cho endpoint backend.
- **Checklist QA**: Accessibility, sẵn sàng đa ngôn ngữ, hành vi offline.

## 11. Công Cụ & DevOps
- GitHub quản lý source với workflow trunk-based, bảo vệ nhánh main.
- Conventional commit, semantic versioning tự động.
- Quản lý biến môi trường qua `.env`, bảo mật (1Password, Vault, GitHub OIDC).
- Monitoring & analytics: Sentry/Crashlytics, Google Analytics/Amplitude.

## 12. Sản Phẩm bàn giao & Tài liệu
- Sơ đồ kiến trúc (C4 Level 1-3).
- Đặc tả API (OpenAPI).
- Data dictionary và ERD.
- Playbook: xử lý sự cố, deployment, rollback.
- Tài liệu người dùng cuối (khách, nhà hàng, admin).
- Gói bàn giao kèm checklist xoay vòng credentials.

## 13. Câu hỏi mở & Nâng cấp tương lai
- Chương trình loyalty, gói subscription.
- Hỗ trợ đa thành phố với phân vùng drone.
- Tích hợp routing nâng cao (telemet drone thật).
- Marketplace promotion (combo, sponsor listing).
- Tích hợp hệ kế toán, CRM.

---
**Hãy sử dụng tài liệu này như nguồn yêu cầu chuẩn để xây dựng nền tảng FoodFast mới từ đầu, không phụ thuộc vào code cũ.**
