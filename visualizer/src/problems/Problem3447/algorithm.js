export const python = `def assignElements(groups, elements):
    first = {}
    for j, value in enumerate(elements):
        if value not in first:
            first[value] = j
    limit = max(groups)
    best = [None] * (limit + 1)
    for value, index in first.items():
        for multiple in range(value, limit + 1, value):
            if best[multiple] is None or index < best[multiple]:
                best[multiple] = index
    return [-1 if best[g] is None else best[g] for g in groups]
`

const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const code = [
  'FUNCTION assignElements(groups, elements)',
  'firstIndex ← empty map',
  'FOR j FROM 0 TO length(elements) − 1',
  'IF elements[j] is not in firstIndex THEN firstIndex[elements[j]] ← j',
  'limit ← max(groups)',
  'bestFor[m] ← none for every m from 0 to limit',
  'FOR EACH value and index in firstIndex',
  'FOR EACH multiple m of value up to limit',
  'IF bestFor[m] is none or index < bestFor[m] THEN bestFor[m] ← index',
  'RETURN for each group g: bestFor[g], or −1 when none',
].map((text, index) => ({ line: index + 1, text }))

export function parseInput(text) {
  const data = typeof text === 'string' ? JSON.parse(text) : text
  if (!data || typeof data !== 'object') throw new Error('Use a JSON object with groups and elements.')
  const { groups, elements } = data
  const checkList = (list, name) => {
    if (!Array.isArray(list) || list.length < 1 || list.length > 8) throw new Error(`${name} must have 1 to 8 values for this visualization.`)
    if (!list.every(value => Number.isInteger(value) && value >= 1 && value <= 50)) throw new Error(`${name} values must be integers from 1 to 50 for this visualization.`)
  }
  checkList(groups, 'groups')
  checkList(elements, 'elements')
  return { groups: [...groups], elements: [...elements] }
}

export function buildTrace(input) {
  const { groups, elements } = input
  const limit = Math.max(...groups)
  const first = new Map()
  const best = Array(limit + 1).fill(null)
  const frames = []
  const snap = extra => ({ groups, elements, first: new Map(first), best: [...best], limit, value: null, index: null, multiple: -1, assigned: null, result: null, ...extra })
  frames.push(snap({ phase: 'setup', activeLine: 2, pythonLine: P('first = {}'), message: 'Start with an empty map from element value to its first index.' }))
  elements.forEach((value, j) => {
    if (!first.has(value)) {
      first.set(value, j)
      frames.push(snap({ phase: 'index', activeLine: 4, pythonLine: P('first[value] = j'), value, index: j, message: `Element ${value} at index ${j} is its first occurrence, so record it.` }))
    } else {
      frames.push(snap({ phase: 'index', activeLine: 4, pythonLine: P('if value not in first'), value, index: first.get(value), message: `Element ${value} already has an earlier index, so keep that one.` }))
    }
  })
  frames.push(snap({ phase: 'limit', activeLine: 5, pythonLine: P('limit = max(groups)'), message: `The largest group size is ${limit}, so sizes 0 to ${limit} need an answer.` }))
  for (const [value, index] of first) {
    frames.push(snap({ phase: 'sieve', activeLine: 7, pythonLine: P('for value, index in first.items'), value, index, message: `Element ${value} (index ${index}) divides only its multiples, so sieve over them.` }))
    for (let m = value; m <= limit; m += value) {
      if (best[m] === null || index < best[m]) {
        best[m] = index
        frames.push(snap({ phase: 'sieve', activeLine: 9, pythonLine: P('best[multiple] = index'), value, index, multiple: m, message: `Size ${m} is divisible by ${value}; record index ${index}.` }))
      } else {
        frames.push(snap({ phase: 'sieve', activeLine: 9, pythonLine: P('if best[multiple] is None'), value, index, multiple: m, message: `Size ${m} already has index ${best[m]}, which is not larger than ${index}.` }))
      }
    }
  }
  const assigned = groups.map(g => (best[g] === null ? -1 : best[g]))
  frames.push(snap({ phase: 'done', activeLine: 10, pythonLine: P('return [-1 if best'), assigned, result: assigned,
    message: `Return ${JSON.stringify(assigned)}.` }))
  return { input, result: assigned, frames }
}
