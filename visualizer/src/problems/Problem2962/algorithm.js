export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Give nums as an array of 1 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 5)) throw new Error('Each value in nums is an integer from 1 to 5.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 4) throw new Error('k is an integer from 1 to 4.')
  return { nums, k: input.k }
}

export function buildTrace({ nums, k }) {
  const largest = Math.max(...nums)
  const frames = [{ phase: 'start', activeLine: L('set largest to'), largest, left: 0, right: -1, count: 0, total: 0, message: `The largest value is ${largest}. Count windows where it appears at least ${k} times.` }]
  let left = 0, count = 0, total = 0
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === largest) count++
    frames.push({ phase: 'extend', activeLine: L('add one to count'), largest, left, right, count, total, message: `Add nums[${right}] = ${nums[right]}. The window holds ${count} copies of ${largest}.` })
    while (count >= k) {
      if (nums[left] === largest) count--
      left++
      frames.push({ phase: 'shrink', activeLine: L('subtract one from count'), largest, left, right, count, total, message: `The window still has at least ${k} copies, so move the left end to ${left}.` })
    }
    total += left
    frames.push({ phase: 'count', activeLine: L('add left to total'), largest, left, right, count, total, message: `Starts 0 to ${left - 1} each hold at least ${k} copies for end ${right}. Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), largest, left, right: nums.length - 1, count, total, message: `There are ${total} qualifying subarrays.` })
  return { input: { nums, k }, result: total, frames }
}

export const code = `count subarrays where the maximum appears at least k times (nums, k)
  set largest to the maximum of nums
  set left to zero, count to zero and total to zero
  for each right index
    if nums at right equals largest then add one to count
    while count is at least k
      if nums at left equals largest then subtract one from count
      move left one step to the right
    add left to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_max_at_least_k(nums, k):
    largest = max(nums)
    left = 0
    count = 0
    total = 0
    for right in range(len(nums)):
        if nums[right] == largest:
            count += 1
        while count >= k:
            if nums[left] == largest:
                count -= 1
            left += 1
        total += left
    return total
`
