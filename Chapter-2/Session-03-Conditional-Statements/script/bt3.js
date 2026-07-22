const orderId = Number(
  prompt("1. Cafe\n2. Cam vắt\n3. Trà sữa\n4. Coca\nNhập số thứ tự:"),
);

let drinkName;

switch (orderId) {
  case 1:
    drinkName = "Cafe";
    break;
  case 2:
    drinkName = "Cam vắt";
    break;
  case 3:
    drinkName = "Trà sữa";
    break;
  case 4:
    drinkName = "Coca";
    break;
  default:
    drinkName = "Món ăn không tồn tại";
}

console.log(drinkName);
