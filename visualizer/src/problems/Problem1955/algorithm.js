// LeetCode 1955: track how many special subsequences end in each stage 0, 1, 2; each new value extends the stage before it.
const MOD = 1000000007
const SOURCE = [
  "function countSpecialSubsequences(nums) {",
  "  const MOD = 1000000007",
  "  let zero = 0, one = 0, two = 0",
  "  for (const x of nums) {",
  "    if (x === 0) zero = (2 * zero + 1) % MOD",
  "    else if (x === 1) one = (2 * one + zero) % MOD",
  "    else two = (2 * two + one) % MOD",
  "  }",
  "  return two",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def count_special_subsequences(nums):
    MOD = 10**9 + 7
    zero = one = two = 0
    for x in nums:
        if x == 0:
            zero = (2 * zero + 1) % MOD
        elif x == 1:
            one = (2 * one + zero) % MOD
        else:
            two = (2 * two + one) % MOD
    return two
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'scan', label: 'Scan values', description: 'Each value extends the stage before it.' },
  { id: 'done', label: 'Result', description: 'Special subsequences ending in stage 2.' },
]

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Enter a JSON array of 0, 1 and 2, for example [0,1,2,2].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => v === 0 || v === 1 || v === 2)) throw new Error('Use 1 to 12 values, each 0, 1 or 2.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let zero = 0, one = 0, two = 0
  nums.forEach((x, i) => {
    let line, py
    if (x === 0) { zero = (2 * zero + 1) % MOD; line = L('x === 0'); py = P('if x == 0') }
    else if (x === 1) { one = (2 * one + zero) % MOD; line = L('x === 1'); py = P('elif x == 1') }
    else { two = (2 * two + one) % MOD; line = L('else two ='); py = P('two = (2') }
    frames.push({ phase: 'scan', activeLine: line, pythonLine: py, message: `Value ${x} at index ${i}: zero ${zero}, one ${one}, two ${two}.`, i, x, zero, one, two })
  })
  frames.push({ phase: 'done', activeLine: L('return two'), pythonLine: P('return two'), message: `${two} special subsequence(s).`, i: -1, x: null, zero, one, two })
  return { input: { nums }, result: two, frames }
}
