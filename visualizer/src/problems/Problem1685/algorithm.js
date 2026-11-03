export const phases = [
  { id: 'start', label: 'Start', description: 'Find the total of all values. Nothing is before the first index yet.' },
  { id: 'scan', label: 'Split sums', description: 'Values before index i are below it and values after it are above it. The total gives the above-sum without a second scan.' },
  { id: 'add', label: 'Add answer', description: 'Each side contributes its gap to the current value: count times value, minus the side sum.' },
  { id: 'move', label: 'Move index', description: 'Add the current value to the running prefix sum so the next index sees it as a value before it.' },
  { id: 'done', label: 'Result', description: 'Every index has its sum of absolute differences.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12) throw new Error('Enter a JSON array of 2 to 12 integers, such as [1, 4, 6].')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('Values are integers from -100 to 100.')
  for (let i = 1; i < nums.length; i++) if (nums[i] < nums[i - 1]) throw new Error('The array must be sorted in non-decreasing order.')
  return nums
}

// Each phase points at one line of the code and one line of the Python.
const LINE = {
  start: [2, 3], scan: [5, 7], add: [6, 8], move: [7, 9], done: [8, 10],
}
const at = phase => ({ activeLine: LINE[phase][0], pythonLine: LINE[phase][1] })

export function buildTrace(nums) {
  const n = nums.length
  const total = nums.reduce((sum, v) => sum + v, 0)
  const result = []
  let before = 0
  const frames = []
  const snap = (index, extra = {}) => ({
    index, n, total, before, result: [...result], ...extra,
  })
  frames.push({
    phase: 'start', ...at('start'), snapshot: snap(null),
    message: `There are ${n} sorted values and their total is ${total}. Walk left to right and keep the sum of values seen so far.`,
  })
  nums.forEach((value, i) => {
    const after = total - before - value
    const below = i
    const above = n - 1 - i
    frames.push({
      phase: 'scan', ...at('scan'), snapshot: snap(i, { value, after, below, above }),
      message: `Index ${i} holds ${value}. Before it: ${below} value${below === 1 ? '' : 's'} summing to ${before}. After it: ${above} value${above === 1 ? '' : 's'} summing to ${after}.`,
    })
    const leftGap = value * below - before
    const rightGap = after - value * above
    const answer = leftGap + rightGap
    result.push(answer)
    frames.push({
      phase: 'add', ...at('add'), snapshot: snap(i, { value, after, below, above, answer, leftGap, rightGap }),
      message: `Index ${i}: the left side adds ${leftGap} and the right side adds ${rightGap}, so the answer is ${answer}.`,
    })
    before += value
    frames.push({
      phase: 'move', ...at('move'), snapshot: snap(i, { value, after, below, above }),
      message: `Move on: ${value} now counts as a value before index ${i + 1}, so the prefix sum is ${before}.`,
    })
  })
  frames.push({
    phase: 'done', ...at('done'), snapshot: snap(null),
    message: `Answers: ${result.join(', ')}.`,
  })
  return { input: nums, result, frames }
}

const codeText = `sum of absolute differences (nums):
  n = length of nums, total = sum of nums
  before = 0
  for each index i with value v:
    after = total - before - v
    answer[i] = v*i - before + after - v*(n-1-i)
    before += v
  return answer`
export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def get_sum_absolute_differences(nums):
    n = len(nums)
    total = sum(nums)
    before = 0
    answer = []
    for i, value in enumerate(nums):
        after = total - before - value
        answer.append(value * i - before + after - value * (n - 1 - i))
        before += value
    return answer
`
