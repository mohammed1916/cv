export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  if (obj.nums.length < 3 || obj.nums.length > 12) throw new Error('Use 3 to 12 values for the visualization.')
  if (obj.nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000000000)) throw new Error('Values are integers with absolute value at most 1000000000.')
  return { nums: obj.nums }
}

export function buildTrace(input) {
  const { nums } = input
  const prefix = [0]
  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x)
  const seen = new Map()
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set prefix[0]'), index: -1, total: 0, key: '', message: 'Prefix sums give the sum of any interior in one subtraction.' }]
  for (let r = 2; r < nums.length; r++) {
    const left = r - 2
    const keyLeft = `${nums[left]}|${prefix[left + 1]}`
    seen.set(keyLeft, (seen.get(keyLeft) || 0) + 1)
    frames.push({ phase: 'record', activeLine: L('record the left end'), index: left, total, key: keyLeft, message: `Record left end ${left}: its value ${nums[left]} and prefix ${prefix[left + 1]}.` })
    const want = `${nums[r]}|${prefix[r] - nums[r]}`
    const found = seen.get(want) || 0
    total += found
    frames.push({ phase: 'match', activeLine: L('add the matches'), index: r, total, key: want, message: `Right end ${r} (${nums[r]}) matches ${found} left end(s). Total: ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, total, key: '', message: `Stable subarrays: ${total}.` })
  return { input, result: total, frames }
}

export const code = `count stable subarrays:
  set prefix[0] to 0 and prefix[i + 1] to prefix[i] + nums[i]
  set seen to an empty map
  set total to 0
  for each right end r from 2 to the last index:
    record the left end r - 2 in seen by (nums[l], prefix[l + 1])
    add the matches for (nums[r], prefix[r] - nums[r]) to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_stable_subarrays(nums):
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)
    seen = {}
    total = 0
    for r in range(2, len(nums)):
        key = (nums[r - 2], prefix[r - 1])
        seen[key] = seen.get(key, 0) + 1
        want = (nums[r], prefix[r] - nums[r])
        total += seen.get(want, 0)
    return total
`
