const PYTHON_LINES = [
  "def canBeEqual(s1, s2):",
  "    first = sorted([s1[0], s1[2]])",
  "    second = sorted([s2[0], s2[2]])",
  "    odd1 = sorted([s1[1], s1[3]])",
  "    odd2 = sorted([s2[1], s2[3]])",
  "    return first == second and odd1 == odd2",
];

const CODE_LINES = [
  "even1 <- sorted letters of s1 at indices 0 and 2",
  "even2 <- sorted letters of s2 at indices 0 and 2",
  "odd1 <- sorted letters of s1 at indices 1 and 3",
  "odd2 <- sorted letters of s2 at indices 1 and 3",
  "return even1 == even2 and odd1 == odd2",
];

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

const py = text => {
  const index = PYTHON_LINES.findIndex(line => line.trim() === text);
  if (index < 0) throw new Error(`missing Python line: ${text}`);
  return index + 1;
};

export function parseInput(text) {
  const input = typeof text === "string" ? JSON.parse(text) : text;
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Input must be a JSON object with s1 and s2.");
  const { s1, s2 } = input;
  if (typeof s1 !== "string" || typeof s2 !== "string") throw new Error("s1 and s2 must be strings.");
  if (s1.length !== 4 || s2.length !== 4) throw new Error("s1 and s2 must both have length 4.");
  if (!/^[a-z]{4}$/.test(s1) || !/^[a-z]{4}$/.test(s2)) throw new Error("s1 and s2 must contain only lowercase letters.");
  return { s1, s2 };
}

export function buildTrace(input) {
  const { s1, s2 } = parseInput(input);
  const letters = [...s1, ...s2];
  const frames = [];
  const roles = () => Array(8).fill("");
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: letters, active: -1, roles: roles(), detail: "", ...extra,
  });
  const group = (indices, tag) => { const r = roles(); indices.forEach(i => { r[i] = tag; }); return r; };

  const first = [s1[0], s1[2]].sort();
  const second = [s2[0], s2[2]].sort();
  push("even", 1, py("first = sorted([s1[0], s1[2]])"), `s1 even indices hold ${first.join(", ")}.`, { roles: group([0, 2], "group"), detail: `first = [${first.join(", ")}]` });
  push("even", 2, py("second = sorted([s2[0], s2[2]])"), `s2 even indices hold ${second.join(", ")}.`, { roles: group([4, 6], "group"), detail: `second = [${second.join(", ")}]` });
  const odd1 = [s1[1], s1[3]].sort();
  const odd2 = [s2[1], s2[3]].sort();
  push("odd", 3, py("odd1 = sorted([s1[1], s1[3]])"), `s1 odd indices hold ${odd1.join(", ")}.`, { roles: group([1, 3], "group"), detail: `odd1 = [${odd1.join(", ")}]` });
  push("odd", 4, py("odd2 = sorted([s2[1], s2[3]])"), `s2 odd indices hold ${odd2.join(", ")}.`, { roles: group([5, 7], "group"), detail: `odd2 = [${odd2.join(", ")}]` });
  const evenOk = first.join() === second.join();
  const oddOk = odd1.join() === odd2.join();
  const result = evenOk && oddOk;
  push("result", 5, py("return first == second and odd1 == odd2"),
    `Even groups ${evenOk ? "match" : "differ"}; odd groups ${oddOk ? "match" : "differ"}. Answer: ${result}.`,
    { detail: `return ${result}` });
  return { input: { s1, s2 }, result, frames };
}
