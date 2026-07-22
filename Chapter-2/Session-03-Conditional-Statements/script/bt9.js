let inputNumber;

do {
  inputNumber = Number(prompt("Nhập vào một số nguyên:"));
} while (!Number.isInteger(inputNumber));

let primeStatus = inputNumber >= 2;

for (let i = 2; i <= Math.sqrt(inputNumber); i++) {
  if (inputNumber % i === 0) {
    primeStatus = false;
    break;
  }
}

alert(
  `Số ${inputNumber} ${
    primeStatus ? "là số nguyên tố" : "không phải là số nguyên tố"
  }`,
);
