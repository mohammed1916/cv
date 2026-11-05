export function parseInput(text) {
  const trimmed = text.trim()
  const s = trimmed.startsWith('"') ? JSON.parse(trimmed) : trimmed
  if (typeof s !== 'string' || s.length < 1 || s.length > 40 || !/^[ab]+$/.test(s)) throw new Error('Use a string of 1 to 40 letters a and b.')
  return s
}

export function buildTrace(s) {
  const frames = []
  let balance = 0
  frames.push({ pythonLine: P('balance = 0'), phase: 'start', activeLine: L('let balance'), at: -1, balance, message: 'Start with no surplus letter of either kind.' })
  for (let i = 0; i < s.length; i++) {
    balance += s[i] === 'a' ? 1 : -1
    frames.push({ pythonLine: P('balance +='), phase: 'scan', activeLine: L('balance +='), at: i, balance,
      message: `${s[i]} at index ${i}: a minus b is now ${balance}.` })
  }
  const result = Math.abs(balance)
  frames.push({ pythonLine: P('return abs'), phase: 'done', activeLine: L('return Math.abs'), at: -1, balance, message: `Unmatched letters remain: ${result}.` })
  return { input: { s }, result, frames }
}

export const code = `function minLengthAfterRemovals(s) {
  let balance = 0
  for (const ch of s) {
    balance += ch === 'a' ? 1 : -1
  }
  return Math.abs(balance)
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

export const python = `def min_length(s):
    balance = 0
    for ch in s:
        balance += 1 if ch == 'a' else -1
    return abs(balance)
`
