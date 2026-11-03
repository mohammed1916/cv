export const phases = [
  { id: 'start', label: 'Start', description: 'Hold both strings and prepare to compare their concatenations.' },
  { id: 'check', label: 'Check order', description: 'Both concatenation orders must match before a shared base can exist.' },
  { id: 'euclid', label: 'Reduce lengths', description: 'Run Euclid on the two lengths; the last nonzero value is the block length.' },
  { id: 'done', label: 'Complete', description: 'Return the block prefix, or the empty string when no base exists.' },
]

export const code = `repeated base (first, second):
  if first + second != second + first:
    return ""
  a, b = len(first), len(second)
  while b != 0:
    a, b = b, a % b
  return first[0:a]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def repeated_base(first, second):
    if first + second != second + first:
        return ""
    a, b = len(first), len(second)
    while b != 0:
        a, b = b, a % b
    return first[0:a]
`

const codeLine = key => code.findIndex(line => line.text.includes(key)) + 1
const pythonLine = key => python.split('\n').findIndex(line => line.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"first": "ABAB", "second": "AB"}.')
  const { first, second } = input
  const valid = s => typeof s === 'string' && s.length >= 1 && s.length <= 40 && /^[A-Z]+$/.test(s)
  if (!valid(first) || !valid(second)) throw new Error('first and second must be uppercase letters, 1 to 40 characters each.')
  return { first, second }
}

export function buildTrace({ first, second }) {
  const frames = []
  let a = first.length
  let b = second.length
  const push = (phase, key, message, pyKey = key) => frames.push({
    phase,
    activeLine: codeLine(key),
    pythonLine: pythonLine(pyKey),
    message,
    state: { first, second, a, b, joinedFirst: first + second, joinedSecond: second + first },
  })

  push('start', 'repeated base', `Compare "${first}" and "${second}" by building both joined orders.`, 'def repeated_base')
  const joinedFirst = first + second
  const joinedSecond = second + first
  if (joinedFirst !== joinedSecond) {
    push('check', 'first + second != second + first', `"${joinedFirst}" differs from "${joinedSecond}", so no shared repeating base exists.`)
    push('done', 'return ""', 'Return the empty string.')
    return { input: { first, second }, result: '', frames }
  }
  push('check', 'first + second != second + first', `Both orders give "${joinedFirst}", so a shared base exists.`)

  push('euclid', 'a, b = len(first)', `Start with lengths ${a} and ${b}.`)
  while (b !== 0) {
    const remainder = a % b
    const nextA = b
    a = nextA
    b = remainder
    push('euclid', 'a, b = b, a % b', `Remainder step leaves lengths ${a} and ${b}.`)
  }
  const block = first.slice(0, a)
  push('done', 'return first[0:a]', `The longest block has length ${a}: "${block}".`)
  return { input: { first, second }, result: block, frames }
}
