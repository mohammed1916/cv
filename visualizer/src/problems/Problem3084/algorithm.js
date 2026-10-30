export const code = [
  { line: 1, text: "count substrings (s, c):" },
  { line: 2, text: "  set count to 0" },
  { line: 3, text: "  for each character ch in s" },
  { line: 4, text: "    if ch equals c" },
  { line: 5, text: "      add 1 to count" },
  { line: 6, text: "  return count times (count plus 1) divided by 2" },
];

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
  frames.push({ phase: "start", activeLine: 2, pythonLine: 2, message: `Start with count = 0, looking for "${c}".`, index: -1, matches: [], count });
  for (let i = 0; i < s.length; i++) {
    frames.push({ phase: "scan", activeLine: 3, pythonLine: 3, message: `Look at s[${i}] = "${s[i]}".`, index: i, matches: [...matches], count });
    const hit = s[i] === c;
    frames.push({ phase: "check", activeLine: 4, pythonLine: 4, message: `"${s[i]}" ${hit ? "equals" : "does not equal"} "${c}".`, index: i, matches: [...matches], count });
    if (hit) {
      count += 1;
      matches.push(i);
      frames.push({ phase: "count", activeLine: 5, pythonLine: 5, message: `count = ${count}.`, index: i, matches: [...matches], count });
    }
  }
  const result = (count * (count + 1)) / 2;
  frames.push({ phase: "done", activeLine: 6, pythonLine: 6, message: `${count} occurrences give ${count} * ${count + 1} / 2 = ${result} substrings.`, index: -1, matches: [...matches], count });
  return { input, result, frames };
}
