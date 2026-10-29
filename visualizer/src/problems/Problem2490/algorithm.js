const PYTHON_LINES = [
  "def isCircularSentence(sentence):",
  "    words = sentence.split(\" \")",
  "    for i in range(len(words)):",
  "        last = words[i][-1]",
  "        first = words[(i + 1) % len(words)][0]",
  "        if last != first:",
  "            return False",
  "    return True",
];

const CODE_LINES = [
  "FUNCTION isCircularSentence(sentence)",
  "  words <- the words of sentence, in order",
  "  FOR each word at position i",
  "    last <- last character of words[i]",
  "    first <- first character of the next word, wrapping to the first word",
  "    IF last differs from first THEN",
  "      RETURN false",
  "  RETURN true",
];

const MAX_WORDS = 20;

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

const py = key => {
  const index = PYTHON_LINES.findIndex(line => line.includes(key));
  if (index < 0) throw new Error(`Python line for "${key}" is missing`);
  return index + 1;
};

export function parseInput(text) {
  let obj;
  try {
    obj = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object such as {"sentence": "leetcode exercises sound delightful"}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with a sentence key");
  const { sentence } = obj;
  if (typeof sentence !== "string") throw new Error("sentence must be a string");
  if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(sentence)) throw new Error("sentence must be words of English letters separated by single spaces");
  const count = sentence.split(" ").length;
  if (count > MAX_WORDS) throw new Error(`sentence may contain at most ${MAX_WORDS} words for this visualization`);
  return { sentence };
}

export function buildTrace(input) {
  const { sentence } = input.sentence !== undefined ? input : parseInput(input);
  const words = sentence.split(" ");
  const frames = [];
  const snap = (phase, activeLine, pyKey, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: py(pyKey), message, i: -1, words, ...extra,
  });

  snap("setup", 2, "words = sentence.split", `The sentence has ${words.length} word(s).`);
  for (let i = 0; i < words.length; i++) {
    snap("scan", 3, "for i in range", `Look at word ${i}: ${words[i]}.`, { i });
    const last = words[i][words[i].length - 1];
    snap("last", 4, "last = words[i][-1]", `${words[i]} ends with "${last}".`, { i });
    const next = (i + 1) % words.length;
    const first = words[next][0];
    snap("first", 5, "first = words[(i + 1)", `The next word ${words[next]} starts with "${first}".`, { i, next });
    const ok = last === first;
    snap("compare", 6, "if last != first", ok ? `"${last}" matches "${first}".` : `"${last}" does not match "${first}", so the sentence is not circular.`, { i, next });
    if (!ok) {
      snap("done", 7, "return False", "Return false.", { i, result: false });
      return { input: { sentence }, result: false, frames };
    }
  }
  snap("done", 8, "return True", "Every boundary matches, so return true.", { result: true });
  return { input: { sentence }, result: true, frames };
}
