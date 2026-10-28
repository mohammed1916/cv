export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use a JSON object with a "nums" array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 30) throw new Error('nums must have 1 to 30 entries for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each value must be an integer from 1 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const freq = new Map()
  for (const v of nums) freq.set(v, (freq.get(v) ?? 0) + 1)
  const values = [...freq.keys()].sort((a, b) => a - b)
  const frames = [{ phase: 'count', activeLine: L('count how many times'), x: null, y: null, result: null, message: `Counted ${values.length} distinct values.` }]
  let result = [-1, -1]
  outer: for (const x of values) {
    frames.push({ phase: 'x', activeLine: L('for each value x'), x, y: null, result: null, message: `Try x = ${x}, which appears ${freq.get(x)} time(s).` })
    for (const y of values) {
      if (y <= x) continue
      const differs = freq.get(y) !== freq.get(x)
      frames.push({ phase: differs ? 'found' : 'check', activeLine: L('if y is larger than x'), x, y, result: null,
        message: `y = ${y} appears ${freq.get(y)} time(s), ${differs ? 'a different count, so the pair is valid' : 'the same count, so keep looking'}.` })
      if (differs) { result = [x, y]; break outer }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return [x, y]'), x: result[0], y: result[1], result, message: `Answer: [${result.join(', ')}].` })
  return { input: { nums }, result, frames }
}

export const code = `smallest pair with different frequencies (nums):
  set freq to an empty table
  count how many times each value appears in nums
  sort the distinct values ascending into values
  for each value x in values
    for each value y in values
      if y is larger than x and freq[y] differs from freq[x] then
        return [x, y]
  return [-1, -1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_pair_different_frequencies(nums):
    freq = {}
    for v in nums:
        freq[v] = freq.get(v, 0) + 1
    values = sorted(freq)
    for x in values:
        for y in values:
            if y > x and freq[y] != freq[x]:
                return [x, y]
    return [-1, -1]
`
