export const code = `function countSubstrings(s, c) {
  let count = 0
  for (const ch of s) {
    if (ch === c) count += 1
  }
  return count * (count + 1) / 2
}`.split('\n').map((text, index) => ({ line: index + 1, text }));
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('No code line: ' + s); return i + 1 };
export const python = `def countSubstrings(s, c):
    count = 0
    for ch in s:
        if ch == c:
            count += 1
    return count * (count + 1) // 2`;

export function parseInput(text) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object with s and c, e.g. {"s":"abada","c":"a"}');
  }
  if (!obj || typeof obj !== "object" || typeof obj.s !== "string") {
    throw new Error("s must be a string");
  }
  if (obj.s.length < 1 || obj.s.length > 50) {
    throw new Error(`s length (${obj.s.length}) must be between 1 and 50 for this visualization`);
  }
  if (typeof obj.c !== "string" || obj.c.length !== 1) {
    throw new Error("c must be a single character");
  }
  return { s: obj.s, c: obj.c };
}

export function buildTrace(input) {
  const { s, c } = input;
  const frames = [];
  const matches = [];
  let count = 0;
  frames.push({ phase: "start", activeLine: L('let count = 0'), pythonLine: 2, message: `Start with count = 0, looking for "${c}".`, index: -1, matches: [], count });
  for (let i = 0; i < s.length; i++) {
    frames.push({ phase: "scan", activeLine: L('for (const ch of s)'), pythonLine: 3, message: `Look at s[${i}] = "${s[i]}".`, index: i, matches: [...matches], count });
    const hit = s[i] === c;
    frames.push({ phase: "check", activeLine: L('if (ch === c)'), pythonLine: 4, message: `"${s[i]}" ${hit ? "equals" : "does not equal"} "${c}".`, index: i, matches: [...matches], count });
    if (hit) {
      count += 1;
      matches.push(i);
      frames.push({ phase: "count", activeLine: L('count += 1'), pythonLine: 5, message: `count = ${count}.`, index: i, matches: [...matches], count });
    }
  }
  const result = (count * (count + 1)) / 2;
  frames.push({ phase: "done", activeLine: L('return count'), pythonLine: 6, message: `${count} occurrences give ${count} * ${count + 1} / 2 = ${result} substrings.`, index: -1, matches: [...matches], count });
  return { input, result, frames };
}
