let total = 0;
const validNumbers = [];

for (let i = 1; i <= 50; i++) {
  if (i % 5 === 0) {
    continue;
  }

  validNumbers.push(i);
  total += i;

  if (total > 200) {
    break;
  }
}

console.log(`Danh sách số: ${validNumbers.join(", ")}`);
console.log(`Tổng cuối cùng: ${total}`);
