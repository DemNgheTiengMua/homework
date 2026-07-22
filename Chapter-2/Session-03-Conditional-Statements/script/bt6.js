let height = Number(prompt("Nhập chiều cao:"));
let width = Number(prompt("Nhập chiều rộng:"));

while (
  !Number.isInteger(height) ||
  !Number.isInteger(width) ||
  height <= 0 ||
  width <= 0
) {
  height = Number(prompt("Nhập lại chiều cao nguyên dương:"));
  width = Number(prompt("Nhập lại chiều rộng nguyên dương:"));
}

for (let i = 1; i <= height; i++) {
  let line = "";

  for (let j = 1; j <= width; j++) {
    line += "*";
  }

  console.log(line);
}
