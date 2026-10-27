export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || !Array.isArray(v.nums) || !Number.isInteger(v.k)) throw new Error('Enter {"nums": [1,3,6], "k": 3}.')
  const { nums, k } = v
  if (!nums.length || nums.length > 100 || nums.some(x => !Number.isInteger(x) || x < 0 || x > 10000)) throw new Error('nums must hold 1-100 integers between 0 and 10,000 (capped at 100 for visualization).')
  if (k < 0 || k > 10000) throw new Error('k must be between 0 and 10,000.')
  return { nums: [...nums], k }
}
export function buildTrace({ nums, k }) {
  const a = [...nums].sort((x, y) => x - y)
  const n = a.length
  let ans = a[n - 1] - a[0]
  const frames = [{ phase: 'start', activeLine: L('Sort nums into a'), split: -1, ans, message: `Sorted: [${a.join(', ')}]. Adding nothing to everything gives range ${ans}. In an optimal answer, small values get +${k} and large values get -${k}, so only prefix/suffix splits matter.` }]
  for (let i = 0; i < n - 1; i++) {
    const high = Math.max(a[n - 1] - k, a[i] + k)
    const low = Math.min(a[0] + k, a[i + 1] - k)
    const range = high - low
    const better = range < ans
    if (better) ans = range
    frames.push({ phase: better ? 'improve' : 'split', activeLine: L('set ans to the smaller of ans'), split: i, high, low, range, ans,
      message: `Split after index ${i}: indices 0..${i} get +${k}, the rest get -${k}. Max = max(${a[n - 1]}-${k}, ${a[i]}+${k}) = ${high}; min = min(${a[0]}+${k}, ${a[i + 1]}-${k}) = ${low}. Range ${range}${better ? ', a new best.' : `, not better than ${ans}.`}` })
  }
  frames.push({ phase: 'done', activeLine: L('return ans'), split: -1, ans, message: `Smallest possible range: ${ans}.` })
  return { input: { nums, k }, sorted: a, result: ans, frames }
}
export const code = `Sort nums into a, let n be its length, and set ans to the largest value minus the smallest value
for each split index i from 0 to n - 2
  let high be the larger of a[n - 1] - k and a[i] + k
  let low be the smaller of a[0] + k and a[i + 1] - k
  set ans to the smaller of ans and high - low
return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_range_ii(nums, k):
    a = sorted(nums)
    n = len(a)
    ans = a[-1] - a[0]
    for i in range(n - 1):
        high = max(a[-1] - k, a[i] + k)
        low = min(a[0] + k, a[i + 1] - k)
        ans = min(ans, high - low)
    return ans`
