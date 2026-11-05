export const code = `function buttonWithLongestTime(events) {
  let bestIndex = -1
  let bestTime = -1
  let previous = 0
  for (const [index, press] of events) {
    const duration = press - previous
    previous = press
    if (duration > bestTime || (duration === bestTime && index < bestIndex)) {
      bestIndex = index
      bestTime = duration
    }
  }
  return bestIndex
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def buttonWithLongestTime(events):
    best_index = -1
    best_time = -1
    previous = 0
    for index, press in events:
        duration = press - previous
        previous = press
        if duration > best_time or (duration == best_time and index < best_index):
            best_index = index
            best_time = duration
    return best_index`;

const PYTHON_LINES = python.split("\n");
const pyLine = text => PYTHON_LINES.findIndex(line => line.includes(text)) + 1;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"events": [[1,2],[2,5]]}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with an "events" key');
  const { events } = data;
  if (!Array.isArray(events) || events.length < 1) throw new Error('"events" must be a non-empty array of [index, time] pairs');
  if (events.length > 40) throw new Error(`"events" has ${events.length} entries; the visualization accepts at most 40`);
  let previousTime = 0;
  events.forEach((event, position) => {
    if (!Array.isArray(event) || event.length !== 2 || !event.every(Number.isInteger)) {
      throw new Error(`events[${position}] must be an [index, time] pair of integers`);
    }
    const [index, time] = event;
    if (index < 0) throw new Error(`events[${position}] has a negative button index`);
    if (time <= previousTime) throw new Error(`events[${position}] time must be greater than the previous press time (${previousTime})`);
    previousTime = time;
  });
  return { events };
}

export function buildTrace(input) {
  const { events } = input;
  const frames = [];
  let bestIndex = -1;
  let bestTime = -1;
  let previous = 0;
  const durations = [];
  frames.push({
    phase: "setup", activeLine: L("let bestIndex = -1"), pythonLine: pyLine("best_index = -1"),
    message: "No button has been judged yet; the previous press time is 0.",
    position: -1, index: null, duration: null, best: null, durations: [],
  });
  events.forEach(([index, press], position) => {
    const duration = press - previous;
    frames.push({
      phase: "scan", activeLine: L("for (const [index, press] of events)"), pythonLine: pyLine("for index, press"),
      message: `Event ${position + 1}: button ${index} pressed at ${press}.`,
      position, index, duration: null, best: bestIndex, durations: [...durations],
    });
    durations.push(duration);
    frames.push({
      phase: "measure", activeLine: L("const duration = press - previous"), pythonLine: pyLine("duration = press - previous"),
      message: `Push time is ${press} - ${previous} = ${duration}.`,
      position, index, duration, best: bestIndex, durations: [...durations],
    });
    previous = press;
    const better = duration > bestTime || (duration === bestTime && index < bestIndex);
    frames.push({
      phase: "compare", activeLine: L("if (duration > bestTime"), pythonLine: pyLine("if duration > best_time"),
      message: better
        ? `${duration} beats the best push time ${bestTime}, so button ${index} becomes the best.`
        : `${duration} does not beat the best push time ${bestTime}; button ${bestIndex} stays.`,
      position, index, duration, best: bestIndex, durations: [...durations], better,
    });
    if (better) {
      bestIndex = index;
      bestTime = duration;
    }
  });
  frames.push({
    phase: "done", activeLine: L("return bestIndex"), pythonLine: pyLine("return best_index"),
    message: `Button ${bestIndex} had the longest push time, ${bestTime}.`,
    position: -1, index: null, duration: null, best: bestIndex, durations: [...durations], result: bestIndex,
  });
  return { input, result: bestIndex, frames };
}
