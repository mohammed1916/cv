export const CODE = [
  "def singleNumber(nums):",
  "    ones, twos = 0, 0",
  "    for num in nums:",
  "        ones = (ones ^ num) & ~twos",
  "        twos = (twos ^ num) & ~ones",
  "    return ones",
];

/**
 * Parses input into an array of 32-bit signed integers where every element
 * appears exactly three times except for one single element that appears once.
 *
 * @param {string|number[]} input - Array of numbers or JSON/CSV string representation.
 * @returns {number[]} Validated array of numbers.
 */
export function parseNumsInput(input) {
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
        throw new Error("Invalid JSON format for array");
      }
    } else if (
      trimmed.startsWith("[") ||
      trimmed.endsWith("]") ||
      trimmed.startsWith("{") ||
      trimmed.endsWith("}")
    ) {
      throw new Error("Invalid JSON array format");
    } else {
      const parts = trimmed.split(",");
      raw = parts.map((part) => {
        const item = part.trim();
        if (item === "") {
          throw new Error("Empty number token in comma-separated input");
        }
        const num = Number(item);
        if (!Number.isFinite(num)) {
          throw new Error(`Invalid number "${item}"`);
        }
        return num;
      });
    }
  } else {
    throw new Error("Input must be an array of integers or a string");
  }

  if (!Array.isArray(raw)) {
    throw new Error("Input must be an array of integers");
  }

  if (raw.length === 0) {
    throw new Error("Input array cannot be empty");
  }

  if (raw.length > 100) {
    throw new Error("Input array exceeds maximum length of 100");
  }

  const nums = raw.map((val, idx) => {
    if (typeof val !== "number" || !Number.isInteger(val) || !Number.isFinite(val)) {
      throw new Error(`Element at index ${idx} is not an integer: ${JSON.stringify(val)}`);
    }
    if (val < -2147483648 || val > 2147483647) {
      throw new Error(`Integer at index ${idx} out of 32-bit signed range: ${val}`);
    }
    return val;
  });

  // Verify frequency constraint:
  // Every element must appear exactly 3 times except 1 appearing once.
  const counts = new Map();
  for (const n of nums) {
    counts.set(n, (counts.get(n) || 0) + 1);
  }

  let singleCount = 0;
  for (const [, freq] of counts.entries()) {
    if (freq === 1) {
      singleCount++;
    } else if (freq !== 3) {
      throw new Error(
        "Every element must appear exactly 3 times except one element that appears once."
      );
    }
  }

  if (singleCount !== 1) {
    throw new Error(
      "Every element must appear exactly 3 times except one element that appears once."
    );
  }

  return nums;
}

/**
 * Determines a suitable bit display width (4, 8, 16, or 32) for visualization.
 */
export function determineBitWidth(nums) {
  let min = Infinity;
  let max = -Infinity;
  for (const n of nums) {
    if (n < min) min = n;
    if (n > max) max = n;
  }

  if (min >= 0) {
    if (max <= 15) return 4;
    if (max <= 255) return 8;
    if (max <= 65535) return 16;
    return 32;
  }

  if (min >= -128 && max <= 127) return 8;
  if (min >= -32768 && max <= 32767) return 16;
  return 32;
}

/**
 * Formats a signed 32-bit integer as a binary string padded to bitWidth.
 */
export function toBinaryString(val, bitWidth = 8) {
  const mask = bitWidth === 32 ? 0xffffffff : (1 << bitWidth) - 1;
  const unsigned = (val & mask) >>> 0;
  return unsigned.toString(2).padStart(bitWidth, "0");
}

/**
 * Extracts snapshot of bit states across bitWidth.
 */
function getBitStates(ones, twos, bitWidth) {
  const states = [];
  for (let k = bitWidth - 1; k >= 0; k--) {
    const oBit = (ones >>> k) & 1;
    const tBit = (twos >>> k) & 1;
    const count = tBit === 1 ? 2 : oBit === 1 ? 1 : 0;
    states.push({
      bitIndex: k,
      bitLabel: `b${k}`,
      onesBit: oBit,
      twosBit: tBit,
      count,
      state: `${tBit}${oBit}`,
    });
  }
  return states;
}

/**
 * Computes transition details for each bit when processing num.
 */
function getBitTransitions(num, prevOnes, prevTwos, nextOnes, nextTwos, bitWidth, stage) {
  const transitions = [];
  for (let k = bitWidth - 1; k >= 0; k--) {
    const numBit = (num >>> k) & 1;
    const pOBit = (prevOnes >>> k) & 1;
    const pTBit = (prevTwos >>> k) & 1;
    const pCount = pTBit === 1 ? 2 : pOBit === 1 ? 1 : 0;

    const nOBit = (nextOnes >>> k) & 1;
    const nTBit = (nextTwos >>> k) & 1;
    const nCount = nTBit === 1 ? 2 : nOBit === 1 ? 1 : 0;

    let transitionNote = "bit is 0 — state unchanged";
    if (numBit === 1) {
      if (pCount === 0) {
        transitionNote = "00 → 01 (Count 0 → 1: added to ones)";
      } else if (pCount === 1) {
        transitionNote = "01 → 10 (Count 1 → 2: moved to twos)";
      } else {
        transitionNote = "10 → 00 (Count 2 → 0: 3 occurrences reset!)";
      }
    }

    transitions.push({
      bitIndex: k,
      bitLabel: `b${k}`,
      incomingBit: numBit,
      prevOnesBit: pOBit,
      prevTwosBit: pTBit,
      prevCount: pCount,
      prevState: `${pTBit}${pOBit}`,
      nextOnesBit: nOBit,
      nextTwosBit: nTBit,
      nextCount: nCount,
      nextState: `${nTBit}${nOBit}`,
      changed: numBit === 1,
      stage,
      transitionNote,
    });
  }
  return transitions;
}

/**
 * Builds the visual story for Problem 137 Single Number II.
 *
 * @param {string|number[]} input - Input array or string.
 * @returns {{ nums: number[], singleVal: number, bitWidth: number, frames: object[] }}
 */
export function buildSingleNumber2Story(input) {
  const nums = parseNumsInput(input);
  const bitWidth = determineBitWidth(nums);

  // Compute singleVal directly (element with frequency 1)
  const counts = new Map();
  for (const n of nums) {
    counts.set(n, (counts.get(n) || 0) + 1);
  }
  let singleVal = nums[0];
  for (const [val, freq] of counts.entries()) {
    if (freq === 1) {
      singleVal = val;
      break;
    }
  }

  const frames = [];

  let ones = 0;
  let twos = 0;

  // Frame 1: Line 2 - Initialize ones and twos
  frames.push({
    activeLine: 2,
    phase: "init",
    currentIndex: -1,
    currentNum: null,
    ones: 0,
    twos: 0,
    prevOnes: 0,
    prevTwos: 0,
    intermediateOnes: 0,
    bitWidth,
    processedIndices: [],
    bitStates: getBitStates(0, 0, bitWidth),
    bitTransitions: null,
    singleVal: null,
    message: "Initialize bit counters: ones = 0, twos = 0.",
    explanation:
      "ones tracks bits that have appeared 1 time (mod 3), and twos tracks bits that have appeared 2 times (mod 3). Together (twos, ones) form a 3-state finite state machine (00 → 01 → 10 → 00) for each bit position.",
    relatedLines: [2],
  });

  const processedIndices = [];

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const prevOnes = ones;
    const prevTwos = twos;

    // Frame A: Line 3 - Loop start for nums[i]
    frames.push({
      activeLine: 3,
      phase: "loop",
      currentIndex: i,
      currentNum: num,
      ones: prevOnes,
      twos: prevTwos,
      prevOnes,
      prevTwos,
      intermediateOnes: prevOnes,
      bitWidth,
      processedIndices: [...processedIndices],
      bitStates: getBitStates(prevOnes, prevTwos, bitWidth),
      bitTransitions: getBitTransitions(num, prevOnes, prevTwos, prevOnes, prevTwos, bitWidth, "inspect"),
      singleVal: null,
      message: `Process nums[${i}] = ${num} (binary: 0b${toBinaryString(num, bitWidth)})`,
      explanation: `Inspecting number ${num}. For each bit position where ${num} has bit 1, its 3-state counter will advance: 00 → 01 → 10 → 00. Bits with 0 remain unchanged.`,
      relatedLines: [3],
    });

    // Frame B: Line 4 - Update ones
    const nextOnes = (prevOnes ^ num) & ~prevTwos;
    frames.push({
      activeLine: 4,
      phase: "update",
      subphase: "ones",
      currentIndex: i,
      currentNum: num,
      ones: nextOnes,
      twos: prevTwos,
      prevOnes,
      prevTwos,
      intermediateOnes: nextOnes,
      bitWidth,
      processedIndices: [...processedIndices],
      bitStates: getBitStates(nextOnes, prevTwos, bitWidth),
      bitTransitions: getBitTransitions(num, prevOnes, prevTwos, nextOnes, prevTwos, bitWidth, "ones_updated"),
      singleVal: null,
      message: `ones = (ones ^ ${num}) & ~twos → ${nextOnes} (binary: 0b${toBinaryString(nextOnes, bitWidth)})`,
      explanation: `Toggled ones with ${num} and masked out bits in twos (~twos = 0b${toBinaryString(~prevTwos, bitWidth)}). Bits previously at count 0 become 1; bits at count 1 temporarily clear to 0; bits at count 2 stay 0.`,
      relatedLines: [4],
    });

    // Frame C: Line 5 - Update twos
    const nextTwos = (prevTwos ^ num) & ~nextOnes;
    ones = nextOnes;
    twos = nextTwos;
    processedIndices.push(i);

    frames.push({
      activeLine: 5,
      phase: "update",
      subphase: "twos",
      currentIndex: i,
      currentNum: num,
      ones: nextOnes,
      twos: nextTwos,
      prevOnes,
      prevTwos,
      intermediateOnes: nextOnes,
      bitWidth,
      processedIndices: [...processedIndices],
      bitStates: getBitStates(nextOnes, nextTwos, bitWidth),
      bitTransitions: getBitTransitions(num, prevOnes, prevTwos, nextOnes, nextTwos, bitWidth, "twos_updated"),
      singleVal: null,
      message: `twos = (twos ^ ${num}) & ~ones → ${nextTwos} (binary: 0b${toBinaryString(nextTwos, bitWidth)})`,
      explanation: `Toggled twos with ${num} and masked out new ones (~ones = 0b${toBinaryString(~nextOnes, bitWidth)}). Bits advancing from count 1 are now set in twos; bits advancing from count 2 reset to 0. (twos, ones) transition complete.`,
      relatedLines: [5],
    });
  }

  // Frame Final: Line 6 - Return ones
  frames.push({
    activeLine: 6,
    phase: "done",
    currentIndex: nums.length,
    currentNum: null,
    ones,
    twos,
    prevOnes: ones,
    prevTwos: twos,
    intermediateOnes: ones,
    bitWidth,
    processedIndices: [...processedIndices],
    bitStates: getBitStates(ones, twos, bitWidth),
    bitTransitions: null,
    singleVal: ones,
    message: `Return ones = ${ones}. Single number identified!`,
    explanation: `All elements that appeared 3 times completed the full cycle (00 → 01 → 10 → 00) and returned to 0 in both ones and twos. Only ${ones} appeared once, leaving its bits set in ones.`,
    relatedLines: [6],
  });

  return {
    nums,
    singleVal,
    bitWidth,
    frames,
  };
}
