export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Give nums as an array of 1 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 5)) throw new Error('Each value in nums is an integer from 0 to 5.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 10) throw new Error('k is an integer from 1 to 10.')
  return { nums, k: input.k }
}

export function buildTrace({ nums, k }) {
  const freq = new Map()
  const frames = [{ phase: 'start', activeLine: L('set freq'), left: 0, right: -1, pairs: 0, total: 0, message: `Count subarrays with at least ${k} equal index pairs.` }]
  let pairs = 0, left = 0, total = 0
  for (let right = 0; right < nums.length; right++) {
    const v = nums[right]
    pairs += freq.get(v) ?? 0
    freq.set(v, (freq.get(v) ?? 0) + 1)
    frames.push({ phase: 'extend', activeLine: L('add the pairs made'), left, right, pairs, total, message: `Add nums[${right}] = ${v}. Window ${left} to ${right} has ${pairs} equal pairs.` })
    while (left <= right && pairs - ((freq.get(nums[left]) ?? 0) - 1) >= k) {
      const out = nums[left]
      freq.set(out, freq.get(out) - 1)
      pairs -= freq.get(out)
      left++
      frames.push({ phase: 'shrink', activeLine: L('remove left from the window'), left, right, pairs, total, message: `Removing nums[${left - 1}] keeps at least ${k} pairs, so move the left end to ${left}.` })
    }
    if (pairs >= k) {
      total += left + 1
      frames.push({ phase: 'count', activeLine: L('add left plus one'), left, right, pairs, total, message: `Starts 0 to ${left} all work for end ${right}. Total ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), left, right: nums.length - 1, pairs, total, message: `There are ${total} good subarrays.` })
  return { input: { nums, k }, result: total, frames }
}

export const code = `count the number of good subarrays (nums, k)
  set freq to zero for every value
  set pairs, left and total to zero
  for each right index
    add the pairs made by nums at right
    count nums at right in freq
    while removing left keeps pairs at least k
      remove left from the window and move left one step right
    if pairs is at least k then add left plus one to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_good_subarrays(nums, k):
    freq = {}
    pairs = 0
    left = 0
    total = 0
    for right in range(len(nums)):
        pairs += freq.get(nums[right], 0)
        freq[nums[right]] = freq.get(nums[right], 0) + 1
        while left <= right and pairs - (freq[nums[left]] - 1) >= k:
            freq[nums[left]] -= 1
            pairs -= freq[nums[left]]
            left += 1
        if pairs >= k:
            total += left + 1
    return total
`
