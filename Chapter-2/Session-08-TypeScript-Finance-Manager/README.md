# Ví Của Tôi

App quản lý chi tiêu cá nhân. Ghi thu/chi theo tháng, đặt hạn mức cho từng danh
mục, và cảnh báo khi chi quá tay. Viết bằng TypeScript, dữ liệu lưu trong
localStorage nên không cần server.

## Chạy thử

```bash
npm install
npm run dev
```

Vite sẽ tự mở trình duyệt. Cần Node 18 trở lên.

Muốn build ra bản tĩnh thì `npm run build`, kết quả nằm trong `dist/`.

## Trong thư mục src có gì

- `types.ts` — khai báo các kiểu dữ liệu (Category, Transaction, AppData...).
- `storage.ts` — đọc/ghi localStorage, tạo dữ liệu mẫu lần đầu.
- `category.ts` — thêm/sửa/xóa danh mục, tính đã chi.
- `transaction.ts` — thêm/xóa giao dịch, tính tổng thu/chi/số dư.
- `ui.ts` — dựng HTML cho giao diện.
- `app.ts` — nối mọi thứ lại và bắt sự kiện người dùng.

Chia vậy để phần tính toán không dính tới phần vẽ giao diện, sửa chỗ nào biết
ngay ở file nào.

## Dùng thế nào

Chọn tháng ở góc trên bên phải, mọi số liệu bên dưới đổi theo tháng đó. Nhập
giao dịch ở cột trái, quản lý danh mục ở cột phải. Danh mục nào chi vượt hạn mức
sẽ chuyển đỏ. Bảng dưới cùng so sánh chi tiêu giữa các tháng.

Lần đầu mở app có sẵn dữ liệu mẫu của 2 tháng để xem cho dễ hình dung. Dữ liệu
nằm trên máy bạn thôi, xóa dữ liệu trình duyệt là mất.
