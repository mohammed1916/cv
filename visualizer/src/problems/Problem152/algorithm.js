export const phases = [
  { id: 'start', label: 'Start', description: 'The first value is the only subarray so far, so the running maximum, minimum and answer all start there.' },
  { id: 'candidates', label: 'Compute candidates', description: 'Extend the largest and smallest products ending at the previous index by the current value.' },
  { id: 'update', label: 'Update max and min', description: 'Keep the largest and smallest candidates; a negative value swaps their roles.' },
  { id: 'record', label: 'Record answer', description: 'The answer is the larger of the old best and the new running maximum.' },
  { id: 'done', label: 'Complete', description: 'Return the largest product over all contiguous subarrays.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 200 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 10)) throw new Error('Enter a JSON array of 1 to 200 integers from -10 to 10.')
  return { nums: nums.map(v => v + 0) }
}

export const code = `max product subarray (nums):
  cur_max = cur_min = best = nums[0]
  for each num after the first:
    candidates = (num, cur_max*num, cur_min*num)
    cur_max = max(candidates)
    cur_min = min(candidates)
    best = max(best, cur_max)
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_product(nums):
    cur_max = cur_min = best = nums[0]
    for num in nums[1:]:
        candidates = (num, cur_max * num, cur_min * num)
        cur_max = max(candidates)
        cur_min = min(candidates)
        best = max(best, cur_max)
    return best
`

const LINE = { start: 2, candidates: 4, update: 5, record: 7, done: 8 }

export function buildTrace({ nums }) {
  let curMax = nums[0]
  let curMin = nums[0]
  let best = nums[0]
  const snap = (index, num, candidates) => ({ index, num, candidates, curMax, curMin, best })
  const frames = [{ phase: 'start', activeLine: LINE.start, pythonLine: LINE.start, snapshot: snap(0, nums[0], null), message: `Start with ${nums[0]} as the running maximum, minimum and answer.` }]
  for (let i = 1; i < nums.length; i++) {
    const num = nums[i]
    const candidates = [num, curMax * num, curMin * num]
    frames.push({ phase: 'candidates', activeLine: LINE.candidates, pythonLine: LINE.candidates, snapshot: snap(i, num, candidates), message: `Value ${num}: candidates are ${candidates.join(', ')}.` })
    curMax = Math.max(...candidates) + 0
    curMin = Math.min(...candidates) + 0
    frames.push({ phase: 'update', activeLine: LINE.update, pythonLine: LINE.update, snapshot: snap(i, num, candidates), message: num < 0 ? `A negative value swaps the roles: max is now ${curMax}, min is now ${curMin}.` : `Max is now ${curMax} and min is now ${curMin}.` })
    best = Math.max(best, curMax) + 0
    frames.push({ phase: 'record', activeLine: LINE.record, pythonLine: LINE.record, snapshot: snap(i, num, candidates), message: `Best product so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: LINE.done, pythonLine: LINE.done, snapshot: snap(null, null, null), message: `Maximum product: ${best}.` })
  return { input: { nums }, result: best + 0, frames }
}
