const bingo = Math.floor(Math.random() * 100) + 1;
let answer;
let correctGuess = false;

for (let i = 1; i <= 5; i++) {
  do {
    answer = Number(
      prompt(`Nhập số dự đoán từ 1 đến 100, còn ${6 - i} lần đoán:`),
    );
  } while (!Number.isInteger(answer) || answer < 1 || answer > 100);

  if (answer === bingo) {
    correctGuess = true;
    alert("Chúc mừng");
    break;
  } else if (answer < bingo) {
    alert("Số bạn đoán quá nhỏ");
  } else {
    alert("Số bạn đoán quá lớn");
  }
}

if (!correctGuess) {
  alert("Game Over");
}
