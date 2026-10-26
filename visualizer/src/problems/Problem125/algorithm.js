export const PALINDROME_CODE = [
  "def isPalindrome(s):",
  "    s = ''.join(c.lower() for c in s if c.isalnum())",
  "    l, r = 0, len(s) - 1",
  "    while l < r:",
  "        if s[l] != s[r]: return False",
  "        l += 1; r -= 1",
  "    return True",
];

export function parsePalindromeInput(input) {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }
  if (input.length > 200) {
    throw new Error("Input string exceeds maximum length of 200 characters");
  }
  return input;
}

export function buildPalindromeStory(input) {
  const raw = parsePalindromeInput(input);

  // Step 1: filter & lowercase chars, showing mapping from raw positions to clean array.
  const mapping = [];
  const rawChars = [];
  let cleaned = "";

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    const isAlphanumeric = /[a-z0-9]/i.test(char);
    if (isAlphanumeric) {
      const lower = char.toLowerCase();
      const cleanIndex = cleaned.length;
      mapping.push({
        cleanIndex,
        rawIndex: i,
        rawChar: char,
        cleanChar: lower,
      });
      cleaned += lower;
      rawChars.push({
        index: i,
        char,
        isKept: true,
        cleanIndex,
      });
    } else {
      rawChars.push({
        index: i,
        char,
        isKept: false,
        cleanIndex: -1,
      });
    }
  }

  const frames = [];

  // Frame 1: Step 1 - filter & lowercase
  frames.push({
    activeLine: 2,
    phase: "init",
    l: null,
    r: null,
    cleaned,
    raw,
    rawChars: [...rawChars],
    mapping: [...mapping],
    comparing: null,
    matchedIndices: [],
    result: null,
    message:
      cleaned.length === 0
        ? "Cleaned string is empty (no alphanumeric characters)."
        : `Cleaned string: "${cleaned}" (${cleaned.length} chars filtered from ${raw.length} raw chars).`,
    explanation:
      cleaned.length === 0
        ? "Filtered out all non-alphanumeric characters. The resulting string is empty."
        : `Filtered raw input to lowercase alphanumeric characters. Kept ${mapping.length} of ${raw.length} characters.`,
    relatedLines: [2],
  });

  // Step 2: two pointers l and r moving inward from both ends
  let l = 0;
  let r = cleaned.length - 1;

  // Frame 2: Init pointers
  frames.push({
    activeLine: 3,
    phase: "init",
    l,
    r,
    cleaned,
    raw,
    rawChars: [...rawChars],
    mapping: [...mapping],
    comparing: null,
    matchedIndices: [],
    result: null,
    message:
      cleaned.length === 0
        ? "Initialize pointers: l = 0, r = -1 (empty string)."
        : `Initialize pointers: l = 0, r = ${r}.`,
    explanation:
      cleaned.length === 0
        ? "The cleaned string is empty. Left pointer l is 0 and right pointer r is -1."
        : `Set left pointer l to index 0 ('${cleaned[0]}') and right pointer r to index ${r} ('${cleaned[r]}').`,
    relatedLines: [3],
  });

  // Handle empty string edge case
  if (cleaned.length === 0) {
    frames.push({
      activeLine: 7,
      phase: "done",
      l,
      r,
      cleaned,
      raw,
      rawChars: [...rawChars],
      mapping: [...mapping],
      comparing: null,
      matchedIndices: [],
      result: true,
      message: "Loop condition l < r (0 < -1) is False. Return True.",
      explanation:
        "An empty string reads the same forward and backward. Returns True.",
      relatedLines: [7],
    });
    return { raw, cleaned, isValid: true, mapping, rawChars, frames };
  }

  // Handle single character edge case
  if (cleaned.length === 1) {
    frames.push({
      activeLine: 7,
      phase: "done",
      l,
      r,
      cleaned,
      raw,
      rawChars: [...rawChars],
      mapping: [...mapping],
      comparing: null,
      matchedIndices: [0],
      result: true,
      message: "Loop condition l < r (0 < 0) is False. Return True.",
      explanation: `A single character ('${cleaned[0]}') is trivially a palindrome. Returns True.`,
      relatedLines: [7],
    });
    return { raw, cleaned, isValid: true, mapping, rawChars, frames };
  }

  const matchedIndices = [];

  while (l < r) {
    const leftChar = cleaned[l];
    const rightChar = cleaned[r];
    const match = leftChar === rightChar;

    if (!match) {
      frames.push({
        activeLine: 5,
        phase: "compare",
        l,
        r,
        cleaned,
        raw,
        rawChars: [...rawChars],
        mapping: [...mapping],
        comparing: {
          l,
          r,
          leftChar,
          rightChar,
          match: false,
        },
        matchedIndices: [...matchedIndices],
        result: false,
        message: `Mismatch: s[${l}] = '${leftChar}' ≠ s[${r}] = '${rightChar}'. Return False.`,
        explanation: `Comparing mirror endpoints: s[${l}] ('${leftChar}') does not match s[${r}] ('${rightChar}'). The string is not a palindrome. Return False.`,
        relatedLines: [4, 5],
      });
      return { raw, cleaned, isValid: false, mapping, rawChars, frames };
    }

    // Comparison match frame
    frames.push({
      activeLine: 5,
      phase: "compare",
      l,
      r,
      cleaned,
      raw,
      rawChars: [...rawChars],
      mapping: [...mapping],
      comparing: {
        l,
        r,
        leftChar,
        rightChar,
        match: true,
      },
      matchedIndices: [...matchedIndices],
      result: null,
      message: `Match: s[${l}] = '${leftChar}' == s[${r}] = '${rightChar}'.`,
      explanation: `Characters at index ${l} and index ${r} are both '${leftChar}'. Advance both pointers inward.`,
      relatedLines: [4, 5],
    });

    matchedIndices.push(l, r);

    const nextL = l + 1;
    const nextR = r - 1;

    // Pointer update frame
    frames.push({
      activeLine: 6,
      phase: "update",
      l: nextL,
      r: nextR,
      cleaned,
      raw,
      rawChars: [...rawChars],
      mapping: [...mapping],
      comparing: null,
      matchedIndices: [...matchedIndices],
      result: null,
      message: `Advance pointers: l = ${nextL}, r = ${nextR}.`,
      explanation: `Increment left pointer to ${nextL} and decrement right pointer to ${nextR}.`,
      relatedLines: [6],
    });

    l = nextL;
    r = nextR;
  }

  if (l === r && !matchedIndices.includes(l)) {
    matchedIndices.push(l);
  }

  // Done frame: pointers met or crossed
  frames.push({
    activeLine: 7,
    phase: "done",
    l,
    r,
    cleaned,
    raw,
    rawChars: [...rawChars],
    mapping: [...mapping],
    comparing: null,
    matchedIndices: [...matchedIndices],
    result: true,
    message: `Pointers crossed (l = ${l}, r = ${r}). All characters matched! Return True.`,
    explanation: `The two pointers met or crossed without finding any mismatched characters. The string "${cleaned}" is a valid palindrome. Return True.`,
    relatedLines: [7],
  });

  return {
    raw,
    cleaned,
    isValid: true,
    mapping,
    rawChars,
    frames,
  };
}
