const MAX_INDEX = 1000
const MAX_NUMBER = 1000

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.operations)) throw new Error('Use {"operations": [...]} with 1 to 30 operations.')
  const { operations } = data
  if (operations.length < 1 || operations.length > 30) throw new Error('Use 1 to 30 operations.')
  operations.forEach((op, i) => {
    const at = `Operation ${i + 1}`
    if (!Array.isArray(op)) throw new Error(`${at} must be ["change", index, number] or ["find", number].`)
    if (op[0] === 'change') {
      if (op.length !== 3 || !Number.isInteger(op[1]) || op[1] < 0 || op[1] > MAX_INDEX) throw new Error(`${at}: index is an integer from 0 to 1000.`)
      if (!Number.isInteger(op[2]) || op[2] < 1 || op[2] > MAX_NUMBER) throw new Error(`${at}: number is an integer from 1 to 1000.`)
    } else if (op[0] === 'find') {
      if (op.length !== 2 || !Number.isInteger(op[1]) || op[1] < 1 || op[1] > MAX_NUMBER) throw new Error(`${at}: number is an integer from 1 to 1000.`)
    } else {
      throw new Error(`${at}: unknown operation "${op[0]}".`)
    }
  })
  return data
}

export function buildTrace(data) {
  const at = new Map(), indices = new Map()
  const results = []
  const frames = []
  const maps = () => [
    { name: 'at', keyLabel: 'index', valueLabel: 'number', isSet: false, entries: [...at] },
    { name: 'indices', keyLabel: 'number', valueLabel: 'indices', isSet: false, entries: [...indices].map(([n, set]) => [n, [...set].sort((a, b) => a - b).join(', ')]) },
  ]
  frames.push({ phase: 'start', activeLine: L('at = empty map'), maps: maps(), ops: [], result: null, message: 'Two tables start empty: one for the number at each index, one for the indices holding each number.' })
  data.operations.forEach(op => {
    if (op[0] === 'change') {
      const [, index, number] = op
      const ops = []
      if (at.has(index)) {
        const old = at.get(index)
        indices.get(old).delete(index)
        if (indices.get(old).size === 0) indices.delete(old)
        ops.push({ map: 'indices', type: 'update', key: old, value: '(index removed)', before: `index ${index} left` })
      }
      at.set(index, number)
      const set = indices.get(number) ?? new Set()
      set.add(index)
      indices.set(number, set)
      ops.push({ map: 'at', type: 'update', key: index, value: number, before: undefined })
      results.push(null)
      frames.push({ phase: 'change', activeLine: L('set at of i to n'), maps: maps(), ops, result: null,
        message: `Index ${index} now holds ${number}. Its set of indices for ${number} now lists ${[...set].sort((a, b) => a - b).join(', ')}.` })
    } else {
      const number = op[1]
      const set = indices.get(number)
      const answer = set && set.size ? Math.min(...set) : -1
      results.push(answer)
      frames.push({ phase: 'find', activeLine: answer === -1 ? L('return -1') : L('return the smallest index'), maps: maps(),
        ops: [{ map: 'indices', type: 'lookup', via: 'get', key: number, hit: answer !== -1, value: set ? [...set].join(', ') : undefined,
          hitNote: 'the set of indices for this number is ready', missNote: 'no index holds this number' }],
        result: answer, message: answer === -1 ? `No index holds ${number}, so the answer is -1.` : `The smallest index holding ${number} is ${answer}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return the smallest index'), maps: maps(), ops: [], result: null, message: 'All operations are answered in order.' })
  return { input: data, result: results, frames }
}

export const code = `number container system with two tables
at = empty map from index to the number stored there
indices = empty map from number to the set of indices holding it
change at index i to number n
  if i already holds a number then
    remove i from the set of its old number
  set at of i to n
  add i to the set of n
find the smallest index holding number n
  if the set of n is empty then
    return -1
  return the smallest index in the set of n`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_containers(operations):
    at = {}
    indices = {}
    results = []
    for op in operations:
        if op[0] == 'change':
            _, index, number = op
            if index in at:
                indices[at[index]].discard(index)
            at[index] = number
            indices.setdefault(number, set()).add(index)
            results.append(None)
        else:
            _, number = op
            found = indices.get(number, set())
            results.append(min(found) if found else -1)
    return results
`
