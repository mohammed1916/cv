export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a JSON array of 1 to 12 positive integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Each value is an integer from 1 to 20 in this view.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let count = 0
  frames.push({ phase: 'start', l: -1, r: -1, max: null, counted: false, count, activeLine: L('let count = 0'), pythonLine: P('count = 0'), message: 'Start with no subarrays counted.' })
  for (let l = 0; l < nums.length; l++) {
    let max = -Infinity
    frames.push({ phase: 'left', l, r: l, max: null, counted: false, count, activeLine: L('for (let l = 0'), pythonLine: P('for l in range'), message: `Subarrays that start at index ${l}.` })
    for (let r = l; r < nums.length; r++) {
      max = Math.max(max, nums[r])
      const hit = nums[l] === max && nums[r] === max
      if (hit) count += 1
      frames.push({ phase: hit ? 'count' : 'extend', l, r, max, counted: hit, count, activeLine: L(hit ? 'count += 1' : 'max = Math.max'), pythonLine: P(hit ? 'count += 1' : 'max_value = max'),
        message: hit ? `[${nums[l]}, …, ${nums[r]}] has its largest value ${max} at both ends: counted.` : `Subarray ${l}..${r} has largest value ${max}, and an end is not equal to it.` })
    }
  }
  frames.push({ phase: 'done', l: -1, r: -1, max: null, counted: false, count, activeLine: L('return count'), pythonLine: P('return count'), message: `${count} subarray${count === 1 ? '' : 's'} have equal boundary maxima.` })
  return { input: nums, result: count, frames }
}

export const code = `function countBoundaryMax(nums) {
  let count = 0
  for (let l = 0; l < nums.length; l++) {
    let max = -Infinity
    for (let r = l; r < nums.length; r++) {
      max = Math.max(max, nums[r])
      if (nums[l] === max && nums[r] === max) count += 1
    }
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_boundary_max(nums):
    count = 0
    for l in range(len(nums)):
        max_value = float("-inf")
        for r in range(l, len(nums)):
            max_value = max(max_value, nums[r])
            if nums[l] == max_value and nums[r] == max_value:
                count += 1
    return count
`
const PY = python.split('\n')
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}
