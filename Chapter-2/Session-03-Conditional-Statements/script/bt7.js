const salary = Number(prompt("Nhập số tiền lương hiện tại (triệu đồng):"));
const age = Number(prompt("Nhập độ tuổi hiện tại:"));
const hasBadDebt = confirm(
  "Có nợ xấu trong 5 năm qua hay không?\nOK = Có, Cancel = Không",
);

const isEligible =
  salary > 15 && age >= 18 && age <= 60 && !hasBadDebt;

if (isEligible) {
  alert("Đăng ký khoản vay thành công!");
} else {
  alert("Khoản vay bị từ chối!");
}
