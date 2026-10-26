export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Enter {"nums1": [...], "nums2": [...]}.')
  const { nums1, nums2 } = v
  const ok = a => Array.isArray(a) && a.every(x => Number.isInteger(x) && x >= 0 && x <= 1000000000)
  if (!ok(nums1) || !ok(nums2) || nums1.length !== nums2.length) throw new Error('nums1 and nums2 must be equal-length arrays of integers from 0 to 1,000,000,000.')
  if (nums1.length < 1 || nums1.length > 30) throw new Error('Use 1 to 30 elements (visualization cap).')
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  const n = nums1.length
  const a = [...nums1].sort((x, y) => x - y)
  const order = [...Array(n).keys()].sort((i, j) => nums2[i] - nums2[j] || i - j)
  const res = new Array(n).fill(null)
  let lo = 0, hi = n - 1
  const frames = []
  const f = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, i: -1, lo, hi, res: res.slice(), target: null, ...extra })
  f('start', 2, 'Sort nums1 ascending. Also sort nums2\'s indices by value so we know the weakest and strongest opponents.')
  f('sort', 3, `Opponent order (indices of nums2, ascending): [${order.join(', ')}] = values [${order.map(i => nums2[i]).join(', ')}].`)
  a.forEach((x, i) => {
    const weakest = nums2[order[lo]]
    const win = x > weakest
    f('compare', 7, `Card ${x} vs weakest remaining opponent ${weakest} (nums2[${order[lo]}]).`, { i, target: order[lo] })
    if (win) {
      res[order[lo]] = x; lo++
      f('win', 8, `${x} beats ${weakest}: assign it to position ${order[lo - 1]} and advance to the next weakest.`, { i, target: order[lo - 1] })
    } else {
      const t = order[hi], v = nums2[t]
      res[t] = x; hi--
      f('sacrifice', 11, `${x} cannot beat even the weakest (${weakest}), so it is useless; waste it on the strongest remaining opponent ${v} at position ${t}.`, { i, target: t })
    }
  })
  f('done', 13, `Result: [${res.join(', ')}].`)
  return { input: { nums1, nums2 }, sorted: a, order, result: res, frames }
}

export const code = `def advantageCount(nums1, nums2):
    a = sorted(nums1)
    order = sorted(range(len(nums2)), key=lambda i: nums2[i])
    res = [0] * len(nums1)
    lo, hi = 0, len(nums1) - 1
    for x in a:
        if x > nums2[order[lo]]:
            res[order[lo]] = x
            lo += 1
        else:
            res[order[hi]] = x
            hi -= 1
    return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
