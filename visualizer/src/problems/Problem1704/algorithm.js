// Halves alike: count vowels in each half of the string; equal counts mean the halves are alike.
const JS_LINES = [
  { text: 'const half = s.length / 2', py: 'half = len(s)' },
  { text: 'const vowels = "aeiouAEIOU"', py: 'vowels = ' },
  { text: 'let a = 0, b = 0', py: 'a = b = 0' },
  { text: 'for (let i = 0; i < half; i++) if (vowels.includes(s[i])) a++', py: 'for c in s[:half]' },
  { text: 'for (let i = half; i < s.length; i++) if (vowels.includes(s[i])) b++', py: 'for c in s[half:]' },
  { text: 'return a === b', py: 'return a == b' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def halvesAreAlike(s):
    half = len(s) // 2
    vowels = 'aeiouAEIOU'
    a = b = 0
    for c in s[:half]:
        if c in vowels:
            a += 1
    for c in s[half:]:
        if c in vowels:
            b += 1
    return a == b
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return a == b')]))

export const phases = [
  { id: 'split', label: 'Split', description: 'Cut the string into two halves of equal length.' },
  { id: 'left', label: 'Left half', description: 'Count the vowels in the left half.' },
  { id: 'right', label: 'Right half', description: 'Count the vowels in the right half.' },
  { id: 'done', label: 'Result', description: 'The halves are alike when their vowel counts match.' },
]

export const examples = [
  { label: 'Even split', input: '"lemonade"' },
  { label: 'Unequal vowels', input: '"ouchat"' },
  { label: 'Capital vowels', input: '"AbCdEf"' },
]

export const complexity = 'O(n) time and O(1) extra space for a string of length n.'

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 2 || s.length > 40 || s.length % 2 !== 0) throw new Error('Use a JSON string of even length, 2 to 40 characters (visual cap).')
  if (!/^[a-zA-Z]+$/.test(s)) throw new Error('Use letters only.')
  return s
}

const VOWELS = 'aeiouAEIOU'

export function buildTrace(s) {
  const frames = []
  const half = s.length / 2
  let a = 0
  let b = 0
  const snap = extra => ({ a, b, half, ...extra })
  frames.push({ phase: 'split', activeLine: 1, index: -1, message: `Halves: ${s.slice(0, half)} and ${s.slice(half)}.`, snapshot: snap({}) })
  for (let i = 0; i < half; i++) {
    if (VOWELS.includes(s[i])) a++
    frames.push({ phase: 'left', activeLine: 4, index: i, message: `Left vowels so far: ${a}.`, snapshot: snap({}) })
  }
  for (let i = half; i < s.length; i++) {
    if (VOWELS.includes(s[i])) b++
    frames.push({ phase: 'right', activeLine: 5, index: i, message: `Right vowels so far: ${b}.`, snapshot: snap({}) })
  }
  const result = a === b
  frames.push({ phase: 'done', activeLine: 6, index: -1, result, message: `${a} and ${b} vowels: ${result ? 'alike' : 'not alike'}.`, snapshot: snap({ result }) })
  return { input: s, result, frames }
}
