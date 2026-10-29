export const code = [
  { line: 1, text: "pos = 1 and direction = 1" },
  { line: 2, text: "for each second from 1 to time" },
  { line: 3, text: "pos = pos + direction" },
  { line: 4, text: "if pos is 1 or pos is n" },
  { line: 5, text: "direction = minus direction" },
  { line: 6, text: "return pos" },
];

export const python = `def passThePillow(n, time):
    pos = 1
    direction = 1
    for _ in range(time):
        pos += direction
        if pos == 1 or pos == n:
            direction = -direction
    return pos`;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"n": 4, "time": 5}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Input must be a JSON object with keys n and time");
  }
  const { n, time } = data;
  if (!Number.isInteger(n) || n < 2 || n > 1000) throw new Error("n must be an integer from 2 to 1000");
  if (!Number.isInteger(time) || time < 1 || time > 1000) throw new Error("time must be an integer from 1 to 1000");
  return { n, time };
}

export function buildTrace(input) {
  const { n, time } = input;
  const frames = [];
  let pos = 1;
  let direction = 1;
  const frame = (phase, activeLine, pythonLine, second, message) =>
    frames.push({ phase, activeLine, pythonLine, second, message, n, time, pos, direction });

  frame("setup", 1, 2, 0, "Person 1 starts with the pillow.");
  frame("setup", 1, 3, 0, "The pillow moves toward larger person numbers first.");
  for (let second = 1; second <= time; second++) {
    frame("loop", 2, 4, second, `Second ${second}: the pillow is passed once more.`);
    pos += direction;
    frame("move", 3, 5, second, `The pillow moves to person ${pos}.`);
    const atEnd = pos === 1 || pos === n;
    frame("check", 4, 6, second, atEnd ? `Person ${pos} is at an end of the line.` : "The pillow is not at an end, so the direction stays.");
    if (atEnd) {
      direction = -direction;
      frame("turn", 5, 7, second, `Direction reverses to ${direction}.`);
    }
  }
  frame("done", 6, 8, time, `After ${time} seconds, person ${pos} holds the pillow.`);
  return { input, result: pos, frames };
}
