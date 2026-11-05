export const code = `function findLatestTime(s) {
  const chars = [...s]
  if (chars[0] === '?')
    chars[0] = chars[1] === '?' || chars[1] <= '1' ? '1' : '0'
  if (chars[1] === '?')
    chars[1] = chars[0] === '1' ? '1' : '9'
  if (chars[3] === '?')
    chars[3] = '5'
  if (chars[4] === '?')
    chars[4] = '9'
  return chars.join('')
}`.split('\n').map((text, index) => ({ line: index + 1, text }));
export const python = `def findLatestTime(s):
    chars = list(s)
    if chars[0] == "?":
        chars[0] = "1" if chars[1] == "?" or chars[1] <= "1" else "0"
    if chars[1] == "?":
        chars[1] = "1" if chars[0] == "1" else "9"
    if chars[3] == "?":
        chars[3] = "5"
    if chars[4] == "?":
        chars[4] = "9"
    return "".join(chars)`;

export function parseInput(text) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error('Input must be a JSON object with s, e.g. {"s":"1?:?4"}');
  }
  if (!obj || typeof obj !== "object" || typeof obj.s !== "string") {
    throw new Error("s must be a string");
  }
  if (!/^[0-9?]{2}:[0-9?]{2}$/.test(obj.s)) {
    throw new Error('s must have the form HH:MM where each digit is 0-9 or "?"');
  }
  const fits = (h, m) => {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const str = `${hh}:${mm}`;
    return [0, 1, 3, 4].every((i) => obj.s[i] === "?" || obj.s[i] === str[i]);
  };
  let any = false;
  for (let h = 0; h <= 11 && !any; h++) {
    for (let m = 0; m <= 59 && !any; m++) {
      if (fits(h, m)) any = true;
    }
  }
  if (!any) {
    throw new Error("no valid time between 00:00 and 11:59 matches s");
  }
  return { s: obj.s };
}

export function buildTrace(input) {
  const { s } = input;
  const chars = s.split("");
  const filled = [];
  const frames = [];
  frames.push({ phase: "start", activeLine: 2, pythonLine: 2, message: `Start with ${s}.`, index: -1, chars: [...chars], filled: [...filled] });

  const steps = [
    { index: 0, ifLine: 3, assignLine: 4, phase: "hour-tens", fill: () => (chars[1] === "?" || chars[1] <= "1" ? "1" : "0"), note: "the second hour digit is ? or at most 1, so use 1, otherwise 0" },
    { index: 1, ifLine: 5, assignLine: 6, phase: "hour-units", fill: () => (chars[0] === "1" ? "1" : "9"), note: "the first hour digit is 1, so use 1, otherwise 9" },
    { index: 3, ifLine: 7, assignLine: 8, phase: "minute-tens", fill: () => "5", note: "the largest minute tens digit is 5" },
    { index: 4, ifLine: 9, assignLine: 10, phase: "minute-units", fill: () => "9", note: "the largest minute units digit is 9" },
  ];
  for (const st of steps) {
    const isQ = chars[st.index] === "?";
    frames.push({ phase: st.phase, activeLine: st.ifLine, pythonLine: st.ifLine, message: `Position ${st.index} is ${isQ ? "?" : chars[st.index]}.`, index: st.index, chars: [...chars], filled: [...filled] });
    if (isQ) {
      chars[st.index] = st.fill();
      filled.push(st.index);
      frames.push({ phase: st.phase, activeLine: st.assignLine, pythonLine: st.assignLine, message: `Fill with ${chars[st.index]}: ${st.note}.`, index: st.index, chars: [...chars], filled: [...filled] });
    }
  }
  const result = chars.join("");
  frames.push({ phase: "done", activeLine: 11, pythonLine: 11, message: `Latest time: ${result}.`, index: -1, chars: [...chars], filled: [...filled] });
  return { input, result, frames };
}
