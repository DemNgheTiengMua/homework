const numbers = [10, 20, 30, 40, 50];

function checkNumber(searchValue) {
  if (numbers.includes(searchValue)) {
    console.log(numbers.indexOf(searchValue));
  } else {
    console.log("Not found");
  }
}

checkNumber(30);
checkNumber(99);
