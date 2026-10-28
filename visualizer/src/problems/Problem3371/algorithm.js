export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || data.nums.length < 3 || data.nums.length > 30) throw new Error('Use an array nums of 3 to 30 integers.')
  if (data.nums.some(v => !Number.isInteger(v) || v < -1000 || v > 1000)) throw new Error('Values are integers from -1000 to 1000.')
  if (buildTrace({ nums: data.nums }).result === null) throw new Error('No value in nums can be an outlier: no split into special numbers and their sum fits.')
  return { nums: data.nums }
}

export function buildTrace({ nums }) {
  const total = nums.reduce((sum, x) => sum + x, 0)
  const counts = new Map()
  for (const x of nums) counts.set(x, (counts.get(x) || 0) + 1)
  const sorted = () => [...counts].sort((a, b) => a[0] - b[0])
  const frames = [{ phase: 'start', activeLine: L('find the total sum'), key: null, best: null, total, counts: sorted(), message: `The total of nums is ${total}.` }]
  let best = null
  for (const x of [...counts.keys()].sort((a, b) => a - b)) {
    const rest = total - x
    if (rest % 2 !== 0) {
      frames.push({ phase: 'candidate', activeLine: L('if the rest after removing x is odd'), key: x, best, total, counts: sorted(), message: `Outlier ${x} is skipped: the other values sum to ${rest}, which is odd.` })
      continue
    }
    const s = rest / 2
    const left = (counts.get(s) || 0) - (s === x ? 1 : 0)
    const ok = left >= 1
    if (ok && (best === null || x > best)) best = x
    frames.push({ phase: 'candidate', activeLine: L('if s appears in the rest'), key: x, s, best, total, counts: sorted(), message: ok ? `Outlier ${x}: the sum value would be ${s}, which is present, so ${x} is possible.` : `Outlier ${x}: the sum value would be ${s}, which is not present.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), key: null, best, total, counts: sorted(), result: best, message: best === null ? 'No outlier is possible.' : `The largest possible outlier is ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `largest outlier that could exist in nums
  find the total sum of nums
  count how many times each value appears
  set best to nothing
  for each distinct value x as a candidate outlier
    if the rest after removing x is odd then skip x
    set s to half of the rest
    if s appears in the rest then
      set best to the larger of best and x
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_outlier(nums):
    total = sum(nums)
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    best = None
    for x in counts:
        rest = total - x
        if rest % 2 != 0:
            continue
        s = rest // 2
        left = counts.get(s, 0) - (1 if s == x else 0)
        if left >= 1 and (best is None or x > best):
            best = x
    return best
`
