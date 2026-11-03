export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with a running total of 0. The empty prefix counts, so the lowest point starts at 0.' },
  { id: 'inspect', label: 'Add a step', description: 'Add the next value to the running total.' },
  { id: 'update', label: 'Track lowest', description: 'Keep the lowest running total seen so far; the starting value must lift that lowest point to 1.' },
  { id: 'done', label: 'Complete', description: 'The start is 1 minus the lowest total. Because the lowest total is never above 0, this is at least 1.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 1 || input.length > 12) throw new Error('Use a JSON array of 1 to 12 integers.')
  if (!input.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) throw new Error('Each value must be an integer from -100 to 100.')
  return input
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(nums) {
  let total = 0
  let lowest = 0
  const frames = [{
    phase: 'start', activeLine: L('total = 0'), pythonLine: P('total = 0'),
    snapshot: { values: nums, index: null, total, lowest },
    message: `${nums.length} steps. The running total starts at 0, and 0 itself counts as the lowest point so far.`,
  }]
  nums.forEach((x, index) => {
    total += x
    frames.push({
      phase: 'inspect', activeLine: L('total += x'), pythonLine: P('total += x'),
      snapshot: { values: nums, index, total, lowest },
      message: `Step ${index + 1} adds ${x}, so the running total is now ${total}.`,
    })
    lowest = Math.min(lowest, total)
    frames.push({
      phase: 'update', activeLine: L('lowest = min'), pythonLine: P('lowest = min'),
      snapshot: { values: nums, index, total, lowest },
      message: `The lowest running total so far is ${lowest}.`,
    })
  })
  const result = 1 - lowest
  frames.push({
    phase: 'done', activeLine: L('return 1 - lowest'), pythonLine: P('return 1 - lowest'),
    snapshot: { values: nums, index: null, total, lowest },
    message: `The lowest point is ${lowest}, so the start must be at least ${1 - lowest}. Answer: ${result}.`,
  })
  return { input: nums, result, frames }
}

export const code = `smallest start value (nums):
  total = 0                  # running sum of the steps so far
  lowest = 0                 # the empty prefix counts as 0
  for x in nums:
    total += x
    lowest = min(lowest, total)
  return 1 - lowest          # lifts the lowest point to exactly 1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_start(nums):
    total = 0
    lowest = 0
    for x in nums:
        total += x
        lowest = min(lowest, total)
    return 1 - lowest
`
