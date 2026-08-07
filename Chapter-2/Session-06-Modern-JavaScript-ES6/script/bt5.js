function sumAllNumbers(...numbers) {
  return numbers.reduce((total, number) => total + number, 0);
}

console.log(sumAllNumbers(1, 2, 3));
console.log(sumAllNumbers(10, 20, 30, 40));
console.log(sumAllNumbers(5, 15));
