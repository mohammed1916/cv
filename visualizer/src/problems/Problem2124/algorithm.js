// LeetCode 2124: Check if All A's Appear Before All B's.
// Scan left to right. Once a 'b' has appeared, any later 'a' breaks the order.

export function parseInput(text) {
  const s = text.trim()
  if (!/^[ab]{1,100}$/.test(s)) throw new Error('Use a string of 1 to 100 letters, each a or b.')
  return { s }
}

export const code = `function allAsBeforeBs(s) {
  let seenB = false
  for (const ch of s) {
    if (ch === 'b') seenB = true
    else if (seenB) return false
  }
  return true
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: all_as_before_bs
def all_as_before_bs(s):
    seen_b = False
    for ch in s:
        if ch == "b":
            seen_b = True
        elif seen_b:
            return False
    return True
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
  { id: 'scan', label: 'Scan', description: 'Read each letter in order.' },
  { id: 'seen', label: 'Seen a b', description: 'From here on, an a would be out of place.' },
  { id: 'fail', label: 'Out of order', description: 'An a came after a b.' },
  { id: 'done', label: 'Result', description: 'Whether every a came before every b.' },
]

export function buildTrace({ s }) {
  const frames = []
  let seenB = false
  let result = true
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === 'b') {
      seenB = true
      frames.push({ phase: seenB ? 'seen' : 'scan', activeLine: L('if (ch === \'b\')'), pythonLine: P('if ch == "b"'), message: `Letter ${i} is b; every a from now on is too late.`, i, seenB, marks: { [i]: 'current' }, result: null })
    } else if (seenB) {
      result = false
      frames.push({ phase: 'fail', activeLine: L('else if (seenB)'), pythonLine: P('elif seen_b'), message: `Letter ${i} is a, but a b came earlier.`, i, seenB, marks: { [i]: 'current' }, result: false })
      break
    } else {
      frames.push({ phase: 'scan', activeLine: L('for (const ch'), pythonLine: P('for ch in s'), message: `Letter ${i} is a and no b has appeared yet.`, i, seenB, marks: { [i]: 'current' }, result: null })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: P('return True'), message: result ? 'Every a is before every b.' : 'Some a comes after a b.', i: -1, seenB, marks: {}, result })
  return { input: { s }, result, frames }
}
