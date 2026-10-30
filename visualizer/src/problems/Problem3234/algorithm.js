const PY = [
  "def countDominantOnes(s):",
  "    n = len(s)",
  "    count = 0",
  "    for left in range(n):",
  "        zeros = 0",
  "        ones = 0",
  "        for right in range(left, n):",
  "            if s[right] == \"1\":",
  "                ones += 1",
  "            else:",
  "                zeros += 1",
  "            if zeros * zeros > n:",
  "                break",
  "            if ones >= zeros * zeros:",
  "                count += 1",
  "    return count",
]

export const python = PY.join("\n")
const at = text => PY.findIndex(line => line.includes(text)) + 1

export const code = [
  { line: 1, text: "count = 0" },
  { line: 2, text: "for each left index in s" },
  { line: 3, text: "set zeros and ones to 0" },
  { line: 4, text: "for each right index from left to the end" },
  { line: 5, text: "add s[right] to ones or to zeros" },
  { line: 6, text: "if zeros squared is greater than n, stop this left index" },
  { line: 7, text: "if ones is at least zeros squared, increase count by 1" },
  { line: 8, text: "return count" },
]

const MAX_LENGTH = 60

function readJson(text) {
  if (typeof text !== "string") return text
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`Input must be JSON such as {"s": "101101"}: ${error.message}`)
  }
}

export function parseInput(text) {
  const data = readJson(text)
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be an object with key "s".')
  const { s } = data
  if (typeof s !== "string") throw new Error('Key "s" must be a string of 0 and 1 characters.')
  if (s.length < 1) throw new Error('Key "s" must contain at least one character.')
  if (s.length > MAX_LENGTH) throw new Error(`The visualization accepts at most ${MAX_LENGTH} characters; the official limit is 4 * 10^4.`)
  if (!/^[01]+$/.test(s)) throw new Error('Key "s" may contain only the characters 0 and 1.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const n = s.length
  const frames = []
  let count = 0
  const add = (phase, activeLine, pythonText, message, extra) => frames.push({
    phase, activeLine, pythonLine: at(pythonText), message, s, n, count, ...extra,
  })
  add("init", 1, "count = 0", "Start with no dominant substrings counted.", { left: -1, right: -1, zeros: 0, ones: 0 })
  for (let left = 0; left < n; left += 1) {
    let zeros = 0
    let ones = 0
    add("start", 3, "zeros = 0", `Start a substring at index ${left}.`, { left, right: left, zeros, ones })
    for (let right = left; right < n; right += 1) {
      if (s[right] === "1") {
        ones += 1
        add("extend", 5, "ones += 1", `Add s[${right}] = 1 to the window.`, { left, right, zeros, ones })
      } else {
        zeros += 1
        add("extend", 5, "zeros += 1", `Add s[${right}] = 0 to the window.`, { left, right, zeros, ones })
      }
      if (zeros * zeros > n) {
        add("stop", 6, "break", `${zeros} zeros means zeros squared exceeds n, so longer substrings from ${left} cannot qualify.`, { left, right, zeros, ones })
        break
      }
      if (ones >= zeros * zeros) {
        count += 1
        add("count", 7, "count += 1", `s[${left}..${right}] is dominant: ${ones} ones versus ${zeros} zeros squared.`, { left, right, zeros, ones })
      } else {
        add("check", 7, "if ones >= zeros * zeros", `s[${left}..${right}] is not dominant: ${ones} ones is below ${zeros * zeros}.`, { left, right, zeros, ones })
      }
    }
  }
  add("done", 8, "return count", `Return ${count} dominant substrings.`, { left: -1, right: -1, zeros: 0, ones: 0 })
  return { input: { s }, result: count, frames }
}
