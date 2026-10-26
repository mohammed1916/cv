export const CODE = [
  "def longestConsecutive(nums):",
  "    num_set = set(nums)",
  "    longest = 0",
  "    for num in num_set:",
  "        if num - 1 not in num_set:",
  "            curr = num",
  "            streak = 1",
  "            while curr + 1 in num_set:",
  "                curr += 1",
  "                streak += 1",
  "            longest = max(longest, streak)",
  "    return longest",
];

export function parseNumsInput(input) {
  if (input == null) {
    throw new Error("Input cannot be empty");
  }

  let raw;
  if (typeof input === "string") {
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
        throw new Error("Invalid JSON format for numbers array");
      }
    } else if (
      trimmed.startsWith("[") ||
      trimmed.endsWith("]") ||
      trimmed.startsWith("{") ||
      trimmed.endsWith("}")
    ) {
      throw new Error("Invalid JSON format for numbers array");
    } else {
      const parts = trimmed.split(",");
      raw = parts.map((part) => {
        const item = part.trim();
        if (item === "") {
          throw new Error("Empty value in comma-separated numbers");
        }
        const num = Number(item);
        if (!Number.isFinite(num)) {
          throw new Error(`Invalid integer: "${item}"`);
        }
        return num;
      });
    }
  } else if (Array.isArray(input)) {
    raw = input;
  } else {
    throw new Error("Input must be an array or comma-separated string of integers");
  }

  if (!Array.isArray(raw)) {
    throw new Error("Input must be an array of integers");
  }

  if (raw.length > 100) {
    throw new Error("Array exceeds maximum limit of 100 numbers for visualization");
  }

  const parsed = raw.map((val, idx) => {
    if (typeof val !== "number" || !Number.isFinite(val) || !Number.isInteger(val)) {
      throw new Error(
        `Element at index ${idx} must be an integer, got ${JSON.stringify(val)}`,
      );
    }
    if (val < -1000000000 || val > 1000000000) {
      throw new Error(
        `Element at index ${idx} (${val}) exceeds allowed range [-1,000,000,000, 1,000,000,000]`,
      );
    }
    return val;
  });

  return Object.freeze(parsed);
}

export function buildConsecutiveStory(input) {
  const nums = parseNumsInput(input);
  const numSet = new Set(nums);
  const uniqueArr = [...numSet];

  const uniqueSet = [...uniqueArr];
  Object.defineProperty(uniqueSet, "size", {
    get: () => numSet.size,
    enumerable: false,
  });
  uniqueSet.has = (v) => numSet.has(v);

  let longest = 0;
  let bestSequence = [];
  const frames = [];
  const visitedStarts = [];
  const skippedNums = [];

  // Frame 1: Building hash set (Line 2)
  frames.push({
    activeLine: 2,
    phase: "init",
    num: null,
    curr: null,
    streak: 0,
    longest: 0,
    hasLeftNeighbor: null,
    leftNeighbor: null,
    currentSequence: [],
    bestSequence: [],
    visitedStarts: [],
    skippedNums: [],
    message:
      nums.length === 0
        ? "Input array is empty."
        : `Built hash set with ${numSet.size} unique value${numSet.size === 1 ? "" : "s"} from ${nums.length} input element${nums.length === 1 ? "" : "s"}.`,
    explanation:
      nums.length === 0
        ? "Empty array: converted to an empty hash set."
        : `Constructed hash set num_set containing ${numSet.size} unique numbers. Hash set lookups allow average O(1) checks for num - 1 and curr + 1.`,
  });

  // Frame 2: Initialize longest = 0 (Line 3)
  frames.push({
    activeLine: 3,
    phase: "init",
    num: null,
    curr: null,
    streak: 0,
    longest: 0,
    hasLeftNeighbor: null,
    leftNeighbor: null,
    currentSequence: [],
    bestSequence: [],
    visitedStarts: [],
    skippedNums: [],
    message: "Initialized longest = 0.",
    explanation:
      "Initialized longest streak counter to 0. This tracks the maximum consecutive sequence length encountered.",
  });

  if (nums.length === 0) {
    frames.push({
      activeLine: 12,
      phase: "done",
      num: null,
      curr: null,
      streak: 0,
      longest: 0,
      hasLeftNeighbor: null,
      leftNeighbor: null,
      currentSequence: [],
      bestSequence: [],
      visitedStarts: [],
      skippedNums: [],
      message: "Array is empty. Return longest = 0.",
      explanation:
        "No numbers to inspect. The longest consecutive sequence length for an empty array is 0.",
    });

    return {
      nums,
      uniqueSet,
      longestStreak: 0,
      bestSequence: [],
      frames,
    };
  }

  for (const num of numSet) {
    const leftNeighbor = num - 1;
    const hasLeftNeighbor = numSet.has(leftNeighbor);

    if (hasLeftNeighbor) {
      skippedNums.push(num);
      frames.push({
        activeLine: 5,
        phase: "scan",
        num,
        curr: null,
        streak: 0,
        longest,
        hasLeftNeighbor: true,
        leftNeighbor,
        currentSequence: [],
        bestSequence: [...bestSequence],
        visitedStarts: [...visitedStarts],
        skippedNums: [...skippedNums],
        message: `${leftNeighbor} is in set → ${num} is not a sequence start, skipping.`,
        explanation: `Inspecting ${num}: Left neighbor num - 1 = ${leftNeighbor} exists in the set. That means ${num} is part of a consecutive run that began earlier. Skipping ${num} ensures each sequence is traversed only once from its true head, keeping total time O(n).`,
      });
    } else {
      visitedStarts.push(num);
      frames.push({
        activeLine: 5,
        phase: "scan",
        num,
        curr: num,
        streak: 1,
        longest,
        hasLeftNeighbor: false,
        leftNeighbor,
        currentSequence: [num],
        bestSequence: [...bestSequence],
        visitedStarts: [...visitedStarts],
        skippedNums: [...skippedNums],
        message: `${leftNeighbor} NOT in set → ${num} is a sequence start!`,
        explanation: `Inspecting ${num}: Left neighbor num - 1 = ${leftNeighbor} is NOT in the set! Therefore, ${num} is the beginning of a consecutive sequence.`,
      });

      let curr = num;
      let streak = 1;
      const currentSequence = [num];

      frames.push({
        activeLine: 7,
        phase: "chain",
        num,
        curr,
        streak,
        longest,
        hasLeftNeighbor: false,
        leftNeighbor,
        currentSequence: [...currentSequence],
        bestSequence: [...bestSequence],
        visitedStarts: [...visitedStarts],
        skippedNums: [...skippedNums],
        message: `Start chain: [${curr}], streak = 1.`,
        explanation: `Initialized sequence run at curr = ${curr} with streak = 1. We now scan forward while curr + 1 is in the set.`,
      });

      while (numSet.has(curr + 1)) {
        curr += 1;
        streak += 1;
        currentSequence.push(curr);

        frames.push({
          activeLine: 9,
          phase: "expand",
          num,
          curr,
          streak,
          longest,
          hasLeftNeighbor: false,
          leftNeighbor,
          currentSequence: [...currentSequence],
          bestSequence: [...bestSequence],
          visitedStarts: [...visitedStarts],
          skippedNums: [...skippedNums],
          message: `Found ${curr} in set → streak = ${streak}. Chain: [${currentSequence.join(" → ")}].`,
          explanation: `Found consecutive successor ${curr} (${curr - 1} + 1) in the set! Extended streak to ${streak}. Current chain: [${currentSequence.join(", ")}].`,
        });
      }

      const prevLongest = longest;
      const isNewLongest = streak > longest;
      if (isNewLongest) {
        longest = streak;
        bestSequence = [...currentSequence];
      }

      frames.push({
        activeLine: 11,
        phase: "update",
        num,
        curr,
        streak,
        longest,
        hasLeftNeighbor: false,
        leftNeighbor,
        nextMissing: curr + 1,
        isNewLongest,
        currentSequence: [...currentSequence],
        bestSequence: [...bestSequence],
        visitedStarts: [...visitedStarts],
        skippedNums: [...skippedNums],
        message: isNewLongest
          ? `New longest streak: ${longest}! (${currentSequence[0]} to ${curr})`
          : `Chain ended (streak = ${streak}). Longest remains ${longest}.`,
        explanation: `${curr + 1} is not in the set, terminating this chain. Run length = ${streak}. ` +
          (isNewLongest
            ? `New record: longest = max(${prevLongest}, ${streak}) = ${longest}.`
            : `Streak of ${streak} does not beat record longest = ${longest}.`),
      });
    }
  }

  frames.push({
    activeLine: 12,
    phase: "done",
    num: null,
    curr: null,
    streak: longest,
    longest,
    hasLeftNeighbor: null,
    leftNeighbor: null,
    currentSequence: [],
    bestSequence: [...bestSequence],
    visitedStarts: [...visitedStarts],
    skippedNums: [...skippedNums],
    message: `Done! Longest consecutive sequence length: ${longest}.`,
    explanation: `Search complete across all ${numSet.size} unique values. The longest consecutive sequence has length ${longest}${bestSequence.length > 0 ? `: [${bestSequence.join(", ")}]` : ""}. Overall time complexity is O(n).`,
  });

  return {
    nums,
    uniqueSet,
    longestStreak: longest,
    bestSequence,
    frames,
  };
}
