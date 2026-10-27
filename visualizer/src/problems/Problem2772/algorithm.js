export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and k.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 10)) {
    throw new Error('nums must be 1 to 12 integers from 0 to 10.')
  }
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be an integer from 1 to nums.length.')
  return { nums, k }
}

export const code = `can every element become zero using operations of size k
  let n be the length of nums
  make an array ended of zeros with one extra slot
  set active to zero, the operations still covering this position
  for each position i from left to right
  remove operations that ended before position i
  let need be nums[i] minus active
  if need is negative then the answer is no
  if need is positive and i plus k is past the end then the answer is no
  start need operations at i and add them to active
  record that they end just before i plus k
  the answer is yes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums, k }) {
  const n = nums.length
  const ended = Array(n + 1).fill(0)
  let active = 0
  const frames = [{ phase: 'start', activeLine: L('make an array ended'), index: -1, active: 0, message: `Operations cover k = ${k} positions each. Sweep from the left.` }]
  let result = true
  for (let i = 0; i < n; i++) {
    active -= ended[i]
    const need = nums[i] - active
    frames.push({ phase: 'check', activeLine: L('remove operations that ended'), index: i, active, message: `Position ${i}: ${active} operation(s) already cover it, value ${nums[i]}.` })
    if (need < 0) {
      frames.push({ phase: 'fail', activeLine: L('if need is negative'), index: i, active, message: `Position ${i} was lowered too far earlier, so it cannot be raised back.` })
      result = false
      break
    }
    if (need > 0) {
      if (i + k > n) {
        frames.push({ phase: 'fail', activeLine: L('i plus k is past'), index: i, active, message: `Position ${i} needs ${need} more operation(s), but a size-${k} operation would run past the end.` })
        result = false
        break
      }
      active += need
      ended[i + k] += need
      frames.push({ phase: 'start-ops', activeLine: L('start need operations'), index: i, active, message: `Start ${need} operation(s) at ${i}; they end before ${i + k}.` })
    }
  }
  if (result) frames.push({ phase: 'done', activeLine: L('the answer is yes'), index: -1, active, message: 'Every position can be made zero.' })
  return { input: { nums, k }, result, frames }
}

export const python = `def can_zero(nums, k):
    n = len(nums)
    ended = [0] * (n + 1)
    active = 0
    for i in range(n):
        active -= ended[i]
        need = nums[i] - active
        if need < 0:
            return False
        if need > 0:
            if i + k > n:
                return False
            active += need
            ended[i + k] += need
    return True
`
