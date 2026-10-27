export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 65535)) throw new Error('Values are integers from 0 to 65535.')
  return nums
}

export function buildTrace(nums) {
  // Count every ordered pair (i, j) by the value of nums[i] & nums[j].
  const pairs = new Map()
  const frames = [{ phase: 'start', activeLine: L('pairs = Counter'), pairs: [], value: null, total: 0, message: 'Count the AND of every ordered pair first. A triple is zero when a pair’s AND has no bit in common with the third value.' }]
  for (const a of nums) {
    for (const b of nums) {
      const value = a & b
      pairs.set(value, (pairs.get(value) ?? 0) + 1)
    }
  }
  frames.push({ phase: 'pairs', activeLine: L('pairs[a & b]'), pairs: [...pairs].map(([v, c]) => [v, c]), value: null, total: 0, message: `${pairs.size} distinct pair AND value(s) found.` })
  let total = 0
  for (const c of nums) {
    let added = 0
    for (const [value, count] of pairs) {
      if ((value & c) === 0) added += count
    }
    total += added
    frames.push({ phase: 'match', activeLine: L('if p & c == 0'), pairs: [...pairs].map(([v, n]) => [v, n]), value: c, total, message: `The third value ${c} matches ${added} ordered pair(s) with AND zero; running total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), pairs: [], value: null, total, message: `${total} triple(s) have AND equal to 0.` })
  return { input: nums, result: total, frames }
}

export const code = `def countTriplets(nums):
    pairs = Counter()
    for a in nums:
        for b in nums:
            pairs[a & b] += 1
    total = 0
    for c in nums:
        for p, count in pairs.items():
            if p & c == 0:
                total += count
    return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
