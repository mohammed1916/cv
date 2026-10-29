export const PYTHON_LINES = [
  "def isFascinating(n):",
  "    first = str(n)",
  "    second = str(2 * n)",
  "    third = str(3 * n)",
  "    s = first + second + third",
  "    digits = sorted(s)",
  "    return \"\".join(digits) == \"123456789\"",
];

export const CODE = [
  "Write n as text",
  "Write 2 * n as text",
  "Write 3 * n as text",
  "Join the three texts into s",
  "Sort the characters of s",
  "Return whether the sorted characters are 1 through 9",
];

export const python = PYTHON_LINES.join("\n");
export const code = CODE.map((text, index) => ({ line: index + 1, text }));

export function parseInput(input) {
  let obj = input;
  if (typeof input === "string") {
    try {
      obj = JSON.parse(input);
    } catch {
      throw new Error('Input must be a JSON object such as {"n": 192}.');
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error('Input must be a JSON object with an integer "n".');
  }
  const n = obj.n;
  if (!Number.isInteger(n)) {
    throw new Error('"n" must be an integer.');
  }
  if (n < 100 || n > 999) {
    throw new Error(`"n" must be between 100 and 999; got ${n}.`);
  }
  return { n };
}

export function buildTrace(input) {
  const { n } = parseInput(input);
  const frames = [];
  const push = (frame) => frames.push({ n, text: "", digits: null, ok: null, ...frame });

  const first = String(n);
  push({ phase: "build", activeLine: 1, pythonLine: 2, message: `n is written as "${first}".`, text: first });

  const second = String(2 * n);
  const afterSecond = first + second;
  push({ phase: "build", activeLine: 2, pythonLine: 3, message: `2n = ${2 * n}, written as "${second}".`, text: afterSecond });

  const third = String(3 * n);
  const s = afterSecond + third;
  push({ phase: "build", activeLine: 3, pythonLine: 4, message: `3n = ${3 * n}, written as "${third}".`, text: afterSecond + third });

  push({ phase: "join", activeLine: 4, pythonLine: 5, message: `Joined string s = "${s}" (${s.length} characters).`, text: s });

  const digits = [...s].sort().join("");
  push({ phase: "sort", activeLine: 5, pythonLine: 6, message: `Sorted characters: "${digits}".`, text: s, digits });

  const ok = digits === "123456789";
  push({
    phase: "done",
    activeLine: 6,
    pythonLine: 7,
    message: ok
      ? "The sorted characters are exactly 123456789, so n is fascinating."
      : `The sorted characters are "${digits}", not "123456789", so n is not fascinating.`,
    text: s,
    digits,
    ok,
    result: ok,
  });
  return { input: { n }, result: ok, frames };
}
