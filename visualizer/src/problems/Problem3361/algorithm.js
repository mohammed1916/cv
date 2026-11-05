const LETTERS = /^[a-z]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s, t, nextCost and previousCost.')
  const { s, t, nextCost, previousCost } = input
  if (typeof s !== 'string' || typeof t !== 'string' || s.length < 1 || s.length > 6 || s.length !== t.length || !LETTERS.test(s) || !LETTERS.test(t)) throw new Error('s and t are equal-length lowercase strings of 1 to 6 letters.')
  for (const costs of [nextCost, previousCost]) {
    if (!Array.isArray(costs) || costs.length !== 26 || !costs.every(c => Number.isInteger(c) && c >= 0 && c <= 100)) throw new Error('Each cost array has 26 integers from 0 to 100.')
  }
  return { s, t, nextCost, previousCost }
}

const at = letter => letter.charCodeAt(0) - 97

export function buildTrace({ s, t, nextCost, previousCost }) {
  const frames = []
  let total = 0
  frames.push({ pythonLine: P('total = 0'), phase: 'start', activeLine: L('let total = 0'), at: -1, total, message: 'Each position is independent, so the answer is a sum of per-position distances.' })
  for (let i = 0; i < s.length; i++) {
    const a = at(s[i])
    const b = at(t[i])
    frames.push({ pythonLine: P('for i'), phase: 'index', activeLine: L('for (let i = 0'), at: i, total, message: `Position ${i}: ${s[i]} must become ${t[i]}.` })
    if (a === b) {
      frames.push({ pythonLine: P('if s[i]'), phase: 'same', activeLine: L('if (s[i] === t[i])'), at: i, total, message: 'The letters already match, so this position costs 0.' })
      continue
    }
    let forward = 0
    for (let c = a; c !== b; c = (c + 1) % 26) forward += nextCost[c]
    frames.push({ pythonLine: P('forward'), phase: 'forward', activeLine: L('for (let c = a; c !== b; c = (c + 1)'), at: i, forward, total, message: `Walking forward from ${s[i]} to ${t[i]} costs ${forward}.` })
    let backward = 0
    for (let c = a; c !== b; c = (c + 25) % 26) backward += previousCost[c]
    frames.push({ pythonLine: P('backward'), phase: 'backward', activeLine: L('for (let c = a; c !== b; c = (c + 25)'), at: i, forward, backward, total, message: `Walking backward costs ${backward}.` })
    const best = Math.min(forward, backward)
    total += best
    frames.push({ pythonLine: P('total +='), phase: 'choose', activeLine: L('total += Math.min'), at: i, forward, backward, total, message: `Take ${best}; running total ${total}.` })
  }
  frames.push({ pythonLine: P('return total'), phase: 'done', activeLine: L('return total'), at: -1, total, message: `Shift distance is ${total}.` })
  return { input: { s, t, nextCost, previousCost }, result: total, frames }
}

export const code = `function shiftDistance(s, t, nextCost, previousCost) {
  let total = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === t[i]) continue
    const a = s.charCodeAt(i) - 97
    const b = t.charCodeAt(i) - 97
    let forward = 0
    for (let c = a; c !== b; c = (c + 1) % 26) forward += nextCost[c]
    let backward = 0
    for (let c = a; c !== b; c = (c + 25) % 26) backward += previousCost[c]
    total += Math.min(forward, backward)
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shift_distance(s, t, nextCost, previousCost):
    total = 0
    for i in range(len(s)):
        if s[i] == t[i]:
            continue
        a, b = ord(s[i]) - 97, ord(t[i]) - 97
        forward = 0
        c = a
        while c != b:
            forward += nextCost[c]
            c = (c + 1) % 26
        backward = 0
        c = a
        while c != b:
            backward += previousCost[c]
            c = (c + 25) % 26
        total += min(forward, backward)
    return total`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function shiftDistance(input) {
  return buildTrace(input).result
}
