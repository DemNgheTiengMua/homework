const prices = [100, 200, 300, 400];

const totalPrice = prices.reduce((total, price) => total + price, 0);
const vat = totalPrice * 0.1;
const finalPayment = totalPrice + vat;

console.log(totalPrice);
console.log(vat);
console.log(finalPayment);
