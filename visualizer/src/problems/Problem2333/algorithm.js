export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums1) || !Array.isArray(input.nums2)) throw new Error('Use an object with nums1, nums2, k1 and k2.')
  const { nums1, nums2, k1, k2 } = input
  if (nums1.length < 1 || nums1.length > 10 || nums1.length !== nums2.length) throw new Error('nums1 and nums2 have the same length, from 1 to 10.')
  if (![...nums1, ...nums2].every(x => Number.isInteger(x) && x >= 0 && x <= 20)) throw new Error('Each value is an integer from 0 to 20.')
  if (!Number.isInteger(k1) || !Number.isInteger(k2) || k1 < 0 || k2 < 0 || k1 + k2 > 20) throw new Error('k1 and k2 are integers with k1 + k2 at most 20.')
  return { nums1, nums2, k1, k2 }
}

export function buildTrace({ nums1, nums2, k1, k2 }) {
  const d = nums1.map((a, i) => Math.abs(a - nums2[i]))
  const budget = k1 + k2
  const cost = t => d.reduce((s, x) => s + Math.max(0, x - t), 0)
  const frames = []
  let lo = 0
  let hi = Math.max(...d)
  frames.push({ phase: 'setup', activeLine: CL('const d = nums1'), pythonLine: PL('d = [abs'), diffs: d, capped: null, lo, hi, t: -1, verdict: null, remaining: budget, message: `Differences ${d.join(', ')}; ${budget} operations to spend on them.` })
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const ok = cost(mid) <= budget
    frames.push({ phase: 'search', activeLine: CL('const mid ='), pythonLine: PL('mid = (lo + hi)'), diffs: d, capped: null, lo, hi, t: mid, verdict: ok, remaining: budget, message: `Lowering every difference above ${mid} takes ${cost(mid)} operations, ${ok ? 'within' : 'over'} ${budget}.` })
    if (ok) hi = mid
    else lo = mid + 1
  }
  const t = lo
  let remaining = budget - cost(t)
  const capped = d.map(x => Math.min(x, t))
  frames.push({ phase: 'cap', activeLine: CL('const t = lo'), pythonLine: PL('t = lo'), diffs: d, capped: [...capped], lo, hi: lo, t: -1, verdict: null, remaining, message: `Cap every difference at ${t}. ${remaining} operation${remaining === 1 ? '' : 's'} remain to spend below ${t}.` })
  for (let i = 0; i < capped.length && remaining > 0; i++) {
    if (capped[i] === t && t > 0) {
      capped[i] = t - 1
      remaining--
      frames.push({ phase: 'reduce', activeLine: CL('capped[i] = t - 1'), pythonLine: PL('capped[i] = t - 1'), diffs: d, capped: [...capped], lo: t, hi: t, t: -1, verdict: null, remaining, at: i, message: `Use one operation to lower difference ${i} from ${t} to ${t - 1}. ${remaining} left.` })
    }
  }
  const result = capped.reduce((s, x) => s + x * x, 0)
  frames.push({ phase: 'done', activeLine: CL('return'), pythonLine: PL('return sum'), diffs: d, capped: [...capped], lo: t, hi: t, t: -1, verdict: null, remaining, message: `The minimum sum of squared differences is ${result}.` })
  return { input: { nums1, nums2, k1, k2 }, result, frames }
}

export const code = `function minSumSquaredDiff(nums1, nums2, k1, k2) {
  const d = nums1.map((a, i) => Math.abs(a - nums2[i]));
  const budget = k1 + k2;
  const cost = t => d.reduce((s, x) => s + Math.max(0, x - t), 0);
  let lo = 0;
  let hi = Math.max(...d);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (cost(mid) <= budget) hi = mid;
    else lo = mid + 1;
  }
  const t = lo;
  let remaining = budget - cost(t);
  const capped = d.map(x => Math.min(x, t));
  for (let i = 0; i < capped.length && remaining > 0; i++) {
    if (capped[i] === t && t > 0) {
      capped[i] = t - 1;
      remaining--;
    }
  }
  return capped.reduce((s, x) => s + x * x, 0);
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def min_sum_squared_diff(nums1, nums2, k1, k2):
    d = [abs(a - b) for a, b in zip(nums1, nums2)]
    budget = k1 + k2

    def cost(t):
        return sum(max(0, x - t) for x in d)

    lo, hi = 0, max(d)
    while lo < hi:
        mid = (lo + hi) // 2
        if cost(mid) <= budget:
            hi = mid
        else:
            lo = mid + 1
    t = lo
    remaining = budget - cost(t)
    capped = [min(x, t) for x in d]
    for i in range(len(capped)):
        if remaining <= 0:
            break
        if capped[i] == t and t > 0:
            capped[i] = t - 1
            remaining -= 1
    return sum(x * x for x in capped)
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
