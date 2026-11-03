export function parseInput(text) {
  const trimmed = text.trim()
  const s = trimmed.startsWith('"') ? JSON.parse(trimmed) : trimmed
  if (typeof s !== 'string' || s.length < 1 || s.length > 40 || !/^[ab]+$/.test(s)) throw new Error('Use a string of 1 to 40 letters a and b.')
  return s
}

export function buildTrace(s) {
  const frames = []
  let balance = 0
  frames.push({ pythonLine: PL('balance = 0'), phase: 'start', activeLine: L('balance is 0'), at: -1, balance, message: 'Start with no surplus letter of either kind.' })
  for (let i = 0; i < s.length; i++) {
    balance += s[i] === 'a' ? 1 : -1
    frames.push({ pythonLine: PL('balance +='), phase: 'scan', activeLine: L('each letter'), at: i, balance,
      message: `${s[i]} at index ${i}: a minus b is now ${balance}.` })
  }
  const result = Math.abs(balance)
  frames.push({ pythonLine: PL('return abs'), phase: 'done', activeLine: L('return the size'), at: -1, balance, message: `Unmatched letters remain: ${result}.` })
  return { input: { s }, result, frames }
}

export const code = `minimum length after removing balanced substrings
  balance is 0
  for each letter in order
    add one for a, subtract one for b
  return the size of the leftover imbalance, as a length
`.split('\n').filter(Boolean).map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_length(s):
    balance = 0
    for ch in s:
        balance += 1 if ch == 'a' else -1
    return abs(balance)
`
const PL = s => python.split('\n').findIndex(c => c.includes(s)) + 1
