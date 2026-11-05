// Reformat phone number: keep the digits, cut blocks of 3 while more than 4 remain, then 2+2, 2 or 3.
const JS_LINES = [
  { text: 'const digits = number.replace(/[ -]/g, "")', py: 'digits = ' },
  { text: 'const blocks = []', py: 'blocks = []' },
  { text: 'let rest = digits', py: 'rest = digits' },
  { text: 'while (rest.length > 4) {', py: 'while len(rest) > 4' },
  { text: 'blocks.push(rest.slice(0, 3))', py: 'blocks.append(rest[:3])' },
  { text: 'rest = rest.slice(3)', py: 'rest = rest[3:]' },
  { text: '}', py: null },
  { text: 'if (rest.length === 4) blocks.push(rest.slice(0, 2), rest.slice(2))', py: 'if len(rest) == 4' },
  { text: 'else if (rest.length > 0) blocks.push(rest)', py: 'elif rest' },
  { text: 'return blocks.join("-")', py: 'return' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def reformatNumber(number):
    digits = ''.join(c for c in number if c not in ' -')
    blocks = []
    rest = digits
    while len(rest) > 4:
        blocks.append(rest[:3])
        rest = rest[3:]
    if len(rest) == 4:
        blocks.extend([rest[:2], rest[2:]])
    elif rest:
        blocks.append(rest)
    return '-'.join(blocks)
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return')]))

export const phases = [
  { id: 'clean', label: 'Clean', description: 'Remove the spaces and dashes; only digits remain.' },
  { id: 'triples', label: 'Triples', description: 'While more than four digits remain, cut off a block of three.' },
  { id: 'tail', label: 'Tail', description: 'Four digits become 2+2; three become one block; two stay as one block.' },
  { id: 'done', label: 'Result', description: 'Join the blocks with dashes.' },
]

export const examples = [
  { label: 'Mixed separators', input: '"7-13 05 92"' },
  { label: 'Four digits left', input: '"12 34-5678"' },
  { label: 'Two digits left', input: '"4 5-6"' },
]

export const complexity = 'O(n) time and O(n) space for a phone number of n characters.'

export function parseInput(text) {
  const number = JSON.parse(text)
  if (typeof number !== 'string') throw new Error('Enter the number as a JSON string.')
  if (number.length < 2 || number.length > 100) throw new Error('The number is 2 to 100 characters long.')
  if (!/^[0-9 -]+$/.test(number)) throw new Error('Use digits, spaces and dashes only.')
  const digits = number.replace(/[ -]/g, '')
  if (digits.length < 2) throw new Error('At least two digits are needed.')
  return number
}

export function buildTrace(number) {
  const frames = []
  const digits = number.replace(/[ -]/g, '')
  const blocks = []
  const snap = extra => ({ blocks: [...blocks], rest: '', ...extra })
  frames.push({ phase: 'clean', activeLine: 1, digits, message: `Digits only: ${digits}.`, snapshot: snap({ digits }) })
  let rest = digits
  while (rest.length > 4) {
    blocks.push(rest.slice(0, 3))
    rest = rest.slice(3)
    frames.push({ phase: 'triples', activeLine: 5, digits, message: `Block ${blocks[blocks.length - 1]} cut off; ${rest.length} digits remain.`, snapshot: snap({ rest }) })
  }
  if (rest.length === 4) {
    blocks.push(rest.slice(0, 2), rest.slice(2))
    frames.push({ phase: 'tail', activeLine: 8, digits, message: `Four digits left: two blocks of 2, ${blocks.slice(-2).join(' and ')}.`, snapshot: snap({ rest }) })
  } else if (rest.length > 0) {
    blocks.push(rest)
    frames.push({ phase: 'tail', activeLine: 9, digits, message: `${rest.length} digits left: one block ${rest}.`, snapshot: snap({ rest }) })
  }
  const result = blocks.join('-')
  frames.push({ phase: 'done', activeLine: 10, digits, result, message: `Result: ${result}.`, snapshot: snap({ result }) })
  return { input: number, digits, result, blocks, frames }
}
