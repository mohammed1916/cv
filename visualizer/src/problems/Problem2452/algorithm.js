const PYTHON_LINES = [
  "def twoEditWords(queries, dictionary):",
  "    result = []",
  "    for query in queries:",
  "        for word in dictionary:",
  "            diff = 0",
  "            for a, b in zip(query, word):",
  "                if a != b:",
  "                    diff += 1",
  "            if diff <= 2:",
  "                result.append(query)",
  "                break",
  "    return result",
];

const CODE_LINES = [
  "FUNCTION twoEditWords(queries, dictionary)",
  "  result <- empty list",
  "  FOR each query in queries",
  "    FOR each word in dictionary",
  "      diff <- 0",
  "      FOR each position, count the letters that differ",
  "      IF diff <= 2 THEN",
  "        add query to result and stop checking this query",
  "  RETURN result",
];

const MAX_WORDS = 50;
const MAX_LENGTH = 20;

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

const py = key => {
  const index = PYTHON_LINES.findIndex(line => line.includes(key));
  if (index < 0) throw new Error(`Python line for "${key}" is missing`);
  return index + 1;
};

const isWord = value => typeof value === "string" && /^[a-z]+$/.test(value);

export function parseInput(text) {
  let obj;
  try {
    obj = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object such as {"queries": ["word"], "dictionary": ["wood"]}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with queries and dictionary keys");
  const { queries, dictionary } = obj;
  if (!Array.isArray(queries) || !Array.isArray(dictionary)) throw new Error("queries and dictionary must both be arrays of strings");
  if (queries.length < 1 || queries.length > MAX_WORDS) throw new Error(`queries must contain between 1 and ${MAX_WORDS} words for this visualization`);
  if (dictionary.length < 1 || dictionary.length > MAX_WORDS) throw new Error(`dictionary must contain between 1 and ${MAX_WORDS} words for this visualization`);
  queries.forEach((word, index) => {
    if (!isWord(word) || word.length > MAX_LENGTH) throw new Error(`queries[${index}] must be lowercase letters, at most ${MAX_LENGTH} long`);
  });
  dictionary.forEach((word, index) => {
    if (!isWord(word) || word.length > MAX_LENGTH) throw new Error(`dictionary[${index}] must be lowercase letters, at most ${MAX_LENGTH} long`);
    if (word.length !== dictionary[0].length) throw new Error("every dictionary word must have the same length");
  });
  queries.forEach((word, index) => {
    if (word.length !== dictionary[0].length) throw new Error(`queries[${index}] must have the same length as the dictionary words`);
  });
  return { queries, dictionary };
}

export function buildTrace(input) {
  const { queries, dictionary } = input.queries ? input : parseInput(input);
  const result = [];
  const frames = [];
  const snap = (phase, activeLine, pyKey, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: py(pyKey), message, q: -1, w: -1, diff: 0, result: [...result], ...extra,
  });

  snap("setup", 2, "result = []", "Start with an empty result list.");
  for (let q = 0; q < queries.length; q++) {
    snap("query", 3, "for query in queries", `Take query ${queries[q]}.`, { q });
    let matched = false;
    for (let w = 0; w < dictionary.length && !matched; w++) {
      snap("word", 4, "for word in dictionary", `Compare ${queries[q]} with ${dictionary[w]}.`, { q, w });
      let diff = 0;
      snap("reset", 5, "diff = 0", "Start the mismatch count at zero.", { q, w, diff });
      for (let k = 0; k < queries[q].length; k++) {
        if (queries[q][k] !== dictionary[w][k]) diff++;
      }
      snap("count", 6, "for a, b in zip", `${queries[q]} differs from ${dictionary[w]} in ${diff} position(s).`, { q, w, diff });
      const ok = diff <= 2;
      snap("check", 7, "if diff <= 2", ok ? `${diff} is at most 2, so ${queries[q]} matches.` : `${diff} is more than 2, so this word does not match.`, { q, w, diff, ok });
      if (ok) {
        result.push(queries[q]);
        matched = true;
        snap("record", 8, "result.append", `Add ${queries[q]} to the result and stop checking its other words.`, { q, w, diff });
      }
    }
    if (!matched) snap("skip", 3, "for query in queries", `No dictionary word is within two edits of ${queries[q]}.`, { q });
  }
  snap("done", 9, "return result", `Return ${result.length} matching quer${result.length === 1 ? "y" : "ies"}.`, { result: [...result] });
  return { input: { queries, dictionary }, result: [...result], frames };
}
