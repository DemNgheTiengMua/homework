let number;

do {
  number = Number(prompt("Nhập một số nguyên dương:"));
} while (!Number.isInteger(number) || number <= 0);

for (let i = 1; i <= number; i++) {
  if (i % 2 === 0) {
    console.log(i);
  }
}
