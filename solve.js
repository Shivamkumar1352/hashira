const fs = require('fs');
const { create, all } = require('mathjs');
const { combinations } = require('combinatorial-generators');

const math = create(all);
math.config({ number: 'BigNumber', precision: 256 });

// Read JSON from file
function readInput(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const { n, k } = data.keys;
  const points = Object.entries(data)
    .filter(([key]) => key !== 'keys')
    .map(([xStr, { base, value }]) => {
      const x = math.bignumber(xStr);
      const y = math.bignumber(parseInt(value, parseInt(base)));
      return { x, y };
    });
  return { k, points };
}

// Lagrange interpolation at x = 0 to get constant term (secret)
function interpolateAtZero(points) {
  let secret = math.bignumber(0);
  for (let i = 0; i < points.length; i++) {
    const xi = points[i].x;
    const yi = points[i].y;

    let numerator = math.bignumber(1);
    let denominator = math.bignumber(1);

    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        const xj = points[j].x;
        numerator = numerator.mul(xj.neg());
        denominator = denominator.mul(xi.minus(xj));
      }
    }

    const li = numerator.div(denominator);
    secret = secret.add(yi.mul(li));
  }
  return secret.toFixed(0); // return as string
}

// Solve for a test case
function solve(filePath) {
  const { k, points } = readInput(filePath);
  const kCombos = [...combinations(points, k)];

  const results = kCombos.map(combo => interpolateAtZero(combo));

  // Count most common secret
  const freq = {};
  for (const r of results) freq[r] = (freq[r] || 0) + 1;

  return Object.entries(freq).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

// Run both test cases
const secret1 = solve('./input1.json');
const secret2 = solve('./input2.json');

console.log("Secret 1:", secret1);
console.log("Secret 2:", secret2);
