const userProfile = {
  username: "Nguyen Van An",
  age: 22,
  email: "an@example.com",
  address: {
    city: "Ho Chi Minh City",
  },
};

const {
  username: fullName,
  address: { city },
} = userProfile;

console.log(fullName);
console.log(city);
