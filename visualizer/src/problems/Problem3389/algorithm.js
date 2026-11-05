export const code = `function minimumOperations(word) {
  const counts = Array(26).fill(0)
  for (const ch of word) counts[ch.charCodeAt(0) - 97] += 1
  let best = word.length
  for (let target = 1; target <= word.length; target++) {
    let carry = new Map([[0, 0]])
    for (let letter = 0; letter < 26; letter++) {
      const next = new Map()
      for (const [incoming, cost] of carry) {
        const total = counts[letter] + incoming
        const maxForward = letter < 25 ? total : 0
        for (let forward = 0; forward <= maxForward; forward++) {
          const kept = total - forward
          const extra = kept > 0 ? Math.abs(kept - target) : 0
          const newCost = cost + forward + extra
          if (!next.has(forward) || newCost < next.get(forward)) next.set(forward, newCost)
        }
      }
      carry = next
    }
    best = Math.min(best, carry.get(0))
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimumOperations(word):
    counts = [0] * 26
    for ch in word:
        counts[ord(ch) - ord("a")] += 1
    best = len(word)
    for target in range(1, len(word) + 1):
        carry = {0: 0}
        for letter in range(26):
            nxt = {}
            for incoming, cost in carry.items():
                total = counts[letter] + incoming
                max_forward = total if letter < 25 else 0
                for forward in range(max_forward + 1):
                    kept = total - forward
                    extra = abs(kept - target) if kept > 0 else 0
                    new_cost = cost + forward + extra
                    if new_cost < nxt.get(forward, float("inf")):
                        nxt[forward] = new_cost
            carry = nxt
        best = min(best, carry[0])
    return best`;

const PYTHON_LINES = python.split("\n");
const pyLine = text => PYTHON_LINES.findIndex(line => line.includes(text)) + 1;
const MAX_LENGTH = 24;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"word": "acab"}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with a "word" key');
  const { word } = data;
  if (typeof word !== "string") throw new Error('"word" must be a string');
  if (word.length < 1 || word.length > MAX_LENGTH) throw new Error(`"word" length must be between 1 and ${MAX_LENGTH} for the visualization (got ${word.length})`);
  if (!/^[a-z]+$/.test(word)) throw new Error('"word" must contain lowercase letters only');
  return { word };
}

export function buildTrace(input) {
  const { word } = input;
  const n = word.length;
  const counts = new Array(26).fill(0);
  for (const ch of word) counts[ch.charCodeAt(0) - 97] += 1;
  const frames = [];
  let best = n;
  let bestTarget = null;
  frames.push({
    phase: "count", activeLine: L("const counts = Array"), pythonLine: pyLine("counts[ord(ch)"),
    message: "Counted each letter of the word.", letter: null, target: null, counts: [...counts], cost: null, best,
  });
  for (let target = 1; target <= n; target += 1) {
    frames.push({
      phase: "target", activeLine: L("for (let target = 1"), pythonLine: pyLine("for target in range"),
      message: `Try final frequency ${target} for every letter that remains.`, letter: null, target, counts: [...counts], cost: null, best,
    });
    let carry = new Map([[0, 0]]);
    frames.push({
      phase: "letter", activeLine: L("let carry = new Map"), pythonLine: pyLine("carry = {0: 0}"),
      message: `Nothing is carried into 'a'.`, letter: 0, target, counts: [...counts], cost: 0, best,
    });
    for (let letter = 0; letter < 26; letter += 1) {
      const next = new Map();
      for (const [incoming, cost] of carry) {
        const total = counts[letter] + incoming;
        const maxForward = letter < 25 ? total : 0;
        for (let forward = 0; forward <= maxForward; forward += 1) {
          const kept = total - forward;
          const extra = kept > 0 ? Math.abs(kept - target) : 0;
          const newCost = cost + forward + extra;
          if (!next.has(forward) || newCost < next.get(forward)) next.set(forward, newCost);
        }
      }
      carry = next;
      const letterChar = String.fromCharCode(97 + letter);
      frames.push({
        phase: "letter", activeLine: L("for (let letter = 0"), pythonLine: pyLine("for letter in range(26)"),
        message: `Letter '${letterChar}': ${counts[letter]} original, states after moves ${[...carry.keys()].join(", ")}.`,
        letter, target, counts: [...counts], cost: Math.min(...carry.values()), best,
      });
      frames.push({
        phase: "move", activeLine: L("const total = counts[letter]"), pythonLine: pyLine("total = counts[letter] + incoming"),
        message: `Keep the cheapest state for each number moved on from '${letterChar}'.`,
        letter, target, counts: [...counts], cost: Math.min(...carry.values()), best,
      });
    }
    const total = carry.get(0);
    if (total < best) {
      best = total;
      bestTarget = target;
    }
    frames.push({
      phase: "result", activeLine: L("best = Math.min"), pythonLine: pyLine("best = min(best, carry[0])"),
      message: `Frequency ${target} costs ${total}; best so far is ${best}.`,
      letter: null, target, counts: [...counts], cost: total, best,
    });
  }
  frames.push({
    phase: "done", activeLine: L("return best"), pythonLine: pyLine("return best"),
    message: `The minimum is ${best}${bestTarget !== null ? ` (target frequency ${bestTarget})` : ""}.`,
    letter: null, target: bestTarget, counts: [...counts], cost: best, best, result: best,
  });
  return { input, result: best, frames };
}
