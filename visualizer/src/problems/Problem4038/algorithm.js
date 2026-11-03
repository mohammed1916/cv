// A value qualifies when all of its occurrences form one contiguous block.
// We count the blocks each value starts: a new block begins wherever a value differs from the value before it.
// A value with exactly one block is counted.

const MAX_LENGTH = 20

const codeLines = [
  'runs is an empty table',
  'for each index i',
  '  if i is 0 or nums[i] differs from nums[i - 1]',
  '    add one run for nums[i]',
  'count values whose run count is exactly one',
  'return the count',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'def count_single_block(nums):',
  '    runs = {}',
  '    for i, v in enumerate(nums):',
  '        if i == 0 or nums[i - 1] != v:',
  '            runs[v] = runs.get(v, 0) + 1',
  '    return sum(1 for count in runs.values() if count == 1)',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`Use an array of 1 to ${MAX_LENGTH} values.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const runs = new Map()
  const snapshot = () => [...runs.entries()]
  const singles = () => [...runs.entries()].filter(([, count]) => count === 1).map(([value]) => value)

  frames.push({ phase: 'start', pythonLine: P('runs = {}'), activeLine: L('runs is an empty table'), at: -1, runs: [], kind: 'none', message: 'No value has a block yet.' })
  nums.forEach((value, i) => {
    frames.push({ phase: 'scan', pythonLine: P('for i, v in enumerate'), activeLine: L('for each index i'), at: i, runs: snapshot(), kind: 'none', message: `Look at index ${i}, value ${value}.` })
    const startsBlock = i === 0 || nums[i - 1] !== value
    if (startsBlock) {
      runs.set(value, (runs.get(value) || 0) + 1)
      frames.push({ phase: 'run', pythonLine: P('runs[v] = runs.get'), activeLine: L('add one run'), at: i, runs: snapshot(), kind: 'new', message: `${value} starts a new block here; it now has ${runs.get(value)} block${runs.get(value) === 1 ? '' : 's'}.` })
    } else {
      frames.push({ phase: 'continue', pythonLine: P('if i == 0 or'), activeLine: L('if i is 0 or'), at: i, runs: snapshot(), kind: 'continue', message: `${value} continues the block that is already open.` })
    }
  })
  const answer = singles().length
  frames.push({ phase: 'count', pythonLine: P('return sum'), activeLine: L('count values whose'), at: -1, runs: snapshot(), kind: 'none', singles: singles(), message: `Values with exactly one block: ${singles().join(', ') || 'none'}.` })
  frames.push({ phase: 'done', pythonLine: P('return sum'), activeLine: L('return the count'), at: -1, runs: snapshot(), kind: 'none', singles: singles(), message: `Answer: ${answer}.` })
  return { input: nums, result: answer, frames }
}
