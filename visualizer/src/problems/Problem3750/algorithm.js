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
  frames.push({ pythonLine: P('s = bin'), phase: 'start', activeLine: L('const s = n.toString'), i: -1, j: -1, s, flips, message: `${n} is ${s} in binary.` })
  for (let i = 0; i < Math.floor(s.length / 2); i++) {
    const j = last - i
    if (s[i] !== s[j]) {
      flips += 2
      frames.push({ pythonLine: P('flips += 2'), phase: 'mismatch', activeLine: L('if (s[i] !== s[j])'), i, j, s, flips,
        message: `Positions ${i} and ${j} hold ${s[i]} and ${s[j]}; both must flip, total ${flips}.` })
    } else {
      frames.push({ pythonLine: P('if s[i] != s[j]'), phase: 'match', activeLine: L('if (s[i] !== s[j])'), i, j, s, flips,
        message: `Positions ${i} and ${j} already agree (${s[i]}); no flip.` })
    }
  }
  frames.push({ pythonLine: P('return flips'), phase: 'done', activeLine: L('return flips'), i: -1, j: -1, s, flips, message: `Minimum flips: ${flips}.` })
  return { input: { n, s }, result: flips, frames }
}

export const code = `function minFlips(n) {
  const s = n.toString(2)
  const last = s.length - 1
  let flips = 0
  for (let i = 0; i < Math.floor(s.length / 2); i++) {
    const j = last - i
    if (s[i] !== s[j]) flips += 2
  }
  return flips
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

export const python = `def min_flips(n):
    s = bin(n)[2:]
    flips = 0
    for i in range(len(s) // 2):
        j = len(s) - 1 - i
        if s[i] != s[j]:
            flips += 2
    return flips
`
