export const CODE = [
  "def singleNumber(nums):",
  "    result = 0",
  "    for num in nums:",
  "        result ^= num",
  "    return result",
];

/**
 * Validates and parses array input of integers.
 * Accepts arrays of numbers or strings, JSON array strings, or comma/space-separated strings.
 */
export function parseNumsInput(input) {
  if (input === null || input === undefined) {
    throw new Error("Input cannot be empty");
  }

  let parsed = input;

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error("Input cannot be empty");
    }

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        try {
          parsed = JSON.parse(trimmed.replace(/'/g, '"'));
        } catch {
          throw new Error("Invalid JSON format: must be an array of integers like [2,2,1]");
        }
      }
    } else {
      const parts = trimmed.split(/[\s,]+/).filter(Boolean);
      if (parts.length === 0) {
        throw new Error("Input cannot be empty");
      }
      parsed = parts.map((p) => {
        const n = Number(p);
        if (Number.isNaN(n)) {
          throw new Error(`Invalid number "${p}": all items must be integers`);
        }
        return n;
      });
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Input must be an array of integers");
  }

  if (parsed.length === 0) {
    throw new Error("Array must contain at least one integer");
  }

  if (parsed.length > 100) {
    throw new Error("Array exceeds maximum supported length of 100");
  }

  const result = [];
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (item === null || item === undefined || typeof item === "boolean") {
      throw new Error(`Invalid element at index ${i}: must be an integer`);
    }
    const num = Number(item);
    if (!Number.isInteger(num)) {
      throw new Error(`Invalid element at index ${i} (${item}): must be an integer`);
    }
    if (num < -2147483648 || num > 2147483647) {
      throw new Error(`Integer at index ${i} (${num}) is outside 32-bit integer range`);
    }
    result.push(num);
  }

  return result;
}

/**
 * Determines an optimal bit width (4, 8, 12, 16, or 32) for visual representation.
 */
export function computeBitWidth(nums) {
  let min = 0;
  let max = 0;
  for (const n of nums) {
    if (n < min) min = n;
    if (n > max) max = n;
  }

  if (min < 0) {
    if (min >= -8 && max <= 7) return 4;
    if (min >= -128 && max <= 127) return 8;
    if (min >= -2048 && max <= 2047) return 12;
    if (min >= -32768 && max <= 32767) return 16;
    return 32;
  }

  if (max <= 15) return 4;
  if (max <= 255) return 8;
  if (max <= 4095) return 12;
  if (max <= 65535) return 16;
  return 32;
}

/**
 * Converts a 32-bit integer to a padded two's complement binary string.
 */
export function toBinaryString(val, bitWidth = 8) {
  const unsigned = BigInt.asUintN(bitWidth, BigInt(val));
  return unsigned.toString(2).padStart(bitWidth, "0");
}

/**
 * Computes bit-level XOR operations and explanations between two integers.
 */
export function computeBitOps(prevVal, numVal, bitWidth) {
  const ops = [];
  const prevBin = toBinaryString(prevVal, bitWidth);
  const numBin = toBinaryString(numVal, bitWidth);
  const resBin = toBinaryString(prevVal ^ numVal, bitWidth);

  for (let i = 0; i < bitWidth; i++) {
    const bitIndex = bitWidth - 1 - i;
    const pBit = Number(prevBin[i]);
    const nBit = Number(numBin[i]);
    const rBit = Number(resBin[i]);
    let action = "zero";
    let actionLabel = "0 ^ 0 = 0";
    if (pBit === 1 && nBit === 1) {
      action = "cancel";
      actionLabel = "1 ^ 1 = 0 (Cancels!)";
    } else if (pBit === 0 && nBit === 1) {
      action = "set";
      actionLabel = "0 ^ 1 = 1 (Toggled On)";
    } else if (pBit === 1 && nBit === 0) {
      action = "keep";
      actionLabel = "1 ^ 0 = 1 (Preserved)";
    }
    ops.push({
      bitIndex,
      position: i,
      weight: 1 << bitIndex,
      prevBit: pBit,
      numBit: nBit,
      resultBit: rBit,
      action,
      actionLabel,
    });
  }
  return ops;
}

/**
 * Builds the visual story for Problem 136 (Single Number).
 * Returns { nums, singleVal, bitWidth, tableRows, bitColumns, frames }.
 */
export function buildSingleNumberStory(input) {
  const nums = parseNumsInput(input);
  const bitWidth = computeBitWidth(nums);

  // Frequency analysis
  const freqMap = new Map();
  for (const n of nums) {
    freqMap.set(n, (freqMap.get(n) || 0) + 1);
  }

  // Pre-calculate cumulative result
  let expectedSingle = 0;
  for (const n of nums) {
    expectedSingle ^= n;
  }

  // Identify pair groupings
  const indicesByValue = new Map();
  nums.forEach((val, idx) => {
    if (!indicesByValue.has(val)) indicesByValue.set(val, []);
    indicesByValue.get(val).push(idx);
  });

  const pairIdByValue = new Map();
  let nextPairId = 1;
  for (const [val, indices] of indicesByValue.entries()) {
    if (indices.length >= 2) {
      pairIdByValue.set(val, nextPairId++);
    }
  }

  // Table bit columns (MSB down to LSB)
  const bitColumns = [];
  for (let k = bitWidth - 1; k >= 0; k--) {
    let onesCount = 0;
    for (let r = 0; r < nums.length; r++) {
      const bit = Number((BigInt.asUintN(bitWidth, BigInt(nums[r])) >> BigInt(k)) & 1n);
      if (bit === 1) onesCount++;
    }
    const resultBit = Number((BigInt.asUintN(bitWidth, BigInt(expectedSingle)) >> BigInt(k)) & 1n);
    bitColumns.push({
      bitIndex: k,
      weight: 1 << k,
      weightLabel: k === 0 ? "2⁰ (1)" : k === 1 ? "2¹ (2)" : k === 2 ? "2² (4)" : k === 3 ? "2³ (8)" : `2^${k}`,
      onesCount,
      parity: onesCount % 2,
      resultBit,
    });
  }

  // Table rows for all numbers
  const tableRows = nums.map((val, idx) => {
    const binary = toBinaryString(val, bitWidth);
    const bits = [];
    for (let k = bitWidth - 1; k >= 0; k--) {
      bits.push(Number((BigInt.asUintN(bitWidth, BigInt(val)) >> BigInt(k)) & 1n));
    }
    const isDuplicate = (freqMap.get(val) || 0) > 1;
    const pairId = pairIdByValue.get(val) || null;
    const isSingle = val === expectedSingle && (freqMap.get(val) || 0) % 2 === 1;

    return {
      index: idx,
      value: val,
      binary,
      bits,
      isDuplicate,
      pairId,
      isSingle,
    };
  });

  const frames = [];
  let currentResult = 0;
  const seenIndices = new Map();
  const cancelledIndices = [];
  const cumulativeHistory = [
    {
      index: -1,
      label: "Initial",
      val: 0,
      prev: 0,
      result: 0,
      resultBin: toBinaryString(0, bitWidth),
    },
  ];

  // Frame 0: Init result = 0 (Line 2)
  frames.push({
    activeLine: 2,
    phase: "init",
    currentIndex: -1,
    currentNum: null,
    prevResult: 0,
    result: 0,
    prevResultBin: toBinaryString(0, bitWidth),
    currentNumBin: null,
    resultBin: toBinaryString(0, bitWidth),
    bitWidth,
    bitOperations: [],
    cancelledIndices: [],
    activePair: null,
    cumulativeHistory: [...cumulativeHistory],
    message: `Initialize result = 0 (binary: ${toBinaryString(0, bitWidth)})`,
    explanation:
      "Bitwise XOR with 0 is an identity operation (x ^ 0 = x). Initializing result to 0 ensures the first element will be stored cleanly into the accumulator.",
    relatedLines: [2],
  });

  // Iterate over nums
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const oldResult = currentResult;
    const isAlreadySeen = seenIndices.has(num);

    // Frame: Loop iteration header (Line 3)
    frames.push({
      activeLine: 3,
      phase: "loop",
      currentIndex: i,
      currentNum: num,
      prevResult: oldResult,
      result: oldResult,
      prevResultBin: toBinaryString(oldResult, bitWidth),
      currentNumBin: toBinaryString(num, bitWidth),
      resultBin: toBinaryString(oldResult, bitWidth),
      bitWidth,
      bitOperations: [],
      cancelledIndices: [...cancelledIndices],
      activePair: null,
      cumulativeHistory: [...cumulativeHistory],
      message: `Loop item ${i + 1}/${nums.length}: inspect num = ${num} (binary: ${toBinaryString(num, bitWidth)})`,
      explanation: isAlreadySeen
        ? `Inspecting nums[${i}] = ${num}. This number previously appeared at index ${seenIndices.get(
            num
          )}. Applying XOR will cancel both identical numbers (a ^ a = 0).`
        : `Inspecting nums[${i}] = ${num}. Next, we compute result ^= ${num} to update the accumulator.`,
      relatedLines: [3],
    });

    // Perform XOR
    currentResult ^= num;
    const newResult = currentResult;
    const bitOps = computeBitOps(oldResult, num, bitWidth);
    let activePair = null;

    if (isAlreadySeen) {
      const firstIdx = seenIndices.get(num);
      cancelledIndices.push(firstIdx, i);
      seenIndices.delete(num);
      activePair = {
        val: num,
        firstIndex: firstIdx,
        secondIndex: i,
      };
    } else {
      seenIndices.set(num, i);
    }

    cumulativeHistory.push({
      index: i,
      label: `XOR ${num}`,
      val: num,
      prev: oldResult,
      result: newResult,
      resultBin: toBinaryString(newResult, bitWidth),
      activePair,
    });

    // Frame: XOR step (Line 4)
    const cancelledBitsCount = bitOps.filter((o) => o.action === "cancel").length;
    const setBitsCount = bitOps.filter((o) => o.action === "set").length;

    const xorExplanation = activePair
      ? `Self-cancellation (a ^ a = 0): Number ${num} matches previous occurrence at index ${activePair.firstIndex}. ${cancelledBitsCount} bit(s) cancelled out to 0. Accumulator changes from ${oldResult} (${toBinaryString(
          oldResult,
          bitWidth
        )}) to ${newResult} (${toBinaryString(newResult, bitWidth)}).`
      : `Accumulating ${num}: ${setBitsCount} bit(s) toggled from 0 to 1. Result updated from ${oldResult} (${toBinaryString(
          oldResult,
          bitWidth
        )}) to ${newResult} (${toBinaryString(newResult, bitWidth)}).`;

    frames.push({
      activeLine: 4,
      phase: "xor",
      currentIndex: i,
      currentNum: num,
      prevResult: oldResult,
      result: newResult,
      prevResultBin: toBinaryString(oldResult, bitWidth),
      currentNumBin: toBinaryString(num, bitWidth),
      resultBin: toBinaryString(newResult, bitWidth),
      bitWidth,
      bitOperations: bitOps,
      cancelledIndices: [...cancelledIndices],
      activePair,
      cumulativeHistory: [...cumulativeHistory],
      message: activePair
        ? `result ^= ${num}: ${oldResult} ^ ${num} = ${newResult} — Pair (${num}, ${num}) cancelled!`
        : `result ^= ${num}: ${oldResult} ^ ${num} = ${newResult} (${toBinaryString(
            oldResult,
            bitWidth
          )} ^ ${toBinaryString(num, bitWidth)} = ${toBinaryString(newResult, bitWidth)})`,
      explanation: xorExplanation,
      relatedLines: [4],
    });
  }

  // Frame: Done (Line 5)
  frames.push({
    activeLine: 5,
    phase: "done",
    currentIndex: -1,
    currentNum: null,
    prevResult: currentResult,
    result: currentResult,
    prevResultBin: toBinaryString(currentResult, bitWidth),
    currentNumBin: null,
    resultBin: toBinaryString(currentResult, bitWidth),
    bitWidth,
    bitOperations: [],
    cancelledIndices: [...cancelledIndices],
    activePair: null,
    cumulativeHistory: [...cumulativeHistory],
    singleVal: currentResult,
    message: `Return result = ${currentResult} — Unique single number isolated!`,
    explanation: `All duplicate pairs eliminated each other bit-by-bit (x ^ x = 0). The only remaining value in the accumulator is ${currentResult}, achieved in O(n) time and O(1) space.`,
    relatedLines: [5],
  });

  return {
    nums,
    singleVal: currentResult,
    bitWidth,
    tableRows,
    bitColumns,
    frames,
  };
}
