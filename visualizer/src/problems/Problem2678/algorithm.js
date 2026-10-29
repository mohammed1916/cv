export const code = [
  { line: 1, text: "Set count to 0" },
  { line: 2, text: "For each detail in details" },
  { line: 3, text: "Read the age from positions 11 and 12 of the detail" },
  { line: 4, text: "If age is greater than 60, add one to count" },
  { line: 5, text: "Return count" },
];

export const python = `def countSeniors(details):
    count = 0
    for detail in details:
        age = int(detail[11:13])
        if age > 60:
            count += 1
    return count`;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"details":["7868190130M7522"]}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Input must be a JSON object with a details array");
  }
  const { details } = data;
  if (!Array.isArray(details)) {
    throw new Error("details must be an array of strings");
  }
  if (details.length < 1 || details.length > 50) {
    throw new Error(`details must contain between 1 and 50 items for this visualization (got ${details.length})`);
  }
  details.forEach((detail, index) => {
    if (typeof detail !== "string" || detail.length !== 15) {
      throw new Error(`details[${index}] must be a string of exactly 15 characters`);
    }
    if (!/^\d{10}$/.test(detail.slice(0, 10))) {
      throw new Error(`details[${index}] must start with 10 phone digits`);
    }
    if (detail[10] !== "M" && detail[10] !== "F") {
      throw new Error(`details[${index}] must have gender M or F at position 10`);
    }
    if (!/^\d{2}$/.test(detail.slice(11, 13))) {
      throw new Error(`details[${index}] must have two age digits at positions 11 and 12`);
    }
  });
  return { details };
}

export function buildTrace(input) {
  const { details } = input;
  const frames = [];
  const seniors = [];
  let count = 0;
  const push = (frame) => frames.push({ count, seniors: [...seniors], index: -1, age: null, checked: 0, ...frame });

  push({ phase: "start", activeLine: 1, pythonLine: 2, message: "Set count to 0." });
  details.forEach((detail, index) => {
    push({ phase: "scan", activeLine: 2, pythonLine: 3, index, checked: index, message: `Take detail ${index}: ${detail}.` });
    const age = Number(detail.slice(11, 13));
    push({ phase: "age", activeLine: 3, pythonLine: 4, index, age, checked: index, message: `Its age is ${age}.` });
    const senior = age > 60;
    push({ phase: "check", activeLine: 4, pythonLine: 5, index, age, checked: index,
      message: senior ? `${age} is greater than 60.` : `${age} is not greater than 60.` });
    if (senior) {
      count += 1;
      seniors.push(index);
      push({ phase: "add", activeLine: 4, pythonLine: 6, index, age, checked: index + 1, message: `Add one. Count is now ${count}.` });
    }
  });
  push({ phase: "done", activeLine: 5, pythonLine: 7, index: -1, checked: details.length, message: `Return ${count}.` });

  return { input, result: count, frames };
}
