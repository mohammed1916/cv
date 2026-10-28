const MOD = 1000000007
const MAX_LENGTH = 20
const MAX_ROUNDS = 20

export function parseInput(text) {
  const data = JSON.parse(text)
  const { s, t } = data ?? {}
  if (typeof s !== 'string' || s.length < 1 || s.length > MAX_LENGTH || !/^[a-z]+$/.test(s)) throw new Error(`s must be 1 to ${MAX_LENGTH} lowercase letters.`)
  if (!Number.isInteger(t) || t < 0 || t > MAX_ROUNDS) throw new Error(`t must be an integer from 0 to ${MAX_ROUNDS}.`)
  return { s, t }
}

export const code = `total length after t transformations(s, t)
  count how many times each letter from a to z appears in s
  repeat t times
    start the next counts with 26 zeros
    for each letter from a to y
      add its count to the count of the next letter
    add the count of z to the counts of a and b
    replace the counts with the next counts
  return the sum of all counts, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const sum = counts => counts.reduce((total, value) => (total + value) % MOD, 0)

export function buildTrace({ s, t }) {
  let counts = Array(26).fill(0)
  for (const ch of s) counts[ch.charCodeAt(0) - 97] += 1
  const frames = [{ phase: 'start', step: 0, counts: [...counts], length: sum(counts), activeLine: L('count how many'), message: `Count the letters of ${s}. The string has ${sum(counts)} characters.` }]
  for (let step = 1; step <= t; step++) {
    const next = Array(26).fill(0)
    for (let c = 0; c < 25; c++) next[c + 1] = (next[c + 1] + counts[c]) % MOD
    next[0] = (next[0] + counts[25]) % MOD
    next[1] = (next[1] + counts[25]) % MOD
    counts = next
    frames.push({ phase: 'step', step, counts: [...counts], length: sum(counts), activeLine: L('replace the counts'), message: `Round ${step}: every letter moves one place forward and z becomes ab. The length is now ${sum(counts)}.` })
  }
  const result = sum(counts)
  frames.push({ phase: 'done', step: t, counts: [...counts], length: result, activeLine: L('return the sum'), message: `Total length after ${t} rounds: ${result}.` })
  return { input: { s, t }, result, frames }
}

export const python = `def total_length_after_transformations(s, t):
    MOD = 1000000007
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - ord('a')] += 1
    for _ in range(t):
        nxt = [0] * 26
        for c in range(25):
            nxt[c + 1] = (nxt[c + 1] + counts[c]) % MOD
        nxt[0] = (nxt[0] + counts[25]) % MOD
        nxt[1] = (nxt[1] + counts[25]) % MOD
        counts = nxt
    return sum(counts) % MOD
`
