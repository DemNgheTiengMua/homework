const ages = [15, 20, 12, 18, 25, 30, 10];

function getAdults(ageList) {
  return ageList.filter((age) => age >= 18);
}

const adults = getAdults(ages);
console.log(adults);
