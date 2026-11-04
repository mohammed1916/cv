const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string' || !/^[01]{3,12}$/.test(input.s)) throw new Error('Use an object with s: a string of 3 to 12 characters, each 0 or 1.')
  return { s: input.s }
}

export function buildTrace(input) {
  const { s } = input
  const n = s.length
  const ones = []
  for (let i = 0; i < n; i++) if (s[i] === '1') ones.push(i)
  const frames = [{ phase: 'count', pythonLine: 4, activeLine: L('const ones = []'), index: -1, ones: [...ones], message: `The string has ${ones.length} one(s).` }]
  let result
  if (ones.length % 3 !== 0) {
    result = 0
    frames.push({ phase: 'done', pythonLine: 6, activeLine: L('return 0'), index: n, ones: [...ones], result, message: 'The ones cannot be split into three equal groups.' })
    return { input, result, frames }
  }
  const t = ones.length / 3
  if (t === 0) {
    // With no ones, any two cut points work: choose 2 of the n - 1 gaps.
    result = ((n - 1) * (n - 2) / 2) % MOD
    frames.push({ phase: 'zeros', pythonLine: 9, activeLine: L('if (t === 0)'), index: n, ones: [], result, message: `No ones: choose 2 of ${n - 1} gaps, giving ${result}.` })
    return { input, result, frames }
  }
  const first = ones[t] - ones[t - 1]
  frames.push({ phase: 'first', pythonLine: 10, activeLine: L('const first'), index: ones[t], ones: [...ones], firstGaps: first, message: `First cut can fall in ${first} gap(s) between one ${t - 1} and one ${t}.` })
  const second = ones[2 * t] - ones[2 * t - 1]
  frames.push({ phase: 'second', pythonLine: 11, activeLine: L('const second'), index: ones[2 * t], ones: [...ones], firstGaps: first, secondGaps: second, message: `Second cut can fall in ${second} gap(s) between one ${2 * t - 1} and one ${2 * t}.` })
  result = (first * second) % MOD
  frames.push({ phase: 'done', pythonLine: 12, activeLine: L('return (first * second)'), index: n, ones: [...ones], firstGaps: first, secondGaps: second, result, message: `Ways: ${first} times ${second} is ${result}.` })
  return { input, result, frames }
}

const CODE = [
  'const MOD = 1000000007',
  'function numWays(s) {',
  '  const n = s.length',
  '  const ones = []',
  "  for (let i = 0; i < n; i++) if (s[i] === '1') ones.push(i)",
  '  if (ones.length % 3 !== 0) return 0',
  '  const t = ones.length / 3',
  '  if (t === 0) return ((n - 1) * (n - 2) / 2) % MOD',
  '  const first = ones[t] - ones[t - 1]',
  '  const second = ones[2 * t] - ones[2 * t - 1]',
  '  return (first * second) % MOD',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(c => c.includes(s)) + 1

export const python = `def num_ways(s):
    MOD = 10**9 + 7
    n = len(s)
    ones = [i for i, ch in enumerate(s) if ch == '1']
    if len(ones) % 3 != 0:
        return 0
    t = len(ones) // 3
    if t == 0:
        return ((n - 1) * (n - 2) // 2) % MOD
    first = ones[t] - ones[t - 1]
    second = ones[2 * t] - ones[2 * t - 1]
    return (first * second) % MOD
`
