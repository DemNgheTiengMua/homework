const a = Number(prompt("Nhập số a:"));
const b = Number(prompt("Nhập số b:"));

if (Number.isNaN(a) || Number.isNaN(b)) {
  console.log("Dữ liệu không hợp lệ!");
} else {
  console.log(`Tổng a + b: ${a + b}`);
  console.log(`Hiệu a - b: ${a - b}`);
  console.log(`Tích a * b: ${a * b}`);

  if (b === 0) {
    console.log("Không thể chia hoặc lấy số dư cho 0!");
  } else {
    console.log(`Thương a / b: ${a / b}`);
    console.log(`Số dư a % b: ${a % b}`);
  }
}
