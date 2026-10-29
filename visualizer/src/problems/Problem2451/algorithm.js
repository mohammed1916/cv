const PYTHON_LINES = [
  "def oddString(words):",
  "    groups = {}",
  "    for i, word in enumerate(words):",
  "        diff = tuple(ord(b) - ord(a) for a, b in zip(word, word[1:]))",
  "        groups.setdefault(diff, []).append(i)",
  "    for indices in groups.values():",
  "        if len(indices) == 1:",
  "            return words[indices[0]]",
  '    return ""',
];

const CODE_LINES = [
  "FUNCTION oddString(words)",
  "  groups <- empty map from difference array to list of indices",
  "  FOR each index i",
  "    diff <- differences between adjacent letters of words[i]",
  "    append i to groups[diff]",
  "  FOR each group in insertion order",
  "    IF the group holds exactly one index THEN RETURN that word",
  "  RETURN empty string",
];

const MAX_WORDS = 50;
const MAX_LENGTH = 20;

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

// Pseudocode line -> Python line doing the same action.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 9 };

export function parseInput(text) {
  let obj;
  try {
    obj = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object such as {"words": ["adc","wzy","abc"]}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with a words key");
  const { words } = obj;
  if (!Array.isArray(words)) throw new Error("words must be an array of strings");
  if (words.length < 3 || words.length > MAX_WORDS) {
    throw new Error(`words must contain between 3 and ${MAX_WORDS} entries for this visualization`);
  }
  const length = String(words[0]).length;
  words.forEach((word, index) => {
    if (typeof word !== "string") throw new Error(`words[${index}] must be a string`);
    if (!/^[a-z]+$/.test(word)) throw new Error(`words[${index}] must contain lowercase letters only`);
    if (word.length < 2 || word.length > MAX_LENGTH) throw new Error(`words[${index}] must have length 2 to ${MAX_LENGTH}`);
    if (word.length !== length) throw new Error("All words must have the same length");
  });
  return { words };
}

function differenceKey(word) {
  const diff = [];
  for (let k = 0; k + 1 < word.length; k++) diff.push(word.charCodeAt(k + 1) - word.charCodeAt(k));
  return diff;
}

export function buildTrace(input) {
  const { words } = input.words ? input : parseInput(input);
  const groups = new Map();
  const frames = [];
  const groupsView = () => Object.fromEntries([...groups].map(([key, idxs]) => [key, [...idxs]]));
  const snap = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message, i: -1, groups: groupsView(), ...extra,
  });

  snap("setup", 2, "Start with no groups of difference arrays.");
  for (let i = 0; i < words.length; i++) {
    snap("scan", 3, `Read words[${i}] = ${words[i]}.`, { i });
    const diff = differenceKey(words[i]);
    const key = diff.join(",");
    snap("diff", 4, `Differences of ${words[i]}: [${diff.join(", ")}].`, { i, key });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
    snap("group", 5, `Add index ${i} to the group [${diff.join(", ")}].`, { i, key });
  }

  let result = "";
  let found = -1;
  for (const [key, indices] of groups) {
    snap("search", 6, `Check the group [${key}] with ${indices.length} word(s).`, { key });
    if (indices.length === 1) {
      found = indices[0];
      result = words[found];
      snap("found", 7, `The group [${key}] has one word, so ${result} is the odd one.`, { i: found, key, result });
      break;
    }
  }
  if (found === -1) snap("done", 8, "No group has exactly one word.", { result });
  return { input: words, result, frames };
}
