let x = 10;

console.log("Trước block:", x);

{
  let x = 20;
  console.log("Trong block:", x);
}

console.log("Ngoài block:", x);

const myConstant = 100;
console.log("Giá trị const ban đầu:", myConstant);

// error hihi
myConstant = 200;
console.log("Giá trị const sau khi thay đổi:", myConstant);
