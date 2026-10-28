const sum = values => values.reduce((a, b) => a + b, 0)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join() !== 'nums1,nums2,x') throw new Error('Use a JSON object with keys nums1, nums2 and x.')
  const { nums1, nums2, x } = input
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || nums1.length < 1 || nums1.length > 8 || nums1.length !== nums2.length) throw new Error('nums1 and nums2 must be arrays of the same length, from 1 to 8.')
  if ([...nums1, ...nums2].some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('Array values are integers from 0 to 20.')
  if (!Number.isInteger(x) || x < 0 || x > 200) throw new Error('x must be an integer from 0 to 200.')
  return { nums1, nums2, x }
}

export function buildTrace(input) {
  const { nums1, nums2, x } = input
  const n = nums1.length
  const base = sum(nums1)
  const rate = sum(nums2)
  const order = nums1.map((_, i) => i).sort((p, q) => nums2[p] - nums2[q] || p - q)
  const best = new Array(n + 1).fill(0)
  const frames = [{ phase: 'start', activeLine: L('sort the indexes'), index: -1, time: -1, best: [...best], total: base, message: `Sort the indexes by how fast they grow, slowest first. Without zeroing, the sum at time t is ${base} + t * ${rate}.` }]
  for (const i of order) {
    for (let t = n; t >= 1; t--) best[t] = Math.max(best[t], best[t - 1] + nums1[i] + t * nums2[i])
    frames.push({ phase: 'item', activeLine: L('for t from n down'), index: i, time: -1, best: [...best], total: base, message: `Index ${i} (growth ${nums2[i]}) can be the t-th zeroing. Best reductions updated.` })
  }
  let answer = -1
  for (let t = 0; t <= n; t++) {
    const total = base + t * rate - best[t]
    const ok = total <= x
    frames.push({ phase: 'check', activeLine: L('if the sum at time t'), index: -1, time: t, best: [...best], total, message: `At time ${t} the sum is ${total}, limit ${x}.${ok ? ' That fits.' : ''}` })
    if (ok) {
      answer = t
      break
    }
  }
  frames.push({ phase: 'done', activeLine: L(answer === -1 ? 'return minus one' : 'return time t'), index: -1, time: answer, best: [...best], total: answer, message: answer === -1 ? 'No time reaches the limit.' : `The sum first fits at time ${answer}.` })
  return { input: { nums1, nums2, x }, result: answer, frames }
}

export const code = `Minimum time to make the array sum at most x
sort the indexes by their growth nums2, smallest first
set best[t] to zero for every number of zeroing operations t from zero to n
for each index i in that order
  for t from n down to one
    set best[t] to the larger of best[t] and best[t minus one] plus nums1[i] plus t times nums2[i]
for each time t from zero to n
  if the sum at time t, which is the base sum plus t times the total growth minus best[t], is at most x then return time t
return minus one`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_time(nums1, nums2, x):
    n = len(nums1)
    order = sorted(range(n), key=lambda i: nums2[i])
    base = sum(nums1)
    rate = sum(nums2)
    best = [0] * (n + 1)
    for i in order:
        for t in range(n, 0, -1):
            best[t] = max(best[t], best[t - 1] + nums1[i] + t * nums2[i])
    for t in range(n + 1):
        if base + t * rate - best[t] <= x:
            return t
    return -1
`
