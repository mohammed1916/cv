export const phases = [
  { id: 'extend', label: 'Extend window', description: 'Add the new number on the right and update both monotonic queues.' },
  { id: 'shrink', label: 'Shrink window', description: 'Drop numbers from the left until max minus min is within the limit.' },
  { id: 'record', label: 'Record length', description: 'Keep the longest valid window seen so far.' },
]

const PYTHON = `from collections import deque

def longest_within_limit(nums, limit):
    max_q, min_q = deque(), deque()
    left = 0
    best = 0
    for right, x in enumerate(nums):
        while max_q and nums[max_q[-1]] <= x:
            max_q.pop()
        max_q.append(right)
        while min_q and nums[min_q[-1]] >= x:
            min_q.pop()
        min_q.append(right)
        while nums[max_q[0]] - nums[min_q[0]] > limit:
            if max_q[0] == left:
                max_q.popleft()
            if min_q[0] == left:
                min_q.popleft()
            left += 1
        best = max(best, right - left + 1)
    return best`

export const python = PYTHON
export const code = PYTHON.split('\n').map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))
const lineAt = marker => code.find(({ text }) => text.includes(marker)).line

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.nums) || !Number.isInteger(data.limit)) {
    throw new Error('Enter an object like {"nums": [4,2,5], "limit": 3}.')
  }
  if (data.nums.length < 1 || data.nums.length > 30) throw new Error('nums must have between 1 and 30 entries.')
  if (!data.nums.every(x => Number.isInteger(x) && x >= 0 && x <= 99)) throw new Error('Every entry must be an integer from 0 to 99.')
  if (data.limit < 0 || data.limit > 99) throw new Error('limit must be an integer from 0 to 99.')
  return { nums: data.nums, limit: data.limit }
}

/** Sliding window; each queue keeps indices in order, so its front is always the window's max or min. */
export function buildTrace({ nums, limit }) {
  const frames = []
  const maxQ = []
  const minQ = []
  let left = 0
  let best = 0
  const snap = (right, extra = {}) => ({
    nums, limit, right, left,
    maxQueue: [...maxQ], minQueue: [...minQ],
    maxValue: maxQ.length && right !== null ? nums[maxQ[0]] : null,
    minValue: minQ.length && right !== null ? nums[minQ[0]] : null,
    best, ...extra,
  })

  frames.push({ phase: 'extend', activeLine: lineAt('max_q, min_q = deque()'), message: `Start with an empty window and an ordered limit of ${limit}.`, snapshot: snap(null) })
  for (let right = 0; right < nums.length; right++) {
    const x = nums[right]
    while (maxQ.length && nums[maxQ.at(-1)] <= x) maxQ.pop()
    maxQ.push(right)
    while (minQ.length && nums[minQ.at(-1)] >= x) minQ.pop()
    minQ.push(right)
    frames.push({
      phase: 'extend', activeLine: lineAt('min_q.append(right)'),
      message: `Add ${x} at index ${right}. Both queues now keep only the candidates that could still be the window's max or min.`,
      snapshot: snap(right),
    })
    while (nums[maxQ[0]] - nums[minQ[0]] > limit) {
      if (maxQ[0] === left) maxQ.shift()
      if (minQ[0] === left) minQ.shift()
      left += 1
      frames.push({
        phase: 'shrink', activeLine: lineAt('left += 1'),
        message: `Max ${nums[maxQ[0]]} minus min ${nums[minQ[0]]} is above ${limit}, so drop index ${left - 1} from the left. The window is now [${left}, ${right}].`,
        snapshot: snap(right),
      })
    }
    best = Math.max(best, right - left + 1)
    frames.push({
      phase: 'record', activeLine: lineAt('best = max(best'),
      message: `The valid window [${left}, ${right}] has length ${right - left + 1}. The best so far is ${best}.`,
      snapshot: snap(right),
    })
  }
  frames.push({ phase: 'record', activeLine: lineAt('return best'), message: `The longest valid window has length ${best}.`, snapshot: snap(null) })
  return { input: { nums, limit }, result: best, frames }
}
