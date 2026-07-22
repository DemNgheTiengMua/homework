const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";

const username = prompt("Nhập tên đăng nhập:");
const password = prompt("Nhập mật khẩu:");

if (username === ADMIN_USER && password === ADMIN_PASS) {
  alert("Đăng nhập thành công.");
  console.log("Đăng nhập thành công.");
} else {
  alert("Tên đăng nhập hoặc mật khẩu không chính xác.");
  console.log("Đăng nhập thất bại.");
}
