import { defineConfig } from "vite";

// Cấu hình Vite tối giản.
// base: "./" giúp bản build chạy được khi mở bằng đường dẫn tương đối.
export default defineConfig({
  base: "./",
  server: {
    open: true, // tự mở trình duyệt khi chạy npm run dev
  },
});
