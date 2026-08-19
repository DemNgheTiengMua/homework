# Ví Của Tôi — Personal Finance Manager (E-Wallet)

Ứng dụng quản lý chi tiêu cá nhân. Ghi thu/chi, quản lý danh mục kèm hạn mức,
lọc theo tháng, xem tổng quan và cảnh báo khi vượt ngân sách.

**Công nghệ:** Vite + TypeScript (strict mode) · lưu dữ liệu bằng `localStorage`.
Module 02 — Software Requirement Specification (SRS).

## Cài đặt & chạy

```bash
npm install     # cài Vite + TypeScript
npm run dev     # chạy dev server (tự mở trình duyệt)
```

Các lệnh khác:

```bash
npm run build   # kiểm tra kiểu (tsc) + build ra thư mục dist/
npm run preview # xem thử bản build
```

> Cần Node.js 18+ (để có `crypto.randomUUID`).

## Cấu trúc thư mục

```text
Session-08-TypeScript-Finance-Manager/
├── index.html          # khung HTML + thẻ <script> nạp app.ts
├── package.json        # scripts + dependencies
├── tsconfig.json       # bật strict mode (NFR-1)
├── vite.config.ts      # cấu hình Vite (NFR-2)
└── src/
    ├── types.ts        # interface/type dùng chung — "hợp đồng" dữ liệu
    ├── storage.ts      # đọc/ghi localStorage + dữ liệu mẫu (seed)
    ├── category.ts      # nghiệp vụ danh mục (thêm/sửa/xóa, tính đã chi)
    ├── transaction.ts  # nghiệp vụ giao dịch + tính tổng thu/chi/số dư
    ├── ui.ts           # vẽ giao diện (DOM) — không chứa tính toán
    ├── app.ts          # controller: ghép dữ liệu + giao diện + sự kiện
    └── style.css       # giao diện tối giản, xanh=thu / đỏ=chi
```

Mỗi file lo đúng một việc (kiến trúc modular — NFR-4): nghiệp vụ tách khỏi
giao diện, giao diện tách khỏi điều khiển.

## Tính năng (theo SRS)

- **F01 Dashboard** — số dư, tổng thu, tổng chi của tháng; thanh tiến trình so
  với ngân sách tổng kèm nhãn Đạt/Vượt.
- **F02 Danh mục** — thêm/sửa/xóa (có kiểm tra ràng buộc), đặt hạn mức riêng,
  hiển thị hạn mức + đã chi.
- **F03 Giao dịch** — form đủ trường (số tiền, danh mục, ghi chú, ngày),
  phân loại thu/chi, lịch sử sắp xếp mới nhất trước, xóa được.
- **F04 Lọc thời gian** — chọn Tháng/Năm; mọi khu vực đổi theo tháng; mỗi tháng
  lưu riêng trong `localStorage`.
- **F05 Cảnh báo & Thống kê** — cảnh báo đỏ + chữ khi danh mục vượt hạn mức;
  bảng tổng hợp nhiều tháng.

## Ghi chú

- Dữ liệu chỉ nằm trên máy bạn (localStorage). Xóa dữ liệu trình duyệt sẽ mất.
- Lần đầu mở app sẽ tự tạo dữ liệu mẫu 2 tháng để xem ngay.
