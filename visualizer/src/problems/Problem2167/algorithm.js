// LeetCode 2167: Minimum Time to Remove All Cars Containing Illegal Goods.
// Illegal cars leave by a left prefix (cost 1 each), a right suffix (cost 1 each), or one at a time (cost 2 each).
// pre[i] is the cheapest way to clear the first i cars; suf[i] clears cars i..n-1. The answer splits at i.

const MAX_LEN = 16

export function parseInput(text) {
  const s = String(text).trim().replace(/^"|"$/g, '')
  if (!/^[01]+$/.test(s)) throw new Error('Use a string of 0 and 1 characters, e.g. 1100101.')
  if (s.length > MAX_LEN) throw new Error(`Use at most ${MAX_LEN} cars. The visualization caps the length at ${MAX_LEN}.`)
  return { s }
}

export const code = `FUNCTION minimumTime(s)
    n ← length of s
    pre ← array of n + 1 zeros
    suf ← array of n + 1 zeros
    FOR i from 0 to n - 1
        IF s[i] is '0' THEN pre[i + 1] ← pre[i]
        ELSE pre[i + 1] ← min(pre[i] + 2, i + 1)
    FOR i from n - 1 down to 0
        IF s[i] is '0' THEN suf[i] ← suf[i + 1]
        ELSE suf[i] ← min(suf[i + 1] + 2, n - i)
    best ← infinity
    FOR i from 1 to n
        best ← min(best, pre[i] + suf[i])
    RETURN best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_time(s):
    n = len(s)
    pre = [0] * (n + 1)
    suf = [0] * (n + 1)
    for i in range(n):
        pre[i + 1] = pre[i] if s[i] == "0" else min(pre[i] + 2, i + 1)
    for i in range(n - 1, -1, -1):
        suf[i] = suf[i + 1] if s[i] == "0" else min(suf[i + 1] + 2, n - i)
    best = float("inf")
    for i in range(1, n + 1):
        best = min(best, pre[i] + suf[i])
    return best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Setup', description: 'Read the cars and make room for the two cost tables.' },
  { id: 'prefix', label: 'From the left', description: 'Fill pre: the cheapest cost to clear the first i cars.' },
  { id: 'suffix', label: 'From the right', description: 'Fill suf: the cheapest cost to clear cars from i to the end.' },
  { id: 'split', label: 'Split', description: 'Try each cut: left side pre[i] plus right side suf[i].' },
  { id: 'done', label: 'Result', description: 'The smallest total over all cuts.' },
]

export function buildTrace({ s }) {
  const n = s.length
  const pre = Array(n + 1).fill(0)
  const suf = Array(n + 1).fill(0)
  const frames = []
  let best = Infinity
  let bestAt = -1
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index, activeLine, pythonLine, message, s, pre: pre.slice(), suf: suf.slice(), best, bestAt, ...extra,
  })
  push('start', -1, L('n ← length'), P('n = len(s)'), `${n} cars. Both tables start at 0 with n + 1 slots.`)
  for (let i = 0; i < n; i++) {
    if (s[i] === '0') pre[i + 1] = pre[i]
    else pre[i + 1] = Math.min(pre[i] + 2, i + 1)
    push('prefix', i, s[i] === '0' ? L('IF s[i] is') : L('ELSE pre'), s[i] === '0' ? P('pre[i + 1] = pre[i] if') : P('min(pre[i] + 2'),
      s[i] === '0' ? `Car ${i} is clean, so clearing ${i + 1} cars costs the same as ${i}: ${pre[i + 1]}.`
        : `Car ${i} is illegal: removing it from the left costs ${pre[i] + 2} as a single removal or ${i + 1} as the whole prefix. pre[${i + 1}] = ${pre[i + 1]}.`)
  }
  for (let i = n - 1; i >= 0; i--) {
    if (s[i] === '0') suf[i] = suf[i + 1]
    else suf[i] = Math.min(suf[i + 1] + 2, n - i)
    push('suffix', i, s[i] === '0' ? L('IF s[i] is') : L('ELSE suf'), s[i] === '0' ? P('suf[i] = suf[i + 1] if') : P('min(suf[i + 1] + 2'),
      `From the right, car ${i} gives suf[${i}] = ${suf[i]}.`)
  }
  for (let i = 1; i <= n; i++) {
    const total = pre[i] + suf[i]
    if (total < best) { best = total; bestAt = i }
    push('split', i, L('best ← min'), P('best = min(best'),
      `Cut after ${i} cars: ${pre[i]} from the left plus ${suf[i]} from the right is ${total}. Best ${best}.`, { cut: i, total })
  }
  push('done', n, L('RETURN best'), P('return best'), `The minimum time is ${best}.`)
  return { input: { s }, result: best, frames }
}
