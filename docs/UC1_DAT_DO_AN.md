# USE CASE UC1: ĐẶT ĐỒ ĂN

## Thông tin Use Case

| **Thuộc tính** | **Mô tả** |
|----------------|-----------|
| **Use Case Number** | UC1 |
| **Use Case Name** | Đặt đồ ăn |
| **Actor(s)** | Khách hàng (primary), Nhà hàng (secondary), Admin (secondary) |
| **Maturity** | Focused |
| **Summary** | Khách hàng đặt đồ ăn ở ứng dụng và nhà hàng sẽ tiếp nhận đơn hàng. Admin thực hiện gán drone cho đơn hàng và giao tới khách hàng |

---

## Basic Course of Events (Luồng chính)

| **Bước** | **Actor Action** | **System Response** |
|----------|------------------|---------------------|
| 1 | Khách hàng mở ứng dụng mobile | Hệ thống hiển thị màn hình trang chủ với danh sách nhà hàng |
| 2 | Khách hàng chọn nhà hàng muốn đặt món | Hệ thống hiển thị menu của nhà hàng đã chọn |
| 3 | Khách hàng chọn món ăn và số lượng, thêm vào giỏ hàng | Hệ thống cập nhật giỏ hàng, hiển thị tổng tiền tạm tính |
| 4 | Khách hàng nhấn "Đặt hàng" | Hệ thống hiển thị màn hình xác nhận đơn hàng với thông tin: món ăn, số lượng, địa chỉ giao hàng, phương thức thanh toán |
| 5 | Khách hàng xác nhận thông tin và chọn phương thức thanh toán | Hệ thống xử lý thanh toán (nếu thanh toán online) |
| 6 | Khách hàng xác nhận đặt hàng | Hệ thống tạo đơn hàng mới với trạng thái "Chờ xác nhận", gửi thông báo đến nhà hàng |
| 7 | | Hệ thống hiển thị màn hình xác nhận đặt hàng thành công với mã đơn hàng |
| 8 | Nhà hàng nhận thông báo và xem chi tiết đơn hàng | Hệ thống hiển thị chi tiết đơn hàng trên dashboard nhà hàng |
| 9 | Nhà hàng xác nhận đơn hàng và bắt đầu chuẩn bị món | Hệ thống cập nhật trạng thái đơn hàng thành "Đang chuẩn bị", gửi thông báo cho khách hàng |
| 10 | Nhà hàng hoàn thành chuẩn bị món, cập nhật trạng thái | Hệ thống cập nhật trạng thái thành "Sẵn sàng giao", gửi thông báo cho Admin |
| 11 | Admin xem danh sách đơn hàng cần giao | Hệ thống hiển thị danh sách đơn hàng "Sẵn sàng giao" và danh sách drone khả dụng |
| 12 | Admin chọn đơn hàng và gán drone phù hợp | Hệ thống gán drone cho đơn hàng, cập nhật trạng thái thành "Đang giao" |
| 13 | | Hệ thống gửi thông báo cho khách hàng về thông tin drone đang giao hàng |
| 14 | | Drone tự động bay đến nhà hàng, lấy hàng và giao đến địa chỉ khách hàng |
| 15 | Khách hàng nhận hàng và xác nhận | Hệ thống cập nhật trạng thái đơn hàng thành "Đã giao", cập nhật trạng thái drone thành "Khả dụng" |
| 16 | | Hệ thống hoàn tất thanh toán (nếu COD), gửi thông báo hoàn thành đơn hàng cho tất cả các bên |

---

## Alternative Paths (Luồng thay thế)

| **Điểm rẽ nhánh** | **Actor Action** | **System Response** |
|-------------------|------------------|---------------------|
| Tại bước 5 | Khách hàng chọn thanh toán online nhưng thanh toán thất bại | Hệ thống hiển thị thông báo lỗi, yêu cầu khách hàng chọn phương thức thanh toán khác hoặc thử lại |
| Tại bước 9 | Nhà hàng từ chối đơn hàng (hết món, quá tải) | Hệ thống cập nhật trạng thái thành "Đã hủy", hoàn tiền (nếu đã thanh toán), gửi thông báo cho khách hàng |
| Tại bước 12 | Admin không tìm thấy drone khả dụng | Hệ thống hiển thị cảnh báo thiếu drone, đơn hàng ở trạng thái "Chờ drone" |
| Tại bước 14 | Drone gặp sự cố trong quá trình giao hàng | Hệ thống gửi cảnh báo cho Admin, Admin gán drone khác hoặc liên hệ khách hàng |

---

## Exception Paths (Luồng ngoại lệ)

| **Điểm phát sinh** | **Mô tả** | **Xử lý** |
|-------------------|-----------|-----------|
| Bất kỳ lúc nào | Mất kết nối mạng | Hệ thống lưu cache dữ liệu, đồng bộ khi có kết nối trở lại |
| Tại bước 6 | Lỗi hệ thống khi tạo đơn hàng | Hệ thống hiển thị thông báo lỗi, yêu cầu khách hàng thử lại sau |
| Tại bước 15 | Khách hàng không nhận hàng | Drone quay về, Admin liên hệ khách hàng để sắp xếp lại giao hàng |

---

## Extension Points

- **UC1.1**: Áp dụng mã giảm giá (tại bước 4)
- **UC1.2**: Theo dõi đơn hàng real-time (sau bước 7)
- **UC1.3**: Đánh giá đơn hàng (sau bước 16)

---

## Triggers

- Khách hàng muốn đặt đồ ăn
- Khách hàng nhấn vào nhà hàng trên trang chủ

---

## Assumptions

- Khách hàng đã đăng nhập vào ứng dụng
- Khách hàng đã cập nhật địa chỉ giao hàng
- Nhà hàng đã đăng ký và có menu trên hệ thống
- Có ít nhất một drone khả dụng trong hệ thống
- Khoảng cách giao hàng nằm trong phạm vi hoạt động của drone

---

## Preconditions

1. Người dùng đã cài đặt ứng dụng FoodFast
2. Người dùng có tài khoản và đã đăng nhập
3. Nhà hàng đang hoạt động (mở cửa)
4. Hệ thống drone đang hoạt động bình thường
5. GPS và định vị đã được bật trên thiết bị

---

## Post Conditions

### **Success:**
- Đơn hàng được tạo thành công với trạng thái "Đã giao"
- Khách hàng nhận được đồ ăn
- Nhà hàng nhận được thông báo hoàn thành đơn hàng
- Drone trở về trạng thái "Khả dụng"
- Thanh toán được xử lý thành công
- Lịch sử đơn hàng được lưu trữ

### **Failure:**
- Đơn hàng bị hủy, khách hàng được hoàn tiền (nếu đã thanh toán)
- Drone trở về vị trí ban đầu
- Thông báo lỗi được gửi đến các bên liên quan

---

## Reference: Business Rules

1. **BR1**: Đơn hàng tối thiểu: 50,000 VNĐ
2. **BR2**: Thời gian chuẩn bị món tối đa: 30 phút
3. **BR3**: Thời gian giao hàng tối đa: 45 phút
4. **BR4**: Phạm vi giao hàng: trong bán kính 10km
5. **BR5**: Phí giao hàng được tính dựa trên khoảng cách
6. **BR6**: Khách hàng có thể hủy đơn trong vòng 5 phút sau khi đặt
7. **BR7**: Drone có trọng tải tối đa 5kg

---

## Non-Functional Requirements

1. **Performance**: Thời gian phản hồi hệ thống < 2 giây
2. **Availability**: Hệ thống hoạt động 99.9% thời gian
3. **Security**: Mã hóa thông tin thanh toán, xác thực người dùng
4. **Usability**: Giao diện đơn giản, dễ sử dụng cho mọi đối tượng
5. **Scalability**: Hỗ trợ đồng thời 10,000+ người dùng

---

## UI/UX Flow

### **Mobile App (Khách hàng):**
1. Home Screen → Restaurant List
2. Restaurant Detail → Menu Items
3. Cart → Order Confirmation
4. Payment → Order Tracking
5. Order Complete → Rating

### **Restaurant Dashboard:**
1. Order List → Order Detail
2. Accept/Reject Order
3. Update Order Status

### **Admin Dashboard:**
1. Order Management → Available Orders
2. Drone Management → Available Drones
3. Assign Drone → Track Delivery

---

## Author(s)

**Ngày tạo**: 05/11/2025  
**Người tạo**: FoodFast Development Team  
**Phiên bản**: 1.0  
**Trạng thái**: Approved

---

## Change Log

| **Ngày** | **Phiên bản** | **Thay đổi** | **Người thực hiện** |
|----------|---------------|--------------|---------------------|
| 05/11/2025 | 1.0 | Tạo tài liệu ban đầu | Development Team |

