export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with nothing taken. The rest is the whole array.' },
  { id: 'sort', label: 'Sort', description: 'Order the values from largest to smallest.' },
  { id: 'take', label: 'Take a value', description: 'Move the next largest value into the chosen group.' },
  { id: 'check', label: 'Compare sums', description: 'Compare the chosen sum with the sum of everything not chosen.' },
  { id: 'done', label: 'Complete', description: 'Return the chosen values, which are already in non-increasing order.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) {
    throw new Error('Use a JSON array of 1 to 16 integers from 1 to 100, such as [2, 7, 5, 1].')
  }
  return nums
}

export function buildTrace(nums) {
  const sorted = [...nums].sort((a, b) => b - a)
  const total = nums.reduce((sum, v) => sum + v, 0)
  const taken = []
  let chosen = 0
  const snap = (index, extra = {}) => ({ sorted, index, taken: [...taken], chosen, rest: total - chosen, total, ...extra })
  const frames = [{
    phase: 'start', activeLine: L('total = sum'), pythonLine: PY('total = sum'), snapshot: snap(null),
    message: `The array sums to ${total}. Nothing is taken yet, so the chosen sum is 0 and the rest is ${total}.`,
  }]
  frames.push({
    phase: 'sort', activeLine: L('sort'), pythonLine: PY('for value in'), snapshot: snap(null),
    message: `Largest first: ${sorted.join(', ')}. Taking the largest values gives the biggest chosen sum for each group size.`,
  })
  for (let i = 0; i < sorted.length; i++) {
    taken.push(sorted[i])
    chosen += sorted[i]
    frames.push({
      phase: 'take', activeLine: L('append'), pythonLine: PY('taken.append'), snapshot: snap(i),
      message: `Take ${sorted[i]}. The chosen sum is now ${chosen}.`,
    })
    const rest = total - chosen
    if (chosen > rest) {
      frames.push({
        phase: 'check', activeLine: L('stop'), pythonLine: PY('if chosen'), snapshot: snap(i),
        message: `Chosen ${chosen} is greater than the rest ${rest}, so this shortest group is complete.`,
      })
      break
    }
    frames.push({
      phase: 'check', activeLine: L('stop'), pythonLine: PY('if chosen'), snapshot: snap(i),
      message: `Chosen ${chosen} does not yet beat the rest ${rest}. Keep taking.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return taken'), pythonLine: PY('return taken'), snapshot: snap(null),
    message: `Answer: [${taken.join(', ')}]. Its sum is ${chosen}, larger than the other ${total - chosen}.`,
  })
  return { input: nums, result: taken, frames }
}

export const code = `minimum subsequence (nums):
  total = sum of nums
  sort nums from largest to smallest
  chosen = 0, taken = empty list
  for each value in sorted order:
    append value to taken
    chosen = chosen + value
    if chosen > total - chosen: stop
  return taken`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_subsequence(nums):
    total = sum(nums)
    chosen = 0
    taken = []
    for value in sorted(nums, reverse=True):
        taken.append(value)
        chosen += value
        if chosen > total - chosen:
            break
    return taken
`
const PY = s => python.split('\n').findIndex(l => l.includes(s)) + 1
