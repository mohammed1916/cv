// Collect the indices of every value. A value counts when it appears exactly three times
// and the gap between its first two indices equals the gap between its last two.

const MAX_LENGTH = 20

const codeLines = [
  'positions is an empty table',
  'for each index i',
  '  append i to positions[nums[i]]',
  'count is 0',
  'for each value and its list of positions idx',
  '  if idx has exactly three entries and the two gaps are equal',
  '    add one to count',
  'return count',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'def count_equally_spaced(nums):',
  '    positions = {}',
  '    for i, v in enumerate(nums):',
  '        positions.setdefault(v, []).append(i)',
  '    count = 0',
  '    for idx in positions.values():',
  '        if len(idx) == 3 and idx[1] - idx[0] == idx[2] - idx[1]:',
  '            count += 1',
  '    return count',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > MAX_LENGTH) throw new Error(`Use an array of 3 to ${MAX_LENGTH} values.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const positions = new Map()
  const snapshot = () => [...positions.entries()].map(([value, idx]) => [value, [...idx]])
  let count = 0

  frames.push({ phase: 'start', pythonLine: P('positions = {}'), activeLine: L('positions is an empty table'), at: -1, positions: [], value: null, verdict: null, count, message: 'No positions recorded yet.' })
  nums.forEach((value, i) => {
    if (!positions.has(value)) positions.set(value, [])
    positions.get(value).push(i)
    frames.push({ phase: 'collect', pythonLine: P('positions.setdefault'), activeLine: L('append i to positions'), at: i, positions: snapshot(), value: null, verdict: null, count, message: `Index ${i} holds ${value}; its positions are now ${positions.get(value).join(', ')}.` })
  })
  frames.push({ phase: 'count', pythonLine: P('count = 0'), activeLine: L('count is 0'), at: -1, positions: snapshot(), value: null, verdict: null, count, message: 'Every value now has its full list of positions.' })

  for (const [value, idx] of positions) {
    const exactlyThree = idx.length === 3
    const equal = exactlyThree && idx[1] - idx[0] === idx[2] - idx[1]
    const verdict = !exactlyThree ? 'skip' : equal ? 'counted' : 'gaps differ'
    if (equal) count += 1
    frames.push({ phase: 'check', pythonLine: P('if len(idx) == 3'), activeLine: L('if idx has exactly three'), at: -1, positions: snapshot(), value, idx: [...idx], verdict, count, message: !exactlyThree ? `${value} appears ${idx.length} time${idx.length === 1 ? '' : 's'}; it is not counted.` : equal ? `${value} at ${idx.join(', ')} has equal gaps; count it.` : `${value} at ${idx.join(', ')} has unequal gaps; skip it.` })
    if (equal) frames.push({ phase: 'add', pythonLine: P('count += 1'), activeLine: L('add one to count'), at: -1, positions: snapshot(), value, idx: [...idx], verdict, count, message: `Count is now ${count}.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return count'), activeLine: L('return count'), at: -1, positions: snapshot(), value: null, verdict: null, count, message: `Answer: ${count}.` })
  return { input: nums, result: count, frames }
}
