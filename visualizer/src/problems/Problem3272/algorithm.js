const PY = [
  "from math import factorial",
  "",
  "def countGoodIntegers(n, k):",
  "    half = (n + 1) // 2",
  "    good = set()",
  "    for first in range(10 ** (half - 1), 10 ** half):",
  "        s = str(first)",
  "        palindrome = s + s[::-1][n % 2:]",
  "        if int(palindrome) % k == 0:",
  "            good.add(tuple(sorted(palindrome)))",
  "    total = 0",
  "    for multiset in good:",
  "        counts = [0] * 10",
  "        for ch in multiset:",
  "            counts[int(ch)] += 1",
  "        arrangements = factorial(n)",
  "        for c in counts:",
  "            arrangements //= factorial(c)",
  "        if counts[0] > 0:",
  "            leading = factorial(n - 1)",
  "            counts[0] -= 1",
  "            for c in counts:",
  "                leading //= factorial(c)",
  "            arrangements -= leading",
  "        total += arrangements",
  "    return total",
]

export const python = PY.join("\n")
const at = text => PY.findIndex(line => line.includes(text)) + 1

export const code = [
  { line: 1, text: "total is 0 and good is an empty set" },
  { line: 2, text: "for each palindrome of n digits with a nonzero first digit" },
  { line: 3, text: "build the palindrome from its first half" },
  { line: 4, text: "if it is divisible by k, add its sorted digits to good" },
  { line: 5, text: "for each digit multiset in good" },
  { line: 6, text: "count the arrangements of its digits" },
  { line: 7, text: "subtract the arrangements that start with 0" },
  { line: 8, text: "add the rest to total" },
  { line: 9, text: "return total" },
]

const MAX_N = 6
const MAX_K = 9

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
  if (n > MAX_N) throw new Error(`The visualization accepts n up to ${MAX_N}.`)
  if (!Number.isInteger(k) || k < 1 || k > MAX_K) throw new Error(`Key "k" must be an integer from 1 to ${MAX_K}.`)
  return { n, k }
}

const fact = m => { let out = 1; for (let i = 2; i <= m; i += 1) out *= i; return out }

export function buildTrace(input) {
  const { n, k } = input
  const half = Math.floor((n + 1) / 2)
  const frames = []
  const candidates = []
  const good = new Map()
  let total = 0
  const add = (phase, activeLine, pythonText, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: at(pythonText), message, n, k, candidates, total, index: -1, ...extra,
  })
  add("setup", 1, "good = set()", "Start with no good digit multisets and a total of 0.")
  const low = 10 ** (half - 1)
  const high = 10 ** half
  for (let first = low; first < high; first += 1) {
    const s = String(first)
    const palindrome = s + s.split("").reverse().join("").slice(n % 2)
    const divisible = Number(palindrome) % k === 0
    candidates.push({ text: palindrome, divisible })
    add("palindrome", 3, "palindrome = s + s[::-1][n % 2:]", `Build the palindrome ${palindrome}.`, { index: candidates.length - 1 })
    if (divisible) {
      const key = palindrome.split("").sort().join("")
      good.set(key, true)
      add("keep", 4, "good.add(tuple(sorted(palindrome)))", `${palindrome} is divisible by ${k}; its digits ${key} are good.`, { index: candidates.length - 1 })
    } else {
      add("skip", 4, "if int(palindrome) % k == 0", `${palindrome} is not divisible by ${k}.`, { index: candidates.length - 1 })
    }
  }
  for (const key of good.keys()) {
    const counts = Array(10).fill(0)
    for (const ch of key) counts[Number(ch)] += 1
    let arrangements = fact(n)
    counts.forEach(c => { arrangements /= fact(c) })
    add("arrange", 6, "arrangements = factorial(n)", `Digits ${key}: ${arrangements} arrangement(s) in total.`, { key, arrangements })
    if (counts[0] > 0) {
      let leading = fact(n - 1)
      counts[0] -= 1
      counts.forEach(c => { leading /= fact(c) })
      arrangements -= leading
      add("leading", 7, "arrangements -= leading", `Remove ${leading} arrangement(s) that start with 0, leaving ${arrangements}.`, { key, arrangements })
    }
    total += arrangements
    add("add", 8, "total += arrangements", `Running total is ${total}.`, { key, arrangements })
  }
  add("done", 9, "return total", `Return ${total} good integers.`)
  return { input: { n, k }, result: total, frames }
}
