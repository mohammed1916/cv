const PYTHON_LINES = [
  "def maximumDivisibilityScore(nums, divisors):",
  "    best_div, best_score = None, -1",
  "    for d in divisors:",
  "        score = sum(1 for x in nums if x % d == 0)",
  "        if score > best_score or (score == best_score and d < best_div):",
  "            best_div, best_score = d, score",
  "    return best_div",
];

const CODE = [
  "FUNCTION maximumDivisibilityScore(nums, divisors)",
  "  best_div = none, best_score = -1",
  "  FOR each divisor d in divisors",
  "    score = number of values x in nums with x mod d = 0",
  "    IF score > best_score OR (score = best_score AND d < best_div)",
  "      best_div = d, best_score = score",
  "  RETURN best_div",
];

const MAX_LENGTH = 1000;
const MAX_VALUE = 1000000000;

function checkArray(name, values) {
  if (!Array.isArray(values)) throw new Error(`"${name}" must be an array of integers`);
  if (values.length < 1 || values.length > MAX_LENGTH) {
    throw new Error(`${name} must have between 1 and ${MAX_LENGTH} elements (got ${values.length})`);
  }
  values.forEach((value, index) => {
    if (!Number.isInteger(value)) throw new Error(`${name}[${index}] must be an integer`);
    if (value < 1 || value > MAX_VALUE) throw new Error(`${name}[${index}] must be between 1 and 10^9`);
  });
}

export function parseInput(input) {
  let data = input;
  if (typeof input === "string") {
    try {
      data = JSON.parse(input);
    } catch {
      throw new Error('Input must be a JSON object such as {"nums": [4,7,9], "divisors": [5,2,3]}');
    }
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object with "nums" and "divisors" keys');
  }
  checkArray("nums", data.nums);
  checkArray("divisors", data.divisors);
  return { nums: [...data.nums], divisors: [...data.divisors] };
}

function makeFrame(fields) {
  return {
    phase: fields.phase,
    activeLine: fields.activeLine,
    pythonLine: fields.pythonLine,
    message: fields.message,
    explanation: fields.explanation ?? fields.message,
    nums: fields.nums,
    divisors: fields.divisors,
    scores: [...fields.scores],
    index: fields.index ?? null,
    divisor: fields.divisor ?? null,
    score: fields.score ?? null,
    bestDiv: fields.bestDiv ?? null,
    bestScore: fields.bestScore ?? -1,
    updated: fields.updated ?? false,
    result: fields.result ?? null,
  };
}

export function buildTrace(input) {
  const { nums, divisors } = parseInput(input);
  const scores = new Array(divisors.length).fill(null);
  const frames = [];
  let bestDiv = null;
  let bestScore = -1;

  frames.push(makeFrame({ phase: "setup", activeLine: 2, pythonLine: 2, nums, divisors, scores, bestDiv, bestScore,
    message: "Start with no best divisor: best_div = none, best_score = -1." }));

  for (let index = 0; index < divisors.length; index++) {
    const d = divisors[index];
    frames.push(makeFrame({ phase: "divisor", activeLine: 3, pythonLine: 3, nums, divisors, scores, index, divisor: d, bestDiv, bestScore,
      message: `Next divisor d = ${d}.` }));
    const score = nums.filter(x => x % d === 0).length;
    scores[index] = score;
    frames.push(makeFrame({ phase: "score", activeLine: 4, pythonLine: 4, nums, divisors, scores, index, divisor: d, score, bestDiv, bestScore,
      message: `${d} divides ${score} of the ${nums.length} numbers in nums.` }));
    const tieWins = score === bestScore && bestDiv !== null && d < bestDiv;
    const better = score > bestScore || tieWins;
    frames.push(makeFrame({ phase: "compare", activeLine: 5, pythonLine: 5, nums, divisors, scores, index, divisor: d, score, bestDiv, bestScore,
      message: better
        ? (tieWins ? `Tie at score ${score}, and ${d} is smaller than ${bestDiv}.` : `${score} > ${bestScore}: d = ${d} is the new leader.`)
        : `${score} does not beat the best score ${bestScore}; keep ${bestDiv}.` }));
    if (better) {
      bestDiv = d;
      bestScore = score;
      frames.push(makeFrame({ phase: "update", activeLine: 6, pythonLine: 6, nums, divisors, scores, index, divisor: d, score, bestDiv, bestScore,
        updated: true,
        message: `Best divisor is now ${bestDiv} with score ${bestScore}.` }));
    }
  }

  frames.push(makeFrame({ phase: "done", activeLine: 7, pythonLine: 7, nums, divisors, scores, bestDiv, bestScore,
    result: bestDiv,
    message: `Return ${bestDiv}.` }));

  return { input: { nums, divisors }, result: bestDiv, frames };
}

export const python = PYTHON_LINES.join("\n");
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
