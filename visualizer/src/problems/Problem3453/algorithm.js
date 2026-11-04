// Code panel: real JavaScript for the bisection on the answer line.
export const code = [
  "function separateSquares(squares) {",
  "  const total = squares.reduce((sum, [, , l]) => sum + l * l, 0);",
  "  const half = total / 2;",
  "  const areaBelow = line => squares.reduce((sum, [, y, l]) => sum + l * Math.min(l, Math.max(0, line - y)), 0);",
  "  let low = Math.min(...squares.map(([, y]) => y));",
  "  let high = Math.max(...squares.map(([, y, l]) => y + l));",
  "  for (let step = 0; step < 60; step++) {",
  "    const mid = (low + high) / 2;",
  "    if (areaBelow(mid) < half) low = mid;",
  "    else high = mid;",
  "  }",
  "  return high;",
  "}",
].map((text, index) => ({ line: index + 1, text }));

export const python = `def separate_squares(squares):
    total = sum(l * l for _, _, l in squares)
    half = total / 2

    def area_below(line):
        return sum(l * min(l, max(0, line - y)) for _, y, l in squares)

    low = min(y for _, y, _ in squares)
    high = max(y + l for _, y, l in squares)
    for step in range(60):
        mid = (low + high) / 2
        if area_below(mid) < half:
            low = mid
        else:
            high = mid
    return high
`;

const pyLine = text => python.split('\n').findIndex(line => line.includes(text)) + 1;
const jsLine = text => code.findIndex(c => c.text.includes(text)) + 1;

export function parseInput(text) {
  const o = JSON.parse(text);
  if (!o || !Array.isArray(o.squares)) throw new Error('Use an object with an array squares of [x, y, l] entries.');
  const { squares } = o;
  if (squares.length < 1 || squares.length > 6) throw new Error('squares must have 1 to 6 entries.');
  if (squares.some(q => !Array.isArray(q) || q.length !== 3 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || !Number.isInteger(q[2]))) throw new Error('Each square is [x, y, l] with integers.');
  if (squares.some(([x, y, l]) => x < 0 || x > 10 || y < 0 || y > 10 || l < 1 || l > 5)) throw new Error('x and y are from 0 to 10, and l is from 1 to 5.');
  return { squares };
}

export function buildTrace({ squares }) {
  const total = squares.reduce((s, [, , l]) => s + l * l, 0);
  const half = total / 2;
  const below = line => squares.reduce((s, [, y, l]) => s + l * Math.min(l, Math.max(0, line - y)), 0);
  const low0 = Math.min(...squares.map(q => q[1]));
  const high0 = Math.max(...squares.map(q => q[1] + q[2]));
  let low = low0;
  let high = high0;
  const frames = [{ pythonLine: pyLine('total = sum'), activeLine: jsLine('const half'), phase: 'start', low, high, mid: null, below: null, half,
    message: `Total square area ${total}; the line must leave ${half} on each side. The answer lies between ${low0} and ${high0}.` }];
  for (let it = 0; it < 60; it++) {
    const mid = (low + high) / 2;
    const area = below(mid);
    const goLow = area < half;
    if (goLow) low = mid;
    else high = mid;
    if (it < 12 || it === 59) frames.push({ pythonLine: pyLine('if area_below(mid)'), activeLine: jsLine('if (areaBelow(mid)'), phase: 'probe', low, high, mid, below: area, half, goLow,
      message: `Test y = ${mid.toFixed(4)}: area below is ${area.toFixed(4)}, ${goLow ? 'too small, so the answer is higher' : 'at least half, so the answer is at or below this line'}.` });
  }
  const result = high;
  frames.push({ pythonLine: pyLine('return high'), activeLine: jsLine('return high'), phase: 'done', low, high, mid: result, below: half, half, low0, high0,
    message: `Separating line at y = ${result.toFixed(5)}.` });
  return { input: { squares }, result, frames, low0, high0 };
}
