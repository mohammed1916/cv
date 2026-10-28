export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Number.isInteger(obj.k)) throw new Error('Use a JSON object with a "nums" array and an integer "k".')
  const { nums, k } = obj
  if (nums.length < 1 || nums.length > 20) throw new Error('nums must have 1 to 20 entries for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Each value must be an integer from 1 to 1000000000.')
  if (k < 0 || k > 1000000000) throw new Error('k must be an integer from 0 to 1000000000 for this visualization.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), left: -1, right: -1, cost: null, count, message: `Count subarrays whose cost is at most ${k}.` }]
  for (let left = 0; left < n; left++) {
    let low = nums[left]
    let high = nums[left]
    frames.push({ phase: 'left', activeLine: L('set low and high'), left, right: left, cost: null, count, message: `Start subarrays at index ${left}.` })
    for (let right = left; right < n; right++) {
      low = Math.min(low, nums[right])
      high = Math.max(high, nums[right])
      const cost = (high - low) * (right - left + 1)
      const ok = cost <= k
      if (ok) count += 1
      frames.push({ phase: ok ? 'count' : 'skip', activeLine: L(ok ? 'add one to count' : 'if cost is at most k'), left, right, cost, count,
        message: `Subarray [${left}..${right}] has cost ${cost}, ${ok ? 'within' : 'over'} the limit ${k}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), left: -1, right: -1, cost: null, count, message: `Total: ${count}.` })
  return { input: { nums, k }, result: count, frames }
}

export const code = `count subarrays with cost at most k (nums, k):
  set count to 0
  for each left index l in nums
    set low and high to nums[l]
    for each right index r from l onward
      update low and high with nums[r]
      set cost to (high minus low) times (r minus l plus 1)
      if cost is at most k then
        add one to count
  return count

the cost of a subarray is its value spread times its length`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_cheap_subarrays(nums, k):
    count = 0
    for left in range(len(nums)):
        low = high = nums[left]
        for right in range(left, len(nums)):
            low = min(low, nums[right])
            high = max(high, nums[right])
            cost = (high - low) * (right - left + 1)
            if cost <= k:
                count += 1
    return count
`
