const scores = [1, 2, 3, 4, 5];

scores.forEach((score) => {
  console.log(score ** 2);
});

const doubledScores = scores.map((score) => score * 2);
console.log(doubledScores);
