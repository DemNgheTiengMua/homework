const productName = "JavaScript Course";
const productPrice = 25;
const quantity = 3;

const receipt = `
  You bought ${quantity} units of ${productName}
  for a total of $${productPrice * quantity}
`
  .replace(/\s+/g, " ")
  .trim();

console.log(receipt);
