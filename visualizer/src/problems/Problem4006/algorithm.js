export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a binary string s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 100 || !/^[01]+$/.test(s)) throw new Error('s is a binary string of 1 to 100 characters.')
  return { s }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

export function buildTrace({ s }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)
  let ones = 0
  let zeros = 0
  let count = 0
  frames.push({ phase: 'start', activeLine: L('ones = 0'), pythonLine: P('ones = 0'), at: -1, ones, zeros, count, ok: null, message: 'No prefix checked yet.' })
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '1') {
      ones++
      frames.push({ phase: 'add', activeLine: L('add the character'), pythonLine: P('ones += 1'), at: i, ones, zeros, count, ok: null, message: `Character ${i + 1} is 1; ones becomes ${ones}.` })
    } else {
      zeros++
      frames.push({ phase: 'add', activeLine: L('add the character'), pythonLine: P('zeros += 1'), at: i, ones, zeros, count, ok: null, message: `Character ${i + 1} is 0; zeros becomes ${zeros}.` })
    }
    const ok = Math.abs(ones - zeros) <= 1
    if (ok) count++
    frames.push({ phase: ok ? 'count' : 'skip', activeLine: L('if the absolute difference'), pythonLine: P('if abs(ones - zeros) <= 1'), at: i, ones, zeros, count, ok, message: ok ? `Prefix of length ${i + 1} balances to within one, so it counts. Total ${count}.` : `Prefix of length ${i + 1} is off by ${Math.abs(ones - zeros)}, so it does not count.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), at: -1, ones, zeros, count, ok: null, result: count, message: `${count} prefixes can be rearranged into alternating bits.` })
  return { input: { s }, result: count, frames }
}

export const code = `count nonempty prefixes that can be rearranged into alternating bits
ones = 0, zeros = 0, count = 0
for each prefix from the first character
  add the character to ones or zeros
  if the absolute difference of ones and zeros is at most 1 then add one to count
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_valid_prefixes(s):
    ones = 0
    zeros = 0
    count = 0
    for ch in s:
        if ch == '1':
            ones += 1
        else:
            zeros += 1
        if abs(ones - zeros) <= 1:
            count += 1
    return count
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
