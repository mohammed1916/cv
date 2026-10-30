const PYTHON_LINES = [
  "def shortestBeautifulSubstring(s, k):",
  "    best = \"\"",
  "    left = 0",
  "    ones = 0",
  "    for right in range(len(s)):",
  "        if s[right] == \"1\":",
  "            ones += 1",
  "        while ones > k:",
  "            if s[left] == \"1\":",
  "                ones -= 1",
  "            left += 1",
  "        if ones == k:",
  "            while s[left] == \"0\":",
  "                left += 1",
  "            cand = s[left:right + 1]",
  "            if best == \"\" or len(cand) < len(best) or (len(cand) == len(best) and cand < best):",
  "                best = cand",
  "    return best",
];

export const python = PYTHON_LINES.join("\n");

export const code = [
  { line: 1, text: "Set best to empty, left to 0, and ones to 0" },
  { line: 2, text: "For each right index from 0 to n - 1" },
  { line: 3, text: "If s[right] is 1, add one to ones" },
  { line: 4, text: "While ones is greater than k, drop s[left] and move left forward" },
  { line: 5, text: "If ones equals k, move left past leading zeros" },
  { line: 6, text: "Let cand = s[left..right]; keep it if shorter, or equal length and smaller" },
  { line: 7, text: "Return best" },
];

const LIMITS = { maxLength: 100, maxK: 100 };

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Input must be a JSON object such as {"s":"100011001","k":3}');
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object");
  const { s, k } = data;
  if (typeof s !== "string" || s.length < 1) throw new Error("s must be a non-empty binary string");
  if (s.length > LIMITS.maxLength) throw new Error(`s has ${s.length} characters; the visualization caps it at ${LIMITS.maxLength}`);
  if (!/^[01]+$/.test(s)) throw new Error("s must contain only the characters 0 and 1");
  if (!Number.isInteger(k) || k < 1 || k > LIMITS.maxK) throw new Error(`k must be an integer from 1 to ${LIMITS.maxK}`);
  return { s, k };
}

function frame(fields) {
  return { result: null, right: null, left: null, ones: 0, best: "", explanation: "", ...fields };
}

export function buildTrace(input) {
  const { s, k } = parseInput(input);
  const frames = [];
  let best = "";
  let left = 0;
  let ones = 0;
  frames.push(frame({
    phase: "setup", activeLine: 1, pythonLine: 2, left, ones, best,
    message: `Empty best, window starts at 0, k = ${k} ones wanted.`,
    explanation: "The window [left, right] is grown on the right and shrunk from the left.",
  }));
  for (let right = 0; right < s.length; right += 1) {
    frames.push(frame({
      phase: "extend", activeLine: 2, pythonLine: 5, right, left, ones, best,
      message: `Extend the window to index ${right} (${s[right]}).`,
      explanation: "The right edge moves one character at a time.",
    }));
    if (s[right] === "1") {
      ones += 1;
      frames.push(frame({
        phase: "count", activeLine: 3, pythonLine: 7, right, left, ones, best,
        message: `Count the one at ${right}; window has ${ones} ones.`,
        explanation: "Only ones change the count that k is compared against.",
      }));
    }
    while (ones > k) {
      const removed = s[left];
      if (removed === "1") ones -= 1;
      left += 1;
      frames.push(frame({
        phase: "shrink", activeLine: 4, pythonLine: removed === "1" ? 10 : 11, right, left, ones, best,
        message: `Drop ${removed} at ${left - 1}; window has ${ones} ones.`,
        explanation: "The window has too many ones, so the left edge moves right.",
      }));
    }
    if (ones === k) {
      const before = left;
      while (s[left] === "0") left += 1;
      if (left !== before) {
        frames.push(frame({
          phase: "trim", activeLine: 5, pythonLine: 14, right, left, ones, best,
          message: `Skip leading zeros to start at ${left}.`,
          explanation: "Leading zeros never help, so the window starts at the first one.",
        }));
      }
      const cand = s.slice(left, right + 1);
      frames.push(frame({
        phase: "candidate", activeLine: 6, pythonLine: 15, right, left, ones, best,
        message: `Candidate "${cand}" has length ${cand.length}.`,
        explanation: "Compare with the best so far: shorter wins, and among equal lengths the smaller string wins.",
      }));
      if (best === "" || cand.length < best.length || (cand.length === best.length && cand < best)) {
        best = cand;
        frames.push(frame({
          phase: "record", activeLine: 6, pythonLine: 17, right, left, ones, best,
          message: `Best is now "${best}".`,
          explanation: "The candidate beats the previous best.",
        }));
      }
    }
  }
  frames.push(frame({
    phase: "done", activeLine: 7, pythonLine: 18, result: best, best,
    message: `Return "${best}".`,
    explanation: best === "" ? "No window contains exactly k ones." : "The shortest, then lexicographically smallest, beautiful substring is returned.",
  }));
  return { input: { s, k }, result: best, frames };
}
