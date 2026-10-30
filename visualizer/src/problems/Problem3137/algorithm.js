const PYTHON_LINES = [
  "def minimumOperationsToMakeKPeriodic(word, k):",
  "    counts = {}",
  "    for i in range(0, len(word), k):",
  "        block = word[i:i + k]",
  "        counts[block] = counts.get(block, 0) + 1",
  "    most = max(counts.values())",
  "    return len(word) // k - most",
];

const CODE = [
  "FUNCTION minimumOperationsToMakeKPeriodic(word, k)",
  "    counts ← empty map",
  "    FOR each block start i = 0, k, 2k, ...",
  "        block ← substring of word from i with length k",
  "        counts[block] ← counts[block] + 1",
  "    most ← largest value in counts",
  "    RETURN number of blocks − most",
];

export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = PYTHON_LINES.join("\n");

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Input must be valid JSON: ${error.message}`);
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object like {"word": "leetcodeleet", "k": 4}');
  }
  const { word, k } = data;
  if (typeof word !== "string" || !/^[a-z]+$/.test(word)) {
    throw new Error("word must be a non-empty string of lowercase English letters");
  }
  if (word.length > 60) {
    throw new Error(`word length (${word.length}) exceeds the visualization limit of 60`);
  }
  if (!Number.isInteger(k) || k < 1 || k > word.length) {
    throw new Error("k must be an integer between 1 and the length of word");
  }
  if (word.length % k !== 0) {
    throw new Error("k must divide the length of word");
  }
  return { word, k };
}

export function buildTrace(input) {
  const { word, k } = parseInput(input);
  const frames = [];
  const counts = {};
  const blocks = [];
  const push = (frame) => frames.push({ word, k, blocks: [...blocks], counts: { ...counts }, block: null, index: -1, ...frame });

  push({ phase: "setup", activeLine: 2, pythonLine: 2, message: "Start with an empty count of each length-k block." });
  for (let i = 0; i < word.length; i += k) {
    const block = word.slice(i, i + k);
    const b = i / k;
    blocks.push(block);
    push({ phase: "scan", activeLine: 3, pythonLine: 3, index: b, block, message: `Block ${b} starts at ${i}.` });
    push({ phase: "scan", activeLine: 4, pythonLine: 4, index: b, block, message: `Cut block "${block}".` });
    counts[block] = (counts[block] || 0) + 1;
    push({ phase: "scan", activeLine: 5, pythonLine: 5, index: b, block, message: `Count of "${block}" is now ${counts[block]}.` });
  }
  const most = Math.max(...Object.values(counts));
  push({ phase: "count", activeLine: 6, pythonLine: 6, message: `The most frequent block appears ${most} time(s).` });
  const result = blocks.length - most;
  push({ phase: "done", activeLine: 7, pythonLine: 7, message: `Return ${blocks.length} blocks − ${most} = ${result}.`, result });

  return { input: { word, k }, result, frames };
}
