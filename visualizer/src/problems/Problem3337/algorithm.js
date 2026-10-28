const MOD = 1000000007n
const MAX_LENGTH = 12
const MAX_ROUNDS = 1000

export function parseInput(text) {
  const data = JSON.parse(text)
  const { s, t, nums } = data ?? {}
  if (typeof s !== 'string' || s.length < 1 || s.length > MAX_LENGTH || !/^[a-z]+$/.test(s)) throw new Error(`s must be 1 to ${MAX_LENGTH} lowercase letters.`)
  if (!Number.isInteger(t) || t < 0 || t > MAX_ROUNDS) throw new Error(`t must be an integer from 0 to ${MAX_ROUNDS}.`)
  if (!Array.isArray(nums) || nums.length !== 26 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 25)) throw new Error('nums must be 26 integers from 1 to 25, one for each letter a to z.')
  return { s, t, nums }
}

export const code = `total length after t transformations(s, t, nums)
  count how many times each letter from a to z appears in s
  build a 26 by 26 table where row c marks the next nums value of letters after c, wrapping from z to a
  set power to the table
  repeat while t is above zero
    if the lowest bit of t is one
      multiply the counts by power
    square power
    shift t right by one bit
  return the sum of all counts, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const sumMod = counts => counts.reduce((total, value) => (total + value) % MOD, 0n)
const mulVec = (v, p) => Array.from({ length: 26 }, (_, j) => {
  let total = 0n
  for (let i = 0; i < 26; i++) total = (total + v[i] * p[i][j]) % MOD
  return total
})
const mulMat = (a, b) => Array.from({ length: 26 }, (_, i) => Array.from({ length: 26 }, (_, j) => {
  let total = 0n
  for (let k = 0; k < 26; k++) total = (total + a[i][k] * b[k][j]) % MOD
  return total
}))

export function buildTrace({ s, t, nums }) {
  const table = Array.from({ length: 26 }, (_, c) => Array.from({ length: 26 }, (_, j) => {
    const offset = (j - c + 26) % 26
    return offset >= 1 && offset <= nums[c] ? 1n : 0n
  }))
  let counts = Array(26).fill(0n)
  for (const ch of s) counts[ch.charCodeAt(0) - 97] += 1n
  let power = table
  let remaining = t
  let bit = 0
  const frames = [{ phase: 'start', bit: null, counts: counts.map(Number), length: Number(sumMod(counts)), activeLine: L('count how many'), message: `Count the letters of ${s}. Each round replaces a letter by the next nums letters.` }]
  while (remaining > 0) {
    if (remaining % 2 === 1) {
      counts = mulVec(counts, power)
      frames.push({ phase: 'apply', bit, counts: counts.map(Number), length: Number(sumMod(counts)), activeLine: L('multiply the counts'), message: `Bit ${bit} of t is one, so apply the table for ${2 ** bit} rounds. Length: ${sumMod(counts)}.` })
    }
    power = mulMat(power, power)
    remaining = Math.floor(remaining / 2)
    bit += 1
    frames.push({ phase: 'square', bit, counts: counts.map(Number), length: Number(sumMod(counts)), activeLine: L('square power'), message: `The table now covers ${2 ** bit} rounds.` })
  }
  const result = Number(sumMod(counts))
  frames.push({ phase: 'done', bit, counts: counts.map(Number), length: result, activeLine: L('return the sum'), message: `Total length after ${t} rounds: ${result}.` })
  return { input: { s, t, nums }, result, frames }
}

export const python = `def total_length_after_transformations(s, t, nums):
    MOD = 1000000007
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - ord('a')] += 1
    table = [[0] * 26 for _ in range(26)]
    for c in range(26):
        for step in range(1, nums[c] + 1):
            table[c][(c + step) % 26] = 1

    def multiply_vector(vec, mat):
        return [sum(vec[i] * mat[i][j] for i in range(26)) % MOD for j in range(26)]

    def multiply_matrix(a, b):
        return [[sum(a[i][k] * b[k][j] for k in range(26)) % MOD for j in range(26)] for i in range(26)]

    power = table
    remaining = t
    while remaining > 0:
        if remaining & 1:
            counts = multiply_vector(counts, power)
        power = multiply_matrix(power, power)
        remaining >>= 1
    return sum(counts) % MOD
`
