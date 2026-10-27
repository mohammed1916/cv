export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and changeIndices (arrays).')
  const { nums, changeIndices } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 4) throw new Error('nums needs 1 to 4 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 3)) throw new Error('Each nums value is an integer from 0 to 3.')
  if (!Array.isArray(changeIndices) || changeIndices.length < 1 || changeIndices.length > 8) throw new Error('changeIndices needs 1 to 8 entries.')
  if (changeIndices.some(v => !Number.isInteger(v) || v < 1 || v > nums.length)) throw new Error('Each changeIndices entry is a 1-based index into nums.')
  return { nums, changeIndices }
}

export function buildTrace({ nums, changeIndices }) {
  const n = nums.length
  const m = changeIndices.length
  // Mark each index at its last occurrence up to T; every unit of nums[i] must be spent on a free second before that.
  const check = T => {
    const last = new Array(n).fill(0)
    for (let s = 1; s <= T; s++) last[changeIndices[s - 1] - 1] = s
    if (last.some(p => p === 0)) return { ok: false, last }
    const marks = new Set(last)
    const free = [0]
    for (let s = 1; s <= T; s++) free[s] = free[s - 1] + (marks.has(s) ? 0 : 1)
    for (let t = 0; t <= T; t++) {
      let need = 0
      for (let i = 0; i < n; i++) if (last[i] - 1 <= t) need += nums[i]
      if (need > free[t]) return { ok: false, last }
    }
    return { ok: true, last }
  }
  let lo = 1
  let hi = m
  const domain = [lo, hi]
  const zeros = new Array(n).fill(0)
  const frames = [{ phase: 'start', activeLine: L('set low to 1 and high'), lo, hi, mid: null, verdict: null, last: zeros, message: `Search seconds 1 to ${m} for the earliest second that marks every index.` }]
  const whole = check(m)
  if (!whole.ok) {
    frames.push({ phase: 'done', activeLine: L('return minus one'), lo, hi, mid: null, verdict: false, last: whole.last, message: 'Even the last second cannot mark every index. Report -1.' })
    return { input: { nums, changeIndices }, domain, result: -1, frames }
  }
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const result = check(mid)
    frames.push({ phase: 'probe', activeLine: L('if a deadline schedule works by second mid'), lo, hi, mid, verdict: result.ok, last: result.last, message: `Second ${mid}: ${result.ok ? 'the decrements fit before their marks' : 'some index cannot be ready in time'}.` })
    if (result.ok) hi = mid
    else lo = mid + 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: true, last: check(lo).last, message: `Earliest second: ${lo}.` })
  return { input: { nums, changeIndices }, domain, result: lo, frames }
}

export const code = `earliest second by which every index can be marked, or minus one
  set low to 1 and high to the length of changeIndices
  if the full length does not work then
    return minus one
  while low is less than high
    set mid to the middle value, rounded down
    if a deadline schedule works by second mid then
      set high to mid
    else
      set low to mid plus 1
  return low

deadline schedule up to second T
  for each index, find its last second up to T in changeIndices
  fail when some index never appears
  treat each index's last second as a marking second, which is not free
  each unit of nums[i] must use a free second before that marking second
  check that for every second t, the units due by t fit in the free seconds up to t`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def earliest_second_to_mark(nums, changeIndices):
    n = len(nums)
    m = len(changeIndices)

    def feasible(T):
        last = [0] * n
        for s in range(1, T + 1):
            last[changeIndices[s - 1] - 1] = s
        if any(p == 0 for p in last):
            return False
        marks = set(last)
        free = [0] * (T + 1)
        for s in range(1, T + 1):
            free[s] = free[s - 1] + (0 if s in marks else 1)
        for t in range(T + 1):
            need = sum(nums[i] for i in range(n) if last[i] - 1 <= t)
            if need > free[t]:
                return False
        return True

    if not feasible(m):
        return -1
    low, high = 1, m
    while low < high:
        mid = (low + high) // 2
        if feasible(mid):
            high = mid
        else:
            low = mid + 1
    return low
`
