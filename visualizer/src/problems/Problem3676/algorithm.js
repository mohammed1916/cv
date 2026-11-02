export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30) throw new Error('nums has 1 to 30 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) throw new Error('Each value is an integer from 0 to 1000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  let total = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('set total'), left: -1, right: -1, inner: null, total, message: 'No bowl subarrays counted yet.' })
  for (let left = 0; left < n; left++) {
    let inner = -Infinity
    frames.push({ pythonLine: 3, phase: 'left', activeLine: L('for each left'), left, right: -1, inner: null, total, message: `Anchor the left end at index ${left}, value ${nums[left]}.` })
    frames.push({ pythonLine: 4, phase: 'left', activeLine: L('set inner max'), left, right: -1, inner: null, total, message: 'Reset the interior maximum.' })
    for (let right = left + 2; right < n; right++) {
      inner = Math.max(inner, nums[right - 1])
      frames.push({ pythonLine: 6, phase: 'extend', activeLine: L('raise inner max'), left, right, inner, total, message: `Interior now reaches ${inner} (index ${right - 1} joins).` })
      if (inner >= nums[left]) {
        frames.push({ pythonLine: 8, phase: 'stop', activeLine: L('then stop this left'), left, right, inner, total, message: `${inner} is at least ${nums[left]}, so no longer right end can form a bowl.` })
        break
      }
      if (nums[right] > inner) {
        total += 1
        frames.push({ pythonLine: 10, phase: 'count', activeLine: L('add one to total'), left, right, inner, total, message: `Both ends beat ${inner}: bowl [${left}..${right}] counted.` })
      } else {
        frames.push({ pythonLine: 9, phase: 'skip', activeLine: L('add one to total'), left, right, inner, total, message: `End ${nums[right]} does not beat ${inner}; no bowl ends here.` })
      }
    }
  }
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return total'), left: -1, right: -1, inner: null, total, message: `${total} bowl subarray${total === 1 ? '' : 's'} counted.` })
  return { input: { nums }, result: total, frames }
}

export const code = `count bowl subarrays of nums
  set total to 0
  for each left index
    set inner max to negative infinity
    for each right index from left plus 2 to the end
      raise inner max to include nums at right minus 1
      if inner max is at least nums at left then stop this left
      if nums at right is above inner max then add one to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_bowl_subarrays(nums):
    total = 0
    for left in range(len(nums)):
        inner_max = float('-inf')
        for right in range(left + 2, len(nums)):
            inner_max = max(inner_max, nums[right - 1])
            if inner_max >= nums[left]:
                break
            if nums[right] > inner_max:
                total += 1
    return total
`
