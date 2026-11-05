export const phases = [
  { id: 'start', label: 'Halves', description: 'Split the 2n values into a left half and a right half of n values each.' },
  { id: 'size', label: 'Group by size', description: 'For each count c, the left half supplies c values and the right half supplies n - c values.' },
  { id: 'pair', label: 'Closest partner', description: 'For a left sum a, the right sum closest to total / 2 - a gives the most balanced split.' },
  { id: 'done', label: 'Result', description: 'Return the smallest absolute difference between the two groups.' },
]

export const code = `function minimumDifference(nums) {
  const n = nums.length / 2
  const total = nums.reduce((sum, v) => sum + v, 0)
  const left = nums.slice(0, n)
  const right = nums.slice(n)
  const bySize = arr => {
    const groups = Array.from({ length: arr.length + 1 }, () => [])
    for (let m = 0; m < 1 << arr.length; m++) {
      let size = 0
      let sum = 0
      for (let i = 0; i < arr.length; i++) {
        if (m & (1 << i)) { size++; sum += arr[i] }
      }
      groups[size].push(sum)
    }
    return groups
  }
  const L = bySize(left)
  const R = bySize(right).map(list => list.sort((a, b) => a - b))
  let best = Infinity
  for (let c = 0; c <= n; c++) {
    for (const a of L[c]) {
      const target = total / 2 - a
      const list = R[n - c]
      let lo = 0
      let hi = list.length - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (list[mid] < target) lo = mid + 1
        else hi = mid
      }
      for (const idx of [lo - 1, lo]) {
        if (idx >= 0 && idx < list.length) best = Math.min(best, Math.abs(total - 2 * (a + list[idx])))
      }
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from bisect import bisect_left

def minimum_difference(nums):
    n = len(nums) // 2
    total = sum(nums)
    left = nums[:n]
    right = nums[n:]

    def by_size(arr):
        groups = [[] for _ in range(len(arr) + 1)]
        for m in range(1 << len(arr)):
            size = 0
            sum_ = 0
            for i in range(len(arr)):
                if m & (1 << i):
                    size += 1
                    sum_ += arr[i]
            groups[size].append(sum_)
        return groups

    L = by_size(left)
    R = [sorted(group) for group in by_size(right)]
    best = float('inf')
    for c in range(n + 1):
        for a in L[c]:
            target = total / 2 - a
            values = R[n - c]
            idx = bisect_left(values, target)
            for k in (idx - 1, idx):
                if 0 <= k < len(values):
                    best = min(best, abs(total - 2 * (a + values[k])))
    return best
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of 2n integers such as [3,9,7,3].') }
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 16 || nums.length % 2 !== 0) throw new Error('nums must have an even length from 2 to 16 here.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('Each value must be a whole number between -1000 and 1000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const n = nums.length / 2
  const total = nums.reduce((sum, v) => sum + v, 0)
  const left = nums.slice(0, n), right = nums.slice(n)
  const bySize = arr => {
    const groups = Array.from({ length: arr.length + 1 }, () => [])
    for (let m = 0; m < 1 << arr.length; m++) {
      let size = 0, sum = 0
      for (let i = 0; i < arr.length; i++) if (m & (1 << i)) { size++; sum += arr[i] }
      groups[size].push(sum)
    }
    return groups
  }
  const L = bySize(left)
  const R = bySize(right).map(list => list.sort((a, b) => a - b))
  let best = Infinity
  let bestPair = null
  const add = (phase, c, p, message, c2) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { left, right, total, c: c2, best, bestPair },
  })
  add('start', 'const n = nums.length', 'n = len(nums)', `Left ${JSON.stringify(left)}, right ${JSON.stringify(right)}, total ${total}.`, null)
  for (let c = 0; c <= n; c++) {
    add('size', 'for (let c = 0', 'for c in range', `${c} value(s) from the left and ${n - c} from the right.`, c)
    for (const a of L[c]) {
      const target = total / 2 - a
      const list = R[n - c]
      let lo = 0, hi = list.length - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (list[mid] < target) lo = mid + 1
        else hi = mid
      }
      for (const idx of [lo - 1, lo]) {
        if (idx >= 0 && idx < list.length) {
          const diff = Math.abs(total - 2 * (a + list[idx]))
          if (diff < best) {
            best = diff
            bestPair = [a, list[idx]]
            add('pair', 'best = Math.min', 'best = min', `Left sum ${a} with right sum ${list[idx]} gives difference ${diff}.`, c)
          }
        }
      }
    }
  }
  add('done', 'return best', 'return best', `Minimum difference: ${best}.`, null)
  return { input: nums, result: best, frames }
}
