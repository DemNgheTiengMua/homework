let inputNumber;

do {
  inputNumber = Number(prompt("Nhập một số trong khoảng 1-10:"));
} while (
  Number.isNaN(inputNumber) ||
  inputNumber < 1 ||
  inputNumber > 10
);

console.log(`Số vừa nhập: ${inputNumber}`);
