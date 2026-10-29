export const code = [
  { line: 1, text: "Set end to the length of num" },
  { line: 2, text: "While end is above 0 and the character before end is zero" },
  { line: 3, text: "Move end one step left" },
  { line: 4, text: "Return num from the start up to end" },
];

export const python = `def removeTrailingZeros(num):
    end = len(num)
    while end > 0 and num[end - 1] == "0":
        end -= 1
    return num[:end]`;

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object such as {"num":"51230100"}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Input must be a JSON object with a num string");
  }
  const { num } = data;
  if (typeof num !== "string") {
    throw new Error("num must be a string");
  }
  if (num.length < 1 || num.length > 1000) {
    throw new Error(`num length must be between 1 and 1000 (got ${num.length})`);
  }
  if (!/^[0-9]+$/.test(num)) {
    throw new Error("num must contain digits only");
  }
  if (num[0] === "0") {
    throw new Error("num must not have leading zeros");
  }
  return { num };
}

export function buildTrace(input) {
  const { num } = input;
  const frames = [];
  let end = num.length;
  const push = (frame) => frames.push({ end, index: -1, ...frame });

  push({ phase: "start", activeLine: 1, pythonLine: 2, message: `Set end to ${end}, the length of num.` });
  while (true) {
    const isZero = end > 0 && num[end - 1] === "0";
    if (end > 0) {
      push({ phase: "scan", activeLine: 2, pythonLine: 3, index: end - 1,
        message: isZero ? `Character ${end - 1} is 0, so keep scanning.` : `Character ${end - 1} is ${num[end - 1]}, so stop.` });
    }
    if (!isZero) break;
    end -= 1;
    push({ phase: "drop", activeLine: 3, pythonLine: 4, index: end, message: `Move end left to ${end}.` });
  }
  const result = num.slice(0, end);
  push({ phase: "done", activeLine: 4, pythonLine: 5, index: -1, message: `Return "${result}".` });

  return { input, result, frames };
}
