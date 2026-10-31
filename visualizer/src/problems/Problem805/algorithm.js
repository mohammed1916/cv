export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 24 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 1000)) throw new Error('Enter a JSON array of 1-24 integers in [0, 1000] (visualization caps).')
  return [...nums]
}
export function buildTrace(nums) {
  const n = nums.length, half = Math.floor(n / 2)
  const total = nums.reduce((a, b) => a + b, 0)
  const frames = []
  let sizes = new Array(half + 1).fill(0)
  let ks = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, sizes: [...sizes], ks: [...ks], index: -1, k: -1, target: null, found: null, ...extra })
  push('start', L('let n be'), `Both parts have the same average iff the smaller part (size k at most ${half}) has sum total * k / n. Total = ${total}, n = ${n}.`, { pythonLine: 2 })
  for (let k = 1; k <= half; k++) if ((total * k) % n === 0) ks.push(k)
  push('feasible', L('for each k from 1'), ks.length ? `Only sizes k where total*k is divisible by n can work: k in [${ks.join(', ')}].` : 'No k makes total*k divisible by n, so no split exists.', { pythonLine: 3 })
  let result = false
  if (ks.length) {
    const dp = Array.from({ length: half + 1 }, () => new Set())
    dp[0].add(0)
    sizes = dp.map(s => s.size)
    push('init', L('add 0 to dp[0]'), 'dp[j] is the set of sums reachable by choosing exactly j elements. Start with dp[0] = {0}.', { pythonLine: 8 })
    for (let i = 0; i < n; i++) {
      const x = nums[i]
      for (let j = half; j >= 1; j--) for (const s of [...dp[j - 1]]) dp[j].add(s + x)
      sizes = dp.map(s => s.size)
      push('absorb', L('for each number x'), `Add ${x}: for every size j (descending, so ${x} is used at most once) extend each sum in dp[j-1] by ${x}.`, { index: i, pythonLine: 9 })
    }
    for (const k of ks) {
      const target = (total * k) / n
      const found = dp[k].has(target)
      push('check', L('is in dp[k]'), `k = ${k}: need a subset of size ${k} with sum ${total}*${k}/${n} = ${target}. ${found ? 'It is reachable.' : 'It is not reachable.'}`, { k, target, found, pythonLine: 13 })
      if (found) { result = true; break }
    }
  }
  push('done', L('no size k works'), result ? 'A valid split exists: return true.' : 'No size k reaches its required sum: return false.', { found: result, pythonLine: ks.length ? 13 : 5 })
  return { input: nums, result, frames }
}
export const code = `let n be the length of nums, half be n // 2, and total be the sum of nums
let ks be an empty list
for each k from 1 to half: if total * k is divisible by n, append k to ks
if ks is empty, return false
create dp[j], an empty set of sums, for each size j from 0 to half
add 0 to dp[0]
for each number x in nums
  for each size j from half down to 1
    for each sum s in dp[j - 1], add s + x to dp[j]
for each k in ks
  if total * k / n is in dp[k], return true
no size k works, so return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def split_array_same_average(nums):
    n, total = len(nums), sum(nums)
    ks = [k for k in range(1, n // 2 + 1) if total * k % n == 0]
    if not ks:
        return False
    half = n // 2
    dp = [set() for _ in range(half + 1)]
    dp[0].add(0)
    for x in nums:
        for j in range(half, 0, -1):
            for s in dp[j - 1]:
                dp[j].add(s + x)
    return any(total * k // n in dp[k] for k in ks)
`
