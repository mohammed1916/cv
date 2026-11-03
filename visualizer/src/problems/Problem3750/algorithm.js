export function parseInput(text) {
  const n = Number(text.trim())
  if (!Number.isInteger(n) || n < 1 || n > 1023) throw new Error('Use a whole number from 1 to 1023.')
  return n
}

export function buildTrace(n) {
  const s = n.toString(2)
  const last = s.length - 1
  const frames = []
  let flips = 0
  frames.push({ pythonLine: PL('s = bin'), phase: 'start', activeLine: L('binary form of n'), i: -1, j: -1, s, flips, message: `${n} is ${s} in binary.` })
  for (let i = 0; i < Math.floor(s.length / 2); i++) {
    const j = last - i
    if (s[i] !== s[j]) {
      flips += 2
      frames.push({ pythonLine: PL('flips += 2'), phase: 'mismatch', activeLine: L('differ'), i, j, s, flips,
        message: `Positions ${i} and ${j} hold ${s[i]} and ${s[j]}; both must flip, total ${flips}.` })
    } else {
      frames.push({ pythonLine: PL('if s[i] != s[j]'), phase: 'match', activeLine: L('differ'), i, j, s, flips,
        message: `Positions ${i} and ${j} already agree (${s[i]}); no flip.` })
    }
  }
  frames.push({ pythonLine: PL('return flips'), phase: 'done', activeLine: L('return the count'), i: -1, j: -1, s, flips, message: `Minimum flips: ${flips}.` })
  return { input: { n, s }, result: flips, frames }
}

export const code = `minimum flips so the binary form equals its reverse
  s is the binary form of n
  flips is 0
  for each index i in the first half
    j is the mirror index of i
    if the bits at i and j differ then add 2 to flips
  return the count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_flips(n):
    s = bin(n)[2:]
    flips = 0
    for i in range(len(s) // 2):
        j = len(s) - 1 - i
        if s[i] != s[j]:
            flips += 2
    return flips
`
const PL = s => python.split('\n').findIndex(c => c.includes(s)) + 1
