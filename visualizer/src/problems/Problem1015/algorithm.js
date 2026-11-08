// Independently written teaching model. The sample inputs are invented for this visualization.
export const code = [
  'function smallestRepunitDivisibleBy(k):',
  '  remainder = 0',
  '  seen = empty set',
  '  for length = 1, 2, 3, ...:',
  '    remainder = (remainder * 10 + 1) mod k',
  '    if remainder == 0: return length',
  '    if remainder is in seen: return -1',
  '    add remainder to seen',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def smallest_repunit_divisible_by(k):
    remainder = 0
    seen = set()
    length = 1
    while True:
        remainder = (remainder * 10 + 1) % k
        if remainder == 0:
            return length
        if remainder in seen:
            return -1
        seen.add(remainder)
        length += 1`

const PSEUDO = code.map(line => line.text)
const PY_LINES = python.split('\n')
function lineOf(lines, key) {
  const index = lines.findIndex(text => text.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, pseudoKey, pyKey, message, snapshot) => ({
  phase,
  activeLine: lineOf(PSEUDO, pseudoKey),
  pythonLine: lineOf(PY_LINES, pyKey),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with remainder zero and no seen values.' },
  { id: 'inspect', label: 'Append a one', description: 'Extend the number by one digit, tracking only its remainder.' },
  { id: 'update', label: 'Check repeats', description: 'Stop if the remainder repeats; otherwise remember it.' },
  { id: 'done', label: 'Result', description: 'Report the length, or -1 when no all-ones number works.' },
]

export const inputLabel = 'JSON object with k, for example {"k":17}'
export const complexity = 'O(k) time and O(k) space: at most k distinct remainders exist. The visualizer accepts k up to 200.'
export const examples = [
  { label: 'Seventeen', input: '{"k":17}' },
  { label: 'Divisible by one', input: '{"k":1}' },
  { label: 'Even divisor', input: '{"k":8}' },
  { label: 'Factor of five', input: '{"k":25}' },
  { label: 'Largest k allowed', input: '{"k":200}' },
  { label: 'Prime near the limit', input: '{"k":197}' },
  { label: 'Long run: generated k', input: '{"k":145}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.k) || input.k < 1 || input.k > 200) {
    throw new Error('Use {"k": n} with an integer n from 1 to 200.')
  }
  return { k: input.k }
}

export function buildTrace({ k }) {
  const frames = []
  const seen = []
  let remainder = 0
  frames.push(frame('start', 'remainder = 0', 'remainder = 0', `Start with remainder 0 for k = ${k}.`, { k, remainder, length: 0, seen: [] }))
  for (let length = 1; ; length++) {
    remainder = (remainder * 10 + 1) % k
    frames.push(frame('inspect', 'remainder = (remainder', 'remainder = (remainder',
      `Append a one: length ${length} leaves remainder ${remainder}.`, { k, remainder, length, seen: [...seen] }))
    if (remainder === 0) {
      frames.push(frame('done', 'return length', 'return length', `Remainder 0 at length ${length}, so the answer is ${length}.`, { k, remainder, length, seen: [...seen], result: length }))
      return { input: { k }, result: length, frames }
    }
    if (seen.includes(remainder)) {
      frames.push(frame('update', 'is in seen', 'in seen', `Remainder ${remainder} repeated, so the cycle never reaches 0.`, { k, remainder, length, seen: [...seen] }))
      frames.push(frame('done', 'return -1', 'return -1', 'No all-ones number is divisible by k.', { k, remainder, length, seen: [...seen], result: -1 }))
      return { input: { k }, result: -1, frames }
    }
    seen.push(remainder)
    frames.push(frame('update', 'add remainder to seen', 'seen.add(remainder)',
      `Remember remainder ${remainder} and continue.`, { k, remainder, length, seen: [...seen] }))
  }
}
