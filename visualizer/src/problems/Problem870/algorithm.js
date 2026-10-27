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
  f('start', L('sort nums1 in ascending'), 'Sort nums1 ascending. Also sort nums2\'s indices by value so we know the weakest and strongest opponents.')
  f('sort', L('sort the indices of nums2'), `Opponent order (indices of nums2, ascending): [${order.join(', ')}] = values [${order.map(i => nums2[i]).join(', ')}].`)
  a.forEach((x, i) => {
    const weakest = nums2[order[lo]]
    const win = x > weakest
    f('compare', L('let weakest be'), `Card ${x} vs weakest remaining opponent ${weakest} (nums2[${order[lo]}]).`, { i, target: order[lo] })
    if (win) {
      res[order[lo]] = x; lo++
      f('win', L('assign x to position order[lo]'), `${x} beats ${weakest}: assign it to position ${order[lo - 1]} and advance to the next weakest.`, { i, target: order[lo - 1] })
    } else {
      const t = order[hi], v = nums2[t]
      res[t] = x; hi--
      f('sacrifice', L('assign x to position order[hi]'), `${x} cannot beat even the weakest (${weakest}), so it is useless; waste it on the strongest remaining opponent ${v} at position ${t}.`, { i, target: t })
    }
  })
  f('done', L('return res'), `Result: [${res.join(', ')}].`)
  return { input: { nums1, nums2 }, sorted: a, order, result: res, frames }
}

export const code = `sort nums1 in ascending order, giving a
sort the indices of nums2 by value, smallest first, giving order
let res be a list with one empty slot per position of nums2
let lo = 0 and hi = the last index
for each card x in a, from smallest to largest, do
  let weakest be the value of nums2 at order[lo]
  if x is greater than weakest, then
    assign x to position order[lo] in res, and increase lo by 1
  otherwise
    assign x to position order[hi] in res, and decrease hi by 1
return res`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def advantage_count(nums1, nums2):
    a = sorted(nums1)
    order = sorted(range(len(nums2)), key=lambda i: (nums2[i], i))
    res = [0] * len(nums1)
    lo, hi = 0, len(nums1) - 1
    for x in a:
        if x > nums2[order[lo]]:
            res[order[lo]] = x
            lo += 1
        else:
            res[order[hi]] = x
            hi -= 1
    return res
`
