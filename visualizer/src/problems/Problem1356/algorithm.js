// Teaching model written for this visualizer. The sample values and wording are original.
export const phases = [
  { id: 'count', label: 'Count bits', description: 'Count the one bits of each value in binary.' },
  { id: 'sort', label: 'Sort', description: 'Order by bit count first, then by value.' },
  { id: 'done', label: 'Result', description: 'Return the values in that order.' },
]

const CODE = [
  'sort by one bits(values):',
  '  ones = empty map',
  '  for each v in values:',
  '    ones[v] = count the 1 bits in v',
  '  sort values by (ones[v], v)',
  '  return values',
]
const PYTHON = `def sort_by_one_bits(values):
    ones = {v: bin(v).count('1') for v in values}
    return sorted(values, key=lambda v: (ones[v], v))`
const PY = PYTHON.split('\n')
const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing solver line: ${text}`)
  return index + 1
}
const L = text => at(CODE, text)
const P = text => at(PY, text)

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON

const oneBits = v => v.toString(2).split('').filter(ch => ch === '1').length

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 16) throw new Error('Enter a JSON array of 1 to 16 integers.')
  if (values.some(v => !Number.isInteger(v) || v < 0 || v > 1000)) throw new Error('Each value must be a whole number from 0 to 1000.')
  return values
}

export function buildTrace(values) {
  const ones = new Map()
  const frames = []
  const snap = (extra = {}) => ({ values, counted: [...ones.entries()], ordered: null, ...extra })

  frames.push({
    phase: 'count', activeLine: L('ones = empty map'), pythonLine: P('ones = {v'),
    message: `Start with ${values.length} values. The bit count decides the first sort key, so count the one bits of each value.`,
    snapshot: snap(),
  })
  for (const v of values) {
    const k = oneBits(v)
    ones.set(v, k)
    frames.push({
      phase: 'count', activeLine: L('ones[v] = count'), pythonLine: P('bin(v).count'),
      message: `${v} is ${v.toString(2)} in binary, with ${k} one bit${k === 1 ? '' : 's'}.`,
      snapshot: snap({ focus: v }),
    })
  }
  const ordered = [...values].sort((a, b) => (ones.get(a) - ones.get(b)) || (a - b))
  frames.push({
    phase: 'sort', activeLine: L('sort values by'), pythonLine: P('return sorted'),
    message: `Sort by bit count, then by value. Values with equal bit counts appear in increasing order.`,
    snapshot: snap({ ordered }),
  })
  frames.push({
    phase: 'done', activeLine: L('return values'), pythonLine: P('return sorted'),
    message: `Return ${ordered.join(', ')}.`,
    snapshot: snap({ ordered }),
  })
  return { input: values, result: ordered, frames }
}
