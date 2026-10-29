const PYTHON_LINES = [
  "def num_teams(rating):",
  "    total = 0",
  "    for j in range(len(rating)):",
  "        left_less = sum(1 for i in range(j) if rating[i] < rating[j])",
  "        left_greater = sum(1 for i in range(j) if rating[i] > rating[j])",
  "        right_less = sum(1 for k in range(j + 1, len(rating)) if rating[k] < rating[j])",
  "        right_greater = sum(1 for k in range(j + 1, len(rating)) if rating[k] > rating[j])",
  "        total += left_less * right_greater + left_greater * right_less",
  "    return total",
];

const CODE = [
  "FUNCTION numTeams(rating)",
  "    total ← 0",
  "    FOR j FROM 0 THROUGH n − 1",
  "        leftLess ← count of i < j with rating[i] < rating[j]",
  "        leftGreater ← count of i < j with rating[i] > rating[j]",
  "        rightLess ← count of k > j with rating[k] < rating[j]",
  "        rightGreater ← count of k > j with rating[k] > rating[j]",
  "        total ← total + leftLess × rightGreater + leftGreater × rightLess",
  "    RETURN total",
];

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Input must be valid JSON, e.g. {"rating":[2,5,3,4,1]}');
  }
}

export function parseInput(text) {
  const input = typeof text === "string" ? parseJson(text) : text;
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error('Input must be a JSON object with a rating array, e.g. {"rating":[2,5,3,4,1]}');
  }
  const { rating } = input;
  if (!Array.isArray(rating)) throw new Error("rating must be an array of integers");
  if (rating.length < 3 || rating.length > 50) {
    throw new Error(`rating length ${rating.length} must be between 3 and 50 for the visualization`);
  }
  for (const value of rating) {
    if (!Number.isInteger(value) || value < 1 || value > 100000) {
      throw new Error(`Each rating must be an integer from 1 to 100000; found ${value}`);
    }
  }
  if (new Set(rating).size !== rating.length) throw new Error("ratings must be unique");
  return { rating: [...rating] };
}

export function buildTrace(input) {
  const rating = input.rating;
  const n = rating.length;
  const frames = [];
  let total = 0;
  const frame = (activeLine, phase, message, extra = {}) => frames.push({
    activeLine, phase, message, rating: [...rating], total, j: null, counts: null, contribution: 0, ...extra,
  });

  frame(2, "init", "Start with zero teams.");
  for (let j = 0; j < n; j++) {
    frame(3, "scan", `Use soldier ${j} (rating ${rating[j]}) as the middle of the team.`, { j });
    const counts = { leftLess: 0, leftGreater: 0, rightLess: 0, rightGreater: 0 };
    for (let i = 0; i < j; i++) if (rating[i] < rating[j]) counts.leftLess++;
    frame(4, "count", `Left side: ${counts.leftLess} soldier(s) with a smaller rating.`, { j, counts: { ...counts } });
    for (let i = 0; i < j; i++) if (rating[i] > rating[j]) counts.leftGreater++;
    frame(5, "count", `Left side: ${counts.leftGreater} soldier(s) with a larger rating.`, { j, counts: { ...counts } });
    for (let k = j + 1; k < n; k++) if (rating[k] < rating[j]) counts.rightLess++;
    frame(6, "count", `Right side: ${counts.rightLess} soldier(s) with a smaller rating.`, { j, counts: { ...counts } });
    for (let k = j + 1; k < n; k++) if (rating[k] > rating[j]) counts.rightGreater++;
    frame(7, "count", `Right side: ${counts.rightGreater} soldier(s) with a larger rating.`, { j, counts: { ...counts } });
    const contribution = counts.leftLess * counts.rightGreater + counts.leftGreater * counts.rightLess;
    total += contribution;
    frame(8, "add", `Teams centred on ${j}: ${counts.leftLess}×${counts.rightGreater} increasing + ${counts.leftGreater}×${counts.rightLess} decreasing = ${contribution}.`, { j, counts: { ...counts }, contribution });
  }
  frame(9, "done", `Return ${total} teams.`, { result: total });

  return { input: { rating }, result: total, frames };
}

export const python = PYTHON_LINES.join("\n");
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 };
