export const code = [
  { line: 1, text: "zeros <- 0, ones <- 0, best <- 0" },
  { line: 2, text: "for each index i with character c in s" },
  { line: 3, text: "if c is '0'" },
  { line: 4, text: "if ones > 0, a new zero run starts" },
  { line: 5, text: "zeros <- 0, ones <- 0" },
  { line: 6, text: "zeros <- zeros + 1" },
  { line: 7, text: "otherwise (c is '1')" },
  { line: 8, text: "ones <- ones + 1" },
  { line: 9, text: "if ones <= zeros" },
  { line: 10, text: "best <- max(best, 2 * ones)" },
  { line: 11, text: "return best" },
]

export const python = `def longestBalancedSubstring(s):
    zeros = 0
    ones = 0
    best = 0
    for i, ch in enumerate(s):
        if ch == "0":
            if ones > 0:
                zeros = 0
                ones = 0
            zeros += 1
        else:
            ones += 1
            if ones <= zeros:
                best = max(best, 2 * ones)
    return best`

const SAMPLE_KEYS = ["s"]

export function parseInput(text) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error('Input must be valid JSON, for example {"s": "01000111"}');
  }
  return validateInput(obj);
}

export function validateInput(obj) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error('Input must be a JSON object with the key "s"');
  }
  const unknown = Object.keys(obj).filter((k) => !SAMPLE_KEYS.includes(k));
  if (unknown.length) throw new Error(`Unknown key "${unknown[0]}"; expected only "s"`);
  if (typeof obj.s !== "string") throw new Error('"s" must be a string of 0 and 1 characters');
  if (obj.s.length < 1 || obj.s.length > 50) {
    throw new Error(`"s" length must be between 1 and 50 (got ${obj.s.length})`);
  }
  if (!/^[01]+$/.test(obj.s)) throw new Error('"s" may only contain the characters 0 and 1');
  return { s: obj.s };
}

export function buildTrace(rawInput) {
  const { s } = validateInput(rawInput);
  const frames = [];
  let zeros = 0;
  let ones = 0;
  let best = 0;

  const push = (frame) =>
    frames.push({
      zeros,
      ones,
      best,
      index: null,
      ch: null,
      balanced: null,
      windowStart: null,
      windowEnd: null,
      result: null,
      ...frame,
    });

  zeros = 0;
  push({ phase: "setup", activeLine: 1, pythonLine: 2, message: "Start the zero run count at 0." });
  ones = 0;
  push({ phase: "setup", activeLine: 1, pythonLine: 3, message: "Start the one run count at 0." });
  best = 0;
  push({ phase: "setup", activeLine: 1, pythonLine: 4, message: "No balanced substring found yet, so best is 0." });

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    push({ phase: "scan", activeLine: 2, pythonLine: 5, index: i, ch, message: `Read s[${i}] = '${ch}'.` });

    if (ch === "0") {
      push({ phase: "zero", activeLine: 3, pythonLine: 6, index: i, ch, message: "The character is '0', so it extends the zero run." });
      if (ones > 0) {
        push({ phase: "reset", activeLine: 4, pythonLine: 7, index: i, ch, message: "Ones were seen after zeros, so a new zero run starts here." });
        zeros = 0;
        push({ phase: "reset", activeLine: 5, pythonLine: 8, index: i, ch, message: "Clear the zero count." });
        ones = 0;
        push({ phase: "reset", activeLine: 5, pythonLine: 9, index: i, ch, message: "Clear the one count." });
      }
      zeros += 1;
      push({ phase: "zero", activeLine: 6, pythonLine: 10, index: i, ch, message: `Zero count is now ${zeros}.` });
    } else {
      ones += 1;
      push({ phase: "one", activeLine: 8, pythonLine: 12, index: i, ch, message: `One count is now ${ones}.` });
      const ok = ones <= zeros;
      push({
        phase: "check",
        activeLine: 9,
        pythonLine: 13,
        index: i,
        ch,
        balanced: ok,
        message: ok
          ? `${ones} ones fit under ${zeros} zeros, so the last ${2 * ones} characters are balanced.`
          : `${ones} ones exceed ${zeros} zeros, so no balanced substring ends here.`,
      });
      if (ok) {
        best = Math.max(best, 2 * ones);
        push({
          phase: "record",
          activeLine: 10,
          pythonLine: 14,
          index: i,
          ch,
          balanced: true,
          windowStart: i - 2 * ones + 1,
          windowEnd: i,
          message: `Candidate length ${2 * ones} recorded; best is ${best}.`,
        });
      }
    }
  }

  push({ phase: "done", activeLine: 11, pythonLine: 15, result: best, message: `Longest balanced substring length is ${best}.` });

  return { input: { s }, result: best, frames };
}
