// Decode XORed array: each element is the previous one XOR the encoded value between them.
const JS_LINES = [
  { text: 'const arr = [first]', py: 'arr = [first]' },
  { text: 'for (let i = 0; i < encoded.length; i++) {', py: 'for e in encoded' },
  { text: 'arr.push(arr[i] ^ encoded[i])', py: 'arr.append' },
  { text: '}', py: null },
  { text: 'return arr', py: 'return arr' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def decode(encoded, first):
    arr = [first]
    for e in encoded:
        arr.append(arr[-1] ^ e)
    return arr
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return arr')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'The first element is given.' },
  { id: 'step', label: 'XOR step', description: 'The next element is the previous one XOR the encoded value.' },
  { id: 'done', label: 'Result', description: 'The rebuilt array.' },
]

export const examples = [
  { label: 'Three steps', input: '{"encoded":[5,2,7],"first":4}' },
  { label: 'Single step', input: '{"encoded":[6],"first":1}' },
]

export const complexity = 'O(n) time and O(n) space for an encoded array of length n.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.encoded) || !Number.isInteger(input.first)) throw new Error('Use an object with encoded and first.')
  const { encoded, first } = input
  if (encoded.length < 1 || encoded.length > 20) throw new Error('encoded has 1 to 20 values (visual cap).')
  if (!encoded.every(v => Number.isInteger(v) && v >= 0 && v <= 100000) || first < 0 || first > 100000) throw new Error('Values are integers from 0 to 100000.')
  return { encoded, first }
}

export function buildTrace({ encoded, first }) {
  const frames = []
  const arr = [first]
  const snap = extra => ({ arr: [...arr], ...extra })
  frames.push({ phase: 'start', activeLine: 1, index: 0, message: `arr[0] = ${first}.`, snapshot: snap({}) })
  for (let i = 0; i < encoded.length; i++) {
    arr.push(arr[i] ^ encoded[i])
    frames.push({ phase: 'step', activeLine: 3, index: i + 1, message: `arr[${i + 1}] = ${arr[i]} XOR ${encoded[i]} = ${arr[i + 1]}.`, snapshot: snap({}) })
  }
  frames.push({ phase: 'done', activeLine: 5, index: -1, result: arr, message: `Decoded: [${arr.join(', ')}].`, snapshot: snap({ result: arr }) })
  return { input: { encoded, first }, result: arr, frames }
}
