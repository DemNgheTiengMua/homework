let sum = 0;
let input = Number(prompt("Nhập một số, nhập 0 để kết thúc:"));

while (input !== 0) {
  if (Number.isNaN(input)) {
    input = Number(prompt("Dữ liệu không hợp lệ, vui lòng nhập lại:"));
    continue;
  }

  sum += input;
  input = Number(prompt("Nhập tiếp một số, nhập 0 để kết thúc:"));
}

console.log(`Tổng cuối cùng: ${sum}`);
