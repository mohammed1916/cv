export const phases = [
  { id: 'start', label: 'Start', description: 'Read both strings and fix the length they share.' },
  { id: 'outside', label: 'Match from the ends', description: 'Move inward from both ends while the characters agree.' },
  { id: 'middle', label: 'Check the middle', description: 'The unmatched middle must already be a palindrome in one of the strings.' },
  { id: 'done', label: 'Result', description: 'Report whether either split direction produces a palindrome.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"a": "abxyz", "b": "zyxba"}.')
  const { a, b } = input
  if (typeof a !== 'string' || typeof b !== 'string') throw new Error('a and b must both be strings.')
  if (a.length !== b.length || a.length < 1 || a.length > 24) throw new Error('a and b must have the same length, from 1 to 24 characters.')
  if (!/^[a-z]+$/.test(a + b)) throw new Error('Use lowercase letters only.')
  return { a, b }
}

const isPalindrome = (s, i, j) => {
  for (let p = i, q = j; p < q; p++, q--) if (s[p] !== s[q]) return false
  return true
}

// Lines of the solver the story points at (1-based, matching `code` below).
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function buildTrace({ a, b }) {
  const frames = []
  const n = a.length
  const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

  frames.push({
    phase: 'start', ...at('n = len(a)', 'n = len(a)'), message: `Both strings have length ${n}. Try each split point k: keep the first k letters of one string and the rest of the other.`,
    snapshot: { pass: null, x: a, y: b, i: null, j: null, segment: null },
  })

  // check(x, y) tries the split a[0:k] + b[k:] (or its mirror) by matching x from the left with y from the right.
  const check = (x, y, xName, yName) => {
    let i = 0, j = n - 1
    const label = `Pass ${xName} then ${yName}`
    const snap = (extra = {}) => ({ pass: label, x, y, i, j, segment: null, verdict: null, ...extra })
    frames.push({ phase: 'outside', ...at('i, j = 0, n - 1', 'i, j = 0, n - 1'), message: `${label}: start with i = 0 at the left and j = ${j} at the right.`, snapshot: snap() })
    while (i < j && x[i] === y[j]) {
      frames.push({ phase: 'outside', ...at('while i < j and x[i] == y[j]', 'while i < j and x[i] == y[j]'),
        message: `${label}: ${xName}[${i}] is '${x[i]}' and ${yName}[${j}] is '${y[j]}'. They match, so both pointers move inward.`, snapshot: snap() })
      i++; j--
    }
    if (i >= j) {
      frames.push({ phase: 'middle', ...at('if i >= j', 'if i >= j'), message: `${label}: the pointers met with every pair matching, so this split gives a palindrome.`, snapshot: snap({ verdict: true }) })
      return true
    }
    frames.push({ phase: 'middle', ...at('if i >= j', 'if i >= j'), message: `${label}: ${xName}[${i}] is '${x[i]}' but ${yName}[${j}] is '${y[j]}', so the unmatched middle must be a palindrome.`, snapshot: snap() })
    for (const [name, s] of [[xName, x], [yName, y]]) {
      const palindrome = isPalindrome(s, i, j)
      frames.push({ phase: 'middle', ...at('palindrome(x, i, j)', 'is_pal(x, i, j)'),
        message: `${name}[${i}..${j}] = "${s.slice(i, j + 1)}" ${palindrome ? 'is a palindrome, so this split works.' : 'is not a palindrome.'}`,
        snapshot: snap({ segment: { owner: name, from: i, to: j, isPalindrome: palindrome }, verdict: palindrome }) })
      if (palindrome) return true
    }
    return false
  }

  let found = check(a, b, 'a', 'b')
  if (!found) found = check(b, a, 'b', 'a')
  frames.push({
    phase: 'done', ...at('return check(a, b) or check(b, a)', 'return check(a, b) or check(b, a)'),
    message: found ? 'At least one direction works, so the answer is yes.' : 'Neither direction works, so the answer is no.',
    snapshot: { pass: null, x: a, y: b, i: null, j: null, segment: null, verdict: found },
  })
  return { input: { a, b }, result: found, frames }
}

export const code = `can split (a, b):
  n = len(a)
  return check(a, b) or check(b, a)

check(x, y):
  i, j = 0, n - 1
  while i < j and x[i] == y[j]:
    i, j = i + 1, j - 1
  if i >= j: return true
  return palindrome(x, i, j) or palindrome(y, i, j)`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def can_split(a, b):
    n = len(a)

    def is_pal(s, i, j):
        return s[i:j + 1] == s[i:j + 1][::-1]

    def check(x, y):
        i, j = 0, n - 1
        while i < j and x[i] == y[j]:
            i, j = i + 1, j - 1
        if i >= j:
            return True
        return is_pal(x, i, j) or is_pal(y, i, j)

    return check(a, b) or check(b, a)
`
