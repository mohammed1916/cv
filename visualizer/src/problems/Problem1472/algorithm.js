const PYTHON_LINES = [
  "def browser_history(homepage, methods, args):",
  "    history = [homepage]",
  "    cur = 0",
  "    results = []",
  "    for method, arg in zip(methods, args):",
  '        if method == "visit":',
  "            del history[cur + 1:]",
  "            history.append(arg[0])",
  "            cur += 1",
  "            results.append(None)",
  '        elif method == "back":',
  "            cur = max(0, cur - arg[0])",
  "            results.append(history[cur])",
  "        else:",
  "            cur = min(len(history) - 1, cur + arg[0])",
  "            results.append(history[cur])",
  "    return results",
];

const CODE = [
  "FUNCTION browserHistory(homepage, methods, args)",
  "    history ← [homepage]",
  "    cur ← 0",
  "    results ← empty list",
  "    FOR each method and arg IN methods, args",
  '        IF method is "visit"',
  "            remove history entries after position cur",
  "            append arg[0] to history",
  "            cur ← cur + 1",
  "            append null to results",
  '        ELSE IF method is "back"',
  "            cur ← max(0, cur − arg[0])",
  "            append history[cur] to results",
  "        ELSE",
  "            cur ← min(last index of history, cur + arg[0])",
  "            append history[cur] to results",
  "    RETURN results",
];

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Input must be valid JSON, e.g. {"homepage":"leetcode.com","methods":["visit"],"args":[["google.com"]]}');
  }
}

export function parseInput(text) {
  const input = typeof text === "string" ? parseJson(text) : text;
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error('Input must be a JSON object with homepage, methods and args');
  }
  const { homepage, methods, args } = input;
  if (typeof homepage !== "string" || homepage.length < 1 || homepage.length > 20) {
    throw new Error("homepage must be a string of 1 to 20 characters");
  }
  if (!Array.isArray(methods) || !Array.isArray(args)) throw new Error("methods and args must be arrays");
  if (methods.length !== args.length) throw new Error("methods and args must have the same length");
  if (methods.length < 1 || methods.length > 50) {
    throw new Error(`call count ${methods.length} must be between 1 and 50 for the visualization`);
  }
  methods.forEach((method, index) => {
    const arg = args[index];
    if (method === "visit") {
      if (!Array.isArray(arg) || arg.length !== 1 || typeof arg[0] !== "string" || arg[0].length < 1 || arg[0].length > 20) {
        throw new Error(`call ${index + 1}: visit needs one URL string of 1 to 20 characters`);
      }
    } else if (method === "back" || method === "forward") {
      if (!Array.isArray(arg) || arg.length !== 1 || !Number.isInteger(arg[0]) || arg[0] < 1 || arg[0] > 100) {
        throw new Error(`call ${index + 1}: ${method} needs one integer step count from 1 to 100`);
      }
    } else {
      throw new Error(`call ${index + 1}: method must be visit, back or forward`);
    }
  });
  return { homepage, methods: [...methods], args: args.map(arg => [...arg]) };
}

export function buildTrace(input) {
  const { homepage, methods, args } = input;
  const history = [homepage];
  let cur = 0;
  const results = [];
  const frames = [];
  const frame = (activeLine, phase, message, extra = {}) => frames.push({
    activeLine, phase, message, history: [...history], cur, results: [...results], ...extra,
  });

  frame(2, "init", `Start with homepage ${homepage} as the only page in history.`);
  methods.forEach((method, index) => {
    const arg = args[index][0];
    frame(5, "loop", `Call ${index + 1}: ${method}(${arg}).`, { call: index + 1, method, arg });
    if (method === "visit") {
      const dropped = history.length - (cur + 1);
      frame(7, "visit", dropped > 0 ? `Drop ${dropped} forward page(s) after the current page.` : "No forward pages to drop.", { call: index + 1, method, arg });
      history.splice(cur + 1);
      history.push(arg);
      frame(8, "visit", `Append ${arg} to the history.`, { call: index + 1, method, arg });
      cur += 1;
      results.push(null);
      frame(10, "visit", `Current page is now ${arg}; visit returns null.`, { call: index + 1, method, arg });
    } else if (method === "back") {
      cur = Math.max(0, cur - arg);
      frame(12, "back", `Move back ${arg} step(s), stopping at the start of history.`, { call: index + 1, method, arg });
      results.push(history[cur]);
      frame(13, "back", `back returns ${history[cur]}.`, { call: index + 1, method, arg, output: history[cur] });
    } else {
      cur = Math.min(history.length - 1, cur + arg);
      frame(15, "forward", `Move forward ${arg} step(s), stopping at the end of history.`, { call: index + 1, method, arg });
      results.push(history[cur]);
      frame(16, "forward", `forward returns ${history[cur]}.`, { call: index + 1, method, arg, output: history[cur] });
    }
  });
  frame(17, "done", `Return the ${results.length} call results.`, { result: [...results] });

  return { input: { homepage, methods, args }, result: [...results], frames };
}

export const python = PYTHON_LINES.join("\n");
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const pythonLineMap = Object.fromEntries(Array.from({ length: 17 }, (_, index) => [index + 1, index + 1]));
