const number = Number(prompt("Nhập một số bất kỳ:"));

let result;

if (Number.isNaN(number)) {
  result = "Dữ liệu không hợp lệ";
} else if (number > 0) {
  result = "Số dương";
} else if (number < 0) {
  result = "Số âm";
} else {
  result = "Số không";
}

console.log(result);
