const PYTHON_LINES = [
  "def taskSchedulerII(tasks, space):",
  "    day = 0",
  "    last = {}",
  "    for task in tasks:",
  "        day += 1",
  "        if task in last and day - last[task] <= space:",
  "            day = last[task] + space + 1",
  "        last[task] = day",
  "    return day",
];

const CODE_LINES = [
  "FUNCTION taskSchedulerII(tasks, space)",
  "  day <- 0; last <- empty map from task type to day",
  "  FOR each task t in order",
  "    day <- day + 1",
  "    IF t ran before AND day - last[t] <= space THEN",
  "      day <- last[t] + space + 1",
  "    last[t] <- day",
  "  RETURN day",
];

const MAX_TASKS = 50;
const MAX_SPACE = 20;

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

// Pseudocode line -> Python line doing the same action.
export const pythonLineMap = { 1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9 };

export function parseInput(text) {
  let obj;
  try {
    obj = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object such as {"tasks": [1,2,1,2,3,1], "space": 3}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with tasks and space keys");
  const { tasks, space } = obj;
  if (!Array.isArray(tasks)) throw new Error("tasks must be an array of integers");
  if (tasks.length < 1 || tasks.length > MAX_TASKS) {
    throw new Error(`tasks must contain between 1 and ${MAX_TASKS} entries for this visualization`);
  }
  tasks.forEach((task, index) => {
    if (!Number.isInteger(task) || task < 1) throw new Error(`tasks[${index}] must be a positive integer`);
  });
  if (!Number.isInteger(space) || space < 0 || space > MAX_SPACE) {
    throw new Error(`space must be an integer from 0 to ${MAX_SPACE} for this visualization`);
  }
  return { tasks, space };
}

export function buildTrace(input) {
  const { tasks, space } = input.tasks ? input : parseInput(input);
  const last = new Map();
  const frames = [];
  let day = 0;
  const snap = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message, i: -1, day, space, last: Object.fromEntries(last), ...extra,
  });

  snap("setup", 2, "Start on day 0 with no task types recorded.");
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    snap("scan", 3, `Take task ${task} (index ${i}) in order.`, { i });
    day += 1;
    snap("advance", 4, `Day ${day}: task ${task} is attempted.`, { i });
    const cooling = last.has(task) && day - last.get(task) <= space;
    snap("check", 5, cooling
      ? `Task ${task} last ran on day ${last.get(task)}, which is too recent for space ${space}.`
      : `Task ${task} is ready on day ${day}.`, { i, cooling });
    if (cooling) {
      day = last.get(task) + space + 1;
      snap("wait", 6, `Take idle days so task ${task} runs on day ${day}.`, { i, cooling });
    }
    last.set(task, day);
    snap("record", 7, `Task ${task} runs on day ${day}.`, { i });
  }
  snap("done", 8, `All tasks are finished on day ${day}.`, { result: day });
  return { input: tasks, result: day, frames };
}
