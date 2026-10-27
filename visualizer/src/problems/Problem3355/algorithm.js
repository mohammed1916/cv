export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 5)) {
    throw new Error('nums must be 1 to 8 integers from 0 to 5.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries must be an array of 1 to 6 [l, r] pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || q[0] < 0 || q[1] < q[0] || q[1] >= nums.length) {
      throw new Error('Each query needs 0 <= l <= r < nums.length.')
    }
  }
  return { nums, queries }
}

export const code = `can nums be made all zero when each query lowers positions by at most one
  let n be the length of nums
  make a difference array of zeros with one extra slot
  for each query [l, r] add one at l and take one away after r
  turn the marks into coverage counts by a running sum
  for each position compare its coverage with its value
  if coverage is short at a position then the answer is no
  the answer is yes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums, queries }) {
  const n = nums.length
  const diff = Array(n + 1).fill(0)
  const frames = [{ phase: 'start', activeLine: L('make a difference array'), index: -1, cover: null, message: 'Each query can lower each of its positions by at most one.' }]
  for (const [l, r] of queries) {
    diff[l] += 1
    diff[r + 1] -= 1
    frames.push({ phase: 'mark', activeLine: L('for each query'), index: l, cover: null, message: `Query [${l}, ${r}] can lower positions ${l} through ${r} by one each.` })
  }
  const cover = []
  let running = 0
  let result = true
  for (let i = 0; i < n; i++) {
    running += diff[i]
    cover.push(running)
    const short = running < nums[i]
    frames.push({ phase: short ? 'fail' : 'check', activeLine: short ? L('if coverage is short') : L('for each position compare'), index: i, cover: [...cover], message: `Position ${i}: covered ${running} time(s), value ${nums[i]}.` })
    if (short) { result = false; break }
  }
  if (result) frames.push({ phase: 'done', activeLine: L('the answer is yes'), index: -1, cover, message: 'Every position has enough coverage.' })
  return { input: { nums, queries }, result, frames }
}

export const python = `def zero_array_one(nums, queries):
    n = len(nums)
    diff = [0] * (n + 1)
    for l, r in queries:
        diff[l] += 1
        diff[r + 1] -= 1
    cover = 0
    for i in range(n):
        cover += diff[i]
        if cover < nums[i]:
            return False
    return True
`
