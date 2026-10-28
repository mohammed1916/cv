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
  const frames = [{ phase: 'count', activeLine: L('collect the positions of the ones'), index: -1, ones: [...ones], message: `The string has ${ones.length} one(s).` }]
  let result
  if (ones.length % 3 !== 0) {
    result = 0
    frames.push({ phase: 'done', activeLine: L('return 0'), index: n, ones: [...ones], result, message: 'The ones cannot be split into three equal groups.' })
    return { input, result, frames }
  }
  const t = ones.length / 3
  if (t === 0) {
    // With no ones, any two cut points work: choose 2 of the n - 1 gaps.
    result = ((n - 1) * (n - 2) / 2) % MOD
    frames.push({ phase: 'zeros', activeLine: L('choose 2 of the n minus 1 gaps'), index: n, ones: [], result, message: `No ones: choose 2 of ${n - 1} gaps, giving ${result}.` })
    return { input, result, frames }
  }
  const first = ones[t] - ones[t - 1]
  frames.push({ phase: 'first', activeLine: L('first cut gaps'), index: ones[t], ones: [...ones], firstGaps: first, message: `First cut can fall in ${first} gap(s) between one ${t - 1} and one ${t}.` })
  const second = ones[2 * t] - ones[2 * t - 1]
  frames.push({ phase: 'second', activeLine: L('second cut gaps'), index: ones[2 * t], ones: [...ones], firstGaps: first, secondGaps: second, message: `Second cut can fall in ${second} gap(s) between one ${2 * t - 1} and one ${2 * t}.` })
  result = (first * second) % MOD
  frames.push({ phase: 'done', activeLine: L('return the product'), index: n, ones: [...ones], firstGaps: first, secondGaps: second, result, message: `Ways: ${first} times ${second} is ${result}.` })
  return { input, result, frames }
}

export const code = `count ways to split a binary string into three parts with equal ones
  collect the positions of the ones
  if the count of ones is not a multiple of 3 then return 0
  set t to the count of ones divided by 3
  if t is 0 then choose 2 of the n minus 1 gaps, modulo 1000000007, and return it
  first cut gaps: the positions of one t and one t minus 1 give the gap count
  second cut gaps: the positions of one 2t and one 2t minus 1 give the gap count
  return the product of the two gap counts, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
