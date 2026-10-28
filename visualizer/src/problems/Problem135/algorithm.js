export const CODE = [
  "def candy(ratings):",
  "    n = len(ratings)",
  "    candies = [1] * n",
  "    for i in range(1, n):",
  "        if ratings[i] > ratings[i-1]:",
  "            candies[i] = candies[i-1] + 1",
  "    for i in range(n-2, -1, -1):",
  "        if ratings[i] > ratings[i+1]:",
  "            candies[i] = max(candies[i], candies[i+1] + 1)",
  "    return sum(candies)",
];

export function parseRatingsInput(input) {
  if (input == null) {
    throw new Error("Input cannot be empty");
  }

  let raw;
  if (Array.isArray(input)) {
    raw = input;
  } else if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error("Input cannot be empty");
    }

    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        raw = JSON.parse(trimmed);
      } catch {
        throw new Error("Invalid JSON format for ratings");
      }
    } else if (
      trimmed.startsWith("[") ||
      trimmed.endsWith("]") ||
      trimmed.startsWith("{") ||
      trimmed.endsWith("}")
    ) {
      throw new Error("Invalid JSON format for ratings");
    } else {
      const parts = trimmed.split(",");
      raw = parts.map((part) => {
        const item = part.trim();
        if (item === "") {
          throw new Error("Empty rating value in comma-separated input");
        }
        const num = Number(item);
        if (!Number.isFinite(num)) {
          throw new Error(`Invalid rating number: "${item}"`);
        }
        return num;
      });
    }
  } else {
    throw new Error("Ratings must be an array or comma-separated string");
  }

  if (!Array.isArray(raw)) {
    throw new Error("Ratings must be an array");
  }

  if (raw.length === 0) {
    throw new Error("Ratings array must contain at least 1 rating");
  }

  if (raw.length > 100) {
    throw new Error("Ratings array exceeds limit (max 100 ratings)");
  }

  const ratings = raw.map((val, idx) => {
    if (typeof val !== "number" || !Number.isInteger(val)) {
      throw new Error(
        `Rating at index ${idx} must be an integer, got ${JSON.stringify(val)}`,
      );
    }
    if (val < 0) {
      throw new Error(`Rating at index ${idx} cannot be negative (${val})`);
    }
    if (val > 100000) {
      throw new Error(
        `Rating at index ${idx} exceeds maximum limit of 100,000 (${val})`,
      );
    }
    return val;
  });

  return ratings;
}

export function buildCandyStory(input) {
  const ratings = Object.freeze(parseRatingsInput(input));
  const n = ratings.length;
  const candies = new Array(n).fill(1);
  const frames = [];

  // Frame 1: Line 2 - n = len(ratings)
  frames.push(
    Object.freeze({
      activeLine: 2,
      phase: "init",
      pass: "init",
      direction: "none",
      i: -1,
      compareIndex: -1,
      candies: Object.freeze([...candies]),
      totalCandies: n,
      previousCandy: null,
      neededCandy: null,
      newCandy: null,
      conditionMet: null,
      message: `Determine number of children: n = ${n}.`,
      explanation: `We have ${n} children in a line with ratings [${ratings.join(", ")}].`,
    }),
  );

  // Frame 2: Line 3 - candies = [1] * n
  frames.push(
    Object.freeze({
      activeLine: 3,
      phase: "init",
      pass: "init",
      direction: "none",
      i: -1,
      compareIndex: -1,
      candies: Object.freeze([...candies]),
      totalCandies: n,
      previousCandy: null,
      neededCandy: null,
      newCandy: null,
      conditionMet: null,
      message: `Initialize baseline candies = [${candies.join(", ")}].`,
      explanation: `Rule 1: Each child must receive at least 1 candy. Start every child with a floor of 1.`,
    }),
  );

  // Left-to-right pass: Rewarding right-slopes (ratings[i] > ratings[i-1])
  for (let i = 1; i < n; i++) {
    // Frame: Line 4 - for i in range(1, n):
    frames.push(
      Object.freeze({
        activeLine: 4,
        phase: "loop",
        pass: "left-to-right",
        direction: "ltr",
        i,
        compareIndex: i - 1,
        candies: Object.freeze([...candies]),
        totalCandies: candies.reduce((a, b) => a + b, 0),
        previousCandy: candies[i],
        neededCandy: null,
        newCandy: null,
        conditionMet: null,
        message: `Left pass (i = ${i}): Inspect child ${i} (rating ${ratings[i]}) and left neighbor ${i - 1} (rating ${ratings[i - 1]}).`,
        explanation: `Scanning left-to-right: check if child ${i} has a higher rating than their immediate left neighbor child ${i - 1}.`,
      }),
    );

    const isHigher = ratings[i] > ratings[i - 1];
    const needed = candies[i - 1] + 1;

    // Frame: Line 5 - if ratings[i] > ratings[i-1]:
    frames.push(
      Object.freeze({
        activeLine: 5,
        phase: "compare",
        pass: "left-to-right",
        direction: "ltr",
        i,
        compareIndex: i - 1,
        candies: Object.freeze([...candies]),
        totalCandies: candies.reduce((a, b) => a + b, 0),
        previousCandy: candies[i],
        neededCandy: needed,
        newCandy: isHigher ? needed : null,
        conditionMet: isHigher,
        message: isHigher
          ? `Check ratings[${i}] (${ratings[i]}) > ratings[${i - 1}] (${ratings[i - 1]}): True.`
          : `Check ratings[${i}] (${ratings[i]}) > ratings[${i - 1}] (${ratings[i - 1]}): False.`,
        explanation: isHigher
          ? `Right-slope detected: child ${i} rating (${ratings[i]}) strictly exceeds left neighbor's rating (${ratings[i - 1]}). Child ${i} must receive candies[${i - 1}] + 1 = ${needed} candies.`
          : `Child ${i} rating (${ratings[i]}) is not greater than left neighbor's rating (${ratings[i - 1]}). Equal or lower ratings do not require extra candy in this direction.`,
      }),
    );

    if (isHigher) {
      const prev = candies[i];
      candies[i] = needed;

      // Frame: Line 6 - candies[i] = candies[i-1] + 1
      frames.push(
        Object.freeze({
          activeLine: 6,
          phase: "update",
          pass: "left-to-right",
          direction: "ltr",
          i,
          compareIndex: i - 1,
          candies: Object.freeze([...candies]),
          totalCandies: candies.reduce((a, b) => a + b, 0),
          previousCandy: prev,
          neededCandy: needed,
          newCandy: candies[i],
          conditionMet: true,
          message: `Update candies[${i}] = candies[${i - 1}] + 1 = ${candies[i - 1] - 1 + 1} = ${candies[i]}.`,
          explanation: `Child ${i} candy count increased from ${prev} to ${candies[i]} (1 more than left neighbor child ${i - 1}'s ${candies[i - 1]} candies).`,
        }),
      );
    }
  }

  // Right-to-left pass: Rewarding left-slopes (ratings[i] > ratings[i+1])
  for (let i = n - 2; i >= 0; i--) {
    // Frame: Line 7 - for i in range(n-2, -1, -1):
    frames.push(
      Object.freeze({
        activeLine: 7,
        phase: "loop",
        pass: "right-to-left",
        direction: "rtl",
        i,
        compareIndex: i + 1,
        candies: Object.freeze([...candies]),
        totalCandies: candies.reduce((a, b) => a + b, 0),
        previousCandy: candies[i],
        neededCandy: null,
        newCandy: null,
        conditionMet: null,
        message: `Right pass (i = ${i}): Inspect child ${i} (rating ${ratings[i]}) and right neighbor ${i + 1} (rating ${ratings[i + 1]}).`,
        explanation: `Scanning right-to-left: check if child ${i} has a higher rating than their immediate right neighbor child ${i + 1}.`,
      }),
    );

    const isHigher = ratings[i] > ratings[i + 1];
    const needed = candies[i + 1] + 1;
    const target = Math.max(candies[i], needed);

    // Frame: Line 8 - if ratings[i] > ratings[i+1]:
    frames.push(
      Object.freeze({
        activeLine: 8,
        phase: "compare",
        pass: "right-to-left",
        direction: "rtl",
        i,
        compareIndex: i + 1,
        candies: Object.freeze([...candies]),
        totalCandies: candies.reduce((a, b) => a + b, 0),
        previousCandy: candies[i],
        neededCandy: needed,
        newCandy: isHigher ? target : null,
        conditionMet: isHigher,
        message: isHigher
          ? `Check ratings[${i}] (${ratings[i]}) > ratings[${i + 1}] (${ratings[i + 1]}): True.`
          : `Check ratings[${i}] (${ratings[i]}) > ratings[${i + 1}] (${ratings[i + 1]}): False.`,
        explanation: isHigher
          ? `Left-slope detected: child ${i} rating (${ratings[i]}) strictly exceeds right neighbor's rating (${ratings[i + 1]}). Must ensure candies[${i}] >= candies[${i + 1}] + 1 (${needed}) while keeping left-pass requirement.`
          : `Child ${i} rating (${ratings[i]}) is not greater than right neighbor's rating (${ratings[i + 1]}). No adjustment required.`,
      }),
    );

    if (isHigher) {
      const prev = candies[i];
      candies[i] = target;

      // Frame: Line 9 - candies[i] = max(candies[i], candies[i+1] + 1)
      frames.push(
        Object.freeze({
          activeLine: 9,
          phase: "update",
          pass: "right-to-left",
          direction: "rtl",
          i,
          compareIndex: i + 1,
          candies: Object.freeze([...candies]),
          totalCandies: candies.reduce((a, b) => a + b, 0),
          previousCandy: prev,
          neededCandy: needed,
          newCandy: candies[i],
          conditionMet: true,
          message: prev >= needed
            ? `candies[${i}] = max(${prev}, ${needed}) = ${candies[i]} (already satisfied from left pass).`
            : `Update candies[${i}] = max(${prev}, ${needed}) = ${candies[i]} (raised by ${candies[i] - prev} for right neighbor).`,
          explanation: prev >= needed
            ? `Child ${i} already had ${prev} candies from the left pass, which is >= ${needed}. The max() function preserves this higher allocation without decreasing it.`
            : `Child ${i} had ${prev} candies from the left pass, but needs ${needed} to exceed right neighbor child ${i + 1} (${candies[i + 1]}). Updated to ${candies[i]}.`,
        }),
      );
    }
  }

  const totalCandies = candies.reduce((a, b) => a + b, 0);

  // Frame: Line 10 - return sum(candies)
  frames.push(
    Object.freeze({
      activeLine: 10,
      phase: "done",
      pass: "done",
      direction: "none",
      i: -1,
      compareIndex: -1,
      candies: Object.freeze([...candies]),
      totalCandies,
      previousCandy: null,
      neededCandy: null,
      newCandy: null,
      conditionMet: null,
      message: `Complete! All neighbor constraints satisfied with ${totalCandies} total candies: [${candies.join(", ")}].`,
      explanation: `Optimal two-pass greedy distribution reached in O(n) time and O(n) space. Each child has at least 1 candy, and all local rating comparisons are satisfied.`,
    }),
  );

  return {
    ratings,
    candies: Object.freeze([...candies]),
    totalCandies,
    frames,
  };
}

// ─── Statement contract: parseInput / buildTrace / code / python ───
const MAX_CHILDREN = 40
export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be JSON, e.g. {"ratings": [1,0,2]}.') }
  if (!data || typeof data !== 'object' || !Array.isArray(data.ratings)) throw new Error('Input must be an object with a "ratings" array.')
  if (data.ratings.length < 1 || data.ratings.length > MAX_CHILDREN) throw new Error(`Use between 1 and ${MAX_CHILDREN} children for this trace.`)
  for (const v of data.ratings) if (!Number.isInteger(v) || v < 0 || v > 1000) throw new Error('Ratings must be integers from 0 to 1000.')
  return { ratings: data.ratings }
}

export function buildTrace(input) {
  const r = input.ratings
  const n = r.length
  const candies = Array(n).fill(1)
  const frames = [{ activeLine: L('candies = all ones'), phase: 'init', i: 0, candies: [...candies], message: 'Everyone starts with one candy.' }]
  for (let i = 1; i < n; i++) {
    if (r[i] > r[i - 1]) candies[i] = candies[i - 1] + 1
    frames.push({ activeLine: L('left-to-right'), phase: 'left', i, candies: [...candies], message: `Left pass at ${i}: rating ${r[i]} vs ${r[i - 1]} gives ${candies[i]} candies.` })
  }
  for (let i = n - 2; i >= 0; i--) {
    if (r[i] > r[i + 1]) candies[i] = Math.max(candies[i], candies[i + 1] + 1)
    frames.push({ activeLine: L('right-to-left'), phase: 'right', i, candies: [...candies], message: `Right pass at ${i}: keep at least the right neighbour's count plus one when needed.` })
  }
  const result = candies.reduce((a, b) => a + b, 0)
  frames.push({ activeLine: L('return the sum'), phase: 'done', i: null, candies: [...candies], message: `Minimum total is ${result} candies.` })
  return { input, result, frames }
}

export const code = [
  { line: 1, text: 'minimum candies so higher-rated neighbours get more' },
  { line: 2, text: 'candies = all ones' },
  { line: 3, text: 'left-to-right pass over the children' },
  { line: 4, text: 'if rating i is above rating i - 1, candies i = candies i - 1 plus 1' },
  { line: 5, text: 'right-to-left pass over the children' },
  { line: 6, text: 'if rating i is above rating i + 1, candies i = max of its count and candies i + 1 plus 1' },
  { line: 7, text: 'return the sum of candies' },
]
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def candy(ratings):
    n = len(ratings)
    candies = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            candies[i] = candies[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            candies[i] = max(candies[i], candies[i + 1] + 1)
    return sum(candies)
`
