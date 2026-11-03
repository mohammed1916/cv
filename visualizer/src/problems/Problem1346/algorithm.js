export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty set of values already passed.' },
  { id: 'probe', label: 'Probe', description: 'For the current value, look for its double, or its half when it is even, among the values already passed.' },
  { id: 'store', label: 'Store', description: 'No partner found, so remember this value for later positions.' },
  { id: 'found', label: 'Pair found', description: 'An earlier value is the double or half of the current one, so the answer is true.' },
  { id: 'done', label: 'Complete', description: 'Every value has been checked without a match, so the answer is false.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 2 || input.length > 500) throw new Error('Enter a JSON array of 2 to 500 integers.')
  if (!input.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('Every value must be an integer from -1000 to 1000.')
  return input
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (codeSub, pySub = codeSub) => ({ activeLine: L(codeSub), pythonLine: P(pySub) })

export function buildTrace(values) {
  const frames = []
  const seen = []
  const snap = (index, extra = {}) => ({ values, index, seen: [...seen], ...extra })
  frames.push({ phase: 'start', ...at('seen = empty set', 'seen = set()'), message: 'Nothing has been passed yet. A partner must sit at a different position, so each value only looks back.', snapshot: snap(null) })

  let result = false
  for (let index = 0; index < values.length && !result; index++) {
    const value = values[index]
    const doubleSeen = seen.includes(value * 2)
    const halfSeen = value % 2 === 0 && seen.includes(value / 2)
    const partner = doubleSeen ? value * 2 : halfSeen ? value / 2 : null
    frames.push({
      phase: 'probe', ...at('if 2 * v', 'if 2 * value'),
      message: partner === null
        ? `Value ${value}: neither ${value * 2} nor ${value % 2 === 0 ? value / 2 : 'a half (it is odd)'} has been passed.`
        : `Value ${value}: ${partner} was passed earlier, and it is ${doubleSeen ? 'half' : 'double'} of ${value}.`,
      snapshot: snap(index, { probe: value, partner }),
    })
    if (partner !== null) {
      result = true
      frames.push({ phase: 'found', ...at('return true', 'return True'), message: `Positions hold ${partner} and ${value}, so the answer is true.`, snapshot: snap(index, { probe: value, partner, result: true }) })
      break
    }
    seen.push(value)
    frames.push({ phase: 'store', ...at('add v', 'seen.add'), message: `Remember ${value} for the positions after it.`, snapshot: snap(index, { probe: value }) })
  }

  if (!result) frames.push({ phase: 'done', ...at('return false', 'return False'), message: 'No value has a double or a half among the values before it, so the answer is false.', snapshot: snap(null, { result: false }) })
  return { input: values, result, frames }
}

export const code = `check double (values):
  seen = empty set
  for each value v in values:
    if 2 * v is in seen, or v is even and v / 2 is in seen:
      return true
    add v to seen
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def check_if_double_exists(values):
    seen = set()
    for value in values:
        if 2 * value in seen or (value % 2 == 0 and value // 2 in seen):
            return True
        seen.add(value)
    return False
`
