const PY = [
  "def largestPalindrome(n, k):",
  "    half = (n + 1) // 2",
  "    weight = [0] * half",
  "    for i in range(half):",
  "        j = n - 1 - i",
  "        if i == j:",
  "            weight[i] = pow(10, i, k)",
  "        else:",
  "            weight[i] = (pow(10, i, k) + pow(10, j, k)) % k",
  "    reach = [set() for _ in range(half + 1)]",
  "    reach[half] = {0}",
  "    for i in range(half - 1, -1, -1):",
  "        reach[i] = {(r + d * weight[i]) % k for r in reach[i + 1] for d in range(10)}",
  "    digits = []",
  "    cur = 0",
  "    for i in range(half):",
  "        low = 1 if i == 0 else 0",
  "        for d in range(9, low - 1, -1):",
  "            total = (cur + d * weight[i]) % k",
  "            if (-total) % k in reach[i + 1]:",
  "                digits.append(d)",
  "                cur = total",
  "                break",
  "        else:",
  "            return \"\"",
  "    left = [str(d) for d in digits]",
  "    return \"\".join(left + left[::-1][n % 2:])",
]

export const python = PY.join("\n")
const at = text => PY.findIndex(line => line.includes(text)) + 1

export const code = [
  { line: 1, text: "compute the remainder weight of each mirrored pair of positions" },
  { line: 2, text: "build reach sets from the right end back to the left" },
  { line: 3, text: "for each position from the outside in" },
  { line: 4, text: "try digits from 9 down to 0, or down to 1 at the first position" },
  { line: 5, text: "keep the digit when some completion reaches remainder 0" },
  { line: 6, text: "mirror the chosen half into a palindrome" },
  { line: 7, text: "return the palindrome, or an empty string when none exists" },
]

const MAX_N = 40

function readJson(text) {
  if (typeof text !== "string") return text
  try { return JSON.parse(text) } catch (error) {
    throw new Error(`Input must be JSON such as {"n": 3, "k": 5}: ${error.message}`)
  }
}

export function parseInput(text) {
  const data = readJson(text)
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be an object with keys "n" and "k".')
  const { n, k } = data
  if (!Number.isInteger(n) || n < 1) throw new Error('Key "n" must be an integer of at least 1.')
  if (n > MAX_N) throw new Error(`The visualization accepts n up to ${MAX_N}; the official limit is 10^5.`)
  if (!Number.isInteger(k) || k < 1 || k > 9) throw new Error('Key "k" must be an integer from 1 to 9.')
  return { n, k }
}

export function buildTrace(input) {
  const { n, k } = input
  const half = Math.floor((n + 1) / 2)
  const pow10 = [1 % k]
  for (let i = 1; i < n; i += 1) pow10.push((pow10[i - 1] * 10) % k)
  const weight = Array(half).fill(0)
  for (let i = 0; i < half; i += 1) {
    const j = n - 1 - i
    weight[i] = i === j ? pow10[i] : (pow10[i] + pow10[j]) % k
  }
  const reach = Array.from({ length: half + 1 }, () => new Set())
  reach[half].add(0)
  for (let i = half - 1; i >= 0; i -= 1) {
    for (const r of reach[i + 1]) for (let d = 0; d <= 9; d += 1) reach[i].add((r + d * weight[i]) % k)
  }
  const reachRows = reach.map(set => Array.from({ length: k }, (_, c) => set.has(c)))
  const frames = []
  const digits = []
  let cur = 0
  const add = (phase, activeLine, pythonText, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: at(pythonText), message, n, k, half, weight: [...weight],
    reachRows, digits: [...digits], cur, pos: -1, tried: null, need: null, ...extra,
  })
  add("weights", 1, "weight = [0] * half", `Each mirrored pair contributes a weight modulo ${k}.`)
  add("reach", 2, "reach = [set()", "Reach sets record which remainders the positions from i onward can produce.")
  let result = ""
  let failed = false
  for (let i = 0; i < half && !failed; i += 1) {
    const low = i === 0 ? 1 : 0
    let placed = false
    for (let d = 9; d >= low; d -= 1) {
      const total = (cur + d * weight[i]) % k
      const need = (k - total) % k
      const ok = reach[i + 1].has(need)
      add("try", 4, "for d in range(9", `Position ${i}: try digit ${d}; it needs a completion with remainder ${need}.`, { pos: i, tried: d, need, ok })
      if (ok) {
        digits.push(d)
        cur = total
        add("keep", 5, "digits.append(d)", `Keep digit ${d} at position ${i}.`, { pos: i, tried: d, need, ok })
        placed = true
        break
      }
    }
    if (!placed) {
      add("none", 7, 'return ""', `No digit fits position ${i}, so no palindrome exists.`, { pos: i })
      failed = true
    }
  }
  if (!failed) {
    const left = digits.map(String)
    const mirror = left.slice().reverse().slice(n % 2)
    result = left.concat(mirror).join("")
    add("mirror", 6, "left = [str(d)", `Mirror the half to form ${result}.`, { pos: -1 })
  }
  add("done", 7, '"".join(left', `Return "${result}".`, { pos: -1 })
  return { input: { n, k }, result, frames }
}
