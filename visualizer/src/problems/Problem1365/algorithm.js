// Teaching model written for this visualizer. The sample values and wording are original.
export const phases = [
  { id: 'sort', label: 'Sort copy', description: 'Sort a copy so every value has a clear place among the others.' },
  { id: 'scan', label: 'Scan', description: 'For each value, walk the sorted copy until values stop being smaller.' },
  { id: 'done', label: 'Result', description: 'Return one count per position in the original order.' },
]

const CODE = [
  'smaller counts(nums):',
  '  ordered = sorted copy of nums',
  '  answer = empty list',
  '  for each value in nums:',
  '    j = 0',
  '    while ordered[j] < value: j += 1',
  '    answer.push(j)',
  '  return answer',
]
const PYTHON = `def smaller_than_current(nums):
    ordered = sorted(nums)
    return [ordered.index(v) for v in nums]`
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

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Enter a JSON array of 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Each value must be a whole number from 0 to 100.')
  return nums
}

export function buildTrace(nums) {
  const ordered = [...nums].sort((a, b) => a - b)
  const answer = []
  const frames = []
  const snap = (extra = {}) => ({ nums, ordered, answer: [...answer], ...extra })

  frames.push({
    phase: 'sort', activeLine: L('ordered = sorted copy'), pythonLine: P('ordered = sorted'),
    message: `Sorted copy: ${ordered.join(', ')}. In this order, the first place a value appears is the number of smaller values before it.`,
    snapshot: snap(),
  })
  nums.forEach((value, index) => {
    let j = 0
    while (ordered[j] < value) j += 1
    answer.push(j)
    frames.push({
      phase: 'scan', activeLine: L('while ordered[j] < value'), pythonLine: P('for v in nums'),
      message: `Position ${index} holds ${value}. Walking the sorted copy stops at position ${j}, where the value is no longer smaller, so ${j} value${j === 1 ? '' : 's'} are smaller.`,
      snapshot: snap({ index, value, pointer: j }),
    })
  })
  frames.push({
    phase: 'done', activeLine: L('return answer'), pythonLine: P('return [ordered'),
    message: `Return ${answer.join(', ')}, one count for each position in the original order.`,
    snapshot: snap(),
  })
  return { input: nums, result: answer, frames }
}
