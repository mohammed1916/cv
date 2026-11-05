// Maximum binary string: all zeros can be pushed to the right until one zero remains, placed after the first zero plus the others.
const JS_LINES = [
  { text: 'const first = binary.indexOf("0")', py: 'first = binary.find' },
  { text: 'if (first < 0) return binary', py: 'if first < 0' },
  { text: 'const zeros = binary.split("").filter(c => c === "0").length', py: 'zeros = binary.count' },
  { text: 'const p = first + zeros - 1', py: 'p = first + zeros - 1' },
  { text: 'return "1".repeat(p) + "0" + "1".repeat(binary.length - p - 1)', py: "return '1' * p" },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def maximumBinaryString(binary):
    first = binary.find('0')
    if first < 0:
        return binary
    zeros = binary.count('0')
    p = first + zeros - 1
    return '1' * p + '0' + '1' * (len(binary) - p - 1)
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return')]))

export const phases = [
  { id: 'scan', label: 'Find first 0', description: 'Ones before the first zero are already as large as they can be.' },
  { id: 'count', label: 'Count zeros', description: 'Every zero can be pushed right, and all of them merge into one zero.' },
  { id: 'place', label: 'Place the zero', description: 'The single zero lands at first + zeros - 1; everything else is a one.' },
  { id: 'done', label: 'Result', description: 'The largest reachable binary string.' },
]

export const examples = [
  { label: 'Four zeros', input: '"0100"' },
  { label: 'Leading ones', input: '"110010"' },
  { label: 'No zero', input: '"1111"' },
]

export const complexity = 'O(n) time and O(n) space for a binary string of length n.'

export function parseInput(text) {
  const binary = JSON.parse(text)
  if (typeof binary !== 'string' || binary.length < 1 || binary.length > 40) throw new Error('Use a JSON string of 0s and 1s, 1 to 40 characters (visual cap).')
  if (!/^[01]+$/.test(binary)) throw new Error('Use only 0 and 1.')
  return binary
}

export function buildTrace(binary) {
  const frames = []
  const first = binary.indexOf('0')
  const snap = extra => ({ first, ...extra })
  frames.push({ phase: 'scan', activeLine: 1, index: first, message: first < 0 ? 'No zero: the string is already maximal.' : `The first zero is at index ${first}.`, snapshot: snap({}) })
  if (first < 0) {
    frames.push({ phase: 'done', activeLine: 2, index: -1, result: binary, message: 'Nothing to change.', snapshot: snap({ result: binary }) })
    return { input: binary, result: binary, frames }
  }
  const zeros = binary.split('').filter(c => c === '0').length
  frames.push({ phase: 'count', activeLine: 3, index: first, zeros, message: `${zeros} zero${zeros === 1 ? '' : 's'} in total.`, snapshot: snap({ zeros }) })
  const p = first + zeros - 1
  const result = '1'.repeat(p) + '0' + '1'.repeat(binary.length - p - 1)
  frames.push({ phase: 'place', activeLine: 4, index: p, zeros, message: `The lone zero goes to index ${p}.`, snapshot: snap({ zeros, p }) })
  frames.push({ phase: 'done', activeLine: 5, index: p, result, message: `Result ${result}.`, snapshot: snap({ zeros, p, result }) })
  return { input: binary, result, frames }
}
