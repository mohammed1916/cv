export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 numbers for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Each number must be an integer from 1 to 1000000000.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  const pre = [0]
  for (const v of nums) pre.push(pre[pre.length - 1] + v)
  const frames = []
  let best = null
  frames.push({ phase: 'start', activeLine: L('set best to nothing'), l: -1, r: -1, sum: null, best, message: 'No palindrome has been found yet.' })
  for (let c = 0; c < 2 * n - 1; c++) {
    let l = Math.floor(c / 2)
    let r = l + (c % 2)
    frames.push({ phase: 'center', activeLine: L('for each center'), l, r, sum: null, best, message: `Start at the center with ends ${l} and ${r}.` })
    while (l >= 0 && r < n && nums[l] === nums[r]) {
      const sum = pre[r + 1] - pre[l]
      if (best === null || sum > best) best = sum
      frames.push({ phase: 'match', activeLine: L('record the sum'), l, r, sum, best, message: `nums[${l}..${r}] is a palindrome with sum ${sum}.` })
      l--
      r++
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), l: -1, r: -1, sum: null, best, message: `Largest palindromic subarray sum: ${best}.` })
  return { input, result: best, frames }
}

export const code = `largest palindromic subarray sum of nums
  set best to nothing
  for each center from 0 to 2n-2 do
    set l and r to the two ends of that center
    while l is inside nums and r is inside nums and nums[l] equals nums[r] do
      record the sum of nums from l to r in best
      move l one step left and r one step right
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_palindromic_subarray_sum(nums):
    n = len(nums)
    pre = [0]
    for v in nums:
        pre.append(pre[-1] + v)
    best = None
    for c in range(2 * n - 1):
        l = c // 2
        r = l + c % 2
        while l >= 0 and r < n and nums[l] == nums[r]:
            total = pre[r + 1] - pre[l]
            if best is None or total > best:
                best = total
            l -= 1
            r += 1
    return best
`
