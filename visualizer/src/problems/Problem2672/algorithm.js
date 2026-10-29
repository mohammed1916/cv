export const PYTHON_LINES = [
  "def colorTheArray(n, queries):",
  "    colors = [0] * n",
  "    count = 0",
  "    answer = []",
  "    for index, color in queries:",
  "        old = colors[index]",
  "        if old != 0:",
  "            for nb in (index - 1, index + 1):",
  "                if 0 <= nb < n and colors[nb] == old:",
  "                    count -= 1",
  "        colors[index] = color",
  "        for nb in (index - 1, index + 1):",
  "            if 0 <= nb < n and colors[nb] == color:",
  "                count += 1",
  "        answer.append(count)",
  "    return answer",
];
export const python = PYTHON_LINES.join("\n");
export const CODE = [
  "COLOR-THE-ARRAY(n, queries)",
  "colors <- n zeros; count <- 0; answer <- empty",
  "for each [index, color] in queries",
  "old <- colors[index]",
  "if old is not uncolored",
  "for each neighbor of index",
  "if neighbor exists and has color old",
  "count <- count - 1",
  "colors[index] <- color",
  "for each neighbor of index",
  "if neighbor exists and has color color",
  "count <- count + 1",
  "append count to answer",
  "return answer",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));

export function parseInput(text) {
  const obj = typeof text === "string" ? JSON.parse(text) : text;
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error('Input must be a JSON object such as {"n": 4, "queries": [[0, 2]]}.');
  }
  const { n, queries } = obj;
  if (!Number.isInteger(n) || n < 1 || n > 50) {
    throw new Error("n must be an integer from 1 to 50 for this visualization.");
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 50) {
    throw new Error("queries must be an array of 1 to 50 [index, color] pairs.");
  }
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2) throw new Error("Each query must be [index, color].");
    const [index, color] = q;
    if (!Number.isInteger(index) || index < 0 || index > n - 1) {
      throw new Error(`Query index must be an integer from 0 to ${n - 1}.`);
    }
    if (!Number.isInteger(color) || color < 1 || color > 100000) {
      throw new Error("Query color must be an integer from 1 to 100000.");
    }
  }
  return { n, queries };
}

export function buildTrace(input) {
  const { n, queries } = input;
  const frames = [];
  const colors = Array(n).fill(0);
  let count = 0;
  const answer = [];
  const snap = (extra) => ({ colors: [...colors], count, answer: [...answer], ...extra });
  frames.push(snap({ phase: "init", activeLine: 2, pythonLine: 2, index: null, color: null, message: "All positions start uncolored (0)." }));
  frames.push(snap({ phase: "init", activeLine: 2, pythonLine: 3, index: null, color: null, message: "count = 0." }));
  frames.push(snap({ phase: "init", activeLine: 2, pythonLine: 4, index: null, color: null, message: "answer starts empty." }));

  for (const [index, color] of queries) {
    frames.push(snap({ phase: "query", activeLine: 3, pythonLine: 5, index, color, message: `Query: color ${index} with ${color}.` }));
    const old = colors[index];
    frames.push(snap({ phase: "old", activeLine: 4, pythonLine: 6, index, color, old, message: `Old color at ${index} is ${old}.` }));
    frames.push(snap({ phase: "remove", activeLine: 5, pythonLine: 7, index, color, old, message: old !== 0 ? "The old color is nonzero, so its pairs are removed first." : "Position was uncolored, so nothing is removed." }));
    if (old !== 0) {
      for (const nb of [index - 1, index + 1]) {
        const match = nb >= 0 && nb < n && colors[nb] === old;
        frames.push(snap({ phase: "remove-check", activeLine: 7, pythonLine: 9, index, color, old, neighbor: nb, message: `Neighbor ${nb} ${match ? "had the old color" : "does not match"}.` }));
        if (match) {
          count -= 1;
          frames.push(snap({ phase: "remove-dec", activeLine: 8, pythonLine: 10, index, color, old, neighbor: nb, message: `Remove one equal pair; count is ${count}.` }));
        }
      }
    }
    colors[index] = color;
    frames.push(snap({ phase: "set", activeLine: 9, pythonLine: 11, index, color, old, message: `Set position ${index} to ${color}.` }));
    for (const nb of [index - 1, index + 1]) {
      const match = nb >= 0 && nb < n && colors[nb] === color;
      frames.push(snap({ phase: "add-check", activeLine: 11, pythonLine: 13, index, color, old, neighbor: nb, message: `Neighbor ${nb} ${match ? "has the new color" : "does not match"}.` }));
      if (match) {
        count += 1;
        frames.push(snap({ phase: "add-inc", activeLine: 12, pythonLine: 14, index, color, old, neighbor: nb, message: `Add one equal pair; count is ${count}.` }));
      }
    }
    answer.push(count);
    frames.push(snap({ phase: "record", activeLine: 13, pythonLine: 15, index, color, old, message: `Record count ${count}.` }));
  }
  frames.push(snap({ phase: "done", activeLine: 14, pythonLine: 16, index: null, color: null, message: `Return ${JSON.stringify(answer)}.` , result: [...answer]}));
  return { input, result: answer, frames };
}
