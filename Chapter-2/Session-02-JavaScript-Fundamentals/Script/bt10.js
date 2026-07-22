const numberA = Number(prompt("Nhập số A:"));
const operator = prompt("Nhập phép tính (+, -, *, /, %):");
const numberB = Number(prompt("Nhập số B:"));

let result;
let errorMessage = "";

if (Number.isNaN(numberA) || Number.isNaN(numberB)) {
  errorMessage = "Dữ liệu không hợp lệ. Vui lòng nhập hai số.";
} else if (operator === "+") {
  result = numberA + numberB;
} else if (operator === "-") {
  result = numberA - numberB;
} else if (operator === "*") {
  result = numberA * numberB;
} else if (operator === "/") {
  if (numberB === 0) {
    errorMessage = "Không thể chia cho 0.";
  } else {
    result = numberA / numberB;
  }
} else if (operator === "%") {
  if (numberB === 0) {
    errorMessage = "Không thể chia lấy dư cho 0.";
  } else {
    result = numberA % numberB;
  }
} else {
  errorMessage = "Phép tính không hợp lệ.";
}

if (errorMessage) {
  alert(errorMessage);
  console.log(errorMessage);
} else {
  const output = `Kết quả của ${numberA} ${operator} ${numberB} là: ${result}`;
  alert(output);
  console.log(output);
}
