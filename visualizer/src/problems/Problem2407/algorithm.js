import { SegTree } from '../../components/shared/segtreeModel.js'

const SPAN = 32

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= SPAN)) throw new Error(`Each value is an integer from 1 to ${SPAN}.`)
  if (!Number.isInteger(k) || k < 1 || k > 5) throw new Error('k is an integer from 1 to 5.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  // Leaf v - 1 holds the longest increasing run that ends at value v so far.
  const seg = new SegTree(SPAN, 'max-assign')
  let best = 0
  const frames = [{ phase: 'start', index: null, x: null, cur: null, best, seg: { ...seg.snapshot(), title: 'Longest run ending at each value' }, activeLine: L('set best to 0'), message: 'No values seen yet.' }]
  nums.forEach((x, i) => {
    const lo = Math.max(1, x - k), hi = x - 1
    const prior = hi >= lo ? seg.query(lo - 1, hi - 1) : 0
    const cur = prior + 1
    const stored = seg.query(x - 1, x - 1)
    if (cur > stored) seg.update(x - 1, x - 1, cur)
    best = Math.max(best, cur)
    frames.push({ phase: 'element', index: i, x, cur, best, range: [lo, hi], seg: { ...seg.snapshot(), title: `After value ${x}` }, activeLine: L('find the best length ending'), message: hi >= lo ? `${x} follows a run of ${prior} ending in ${lo} to ${hi}, so its run is ${cur}.` : `${x} starts a run of 1 because no value in range can precede it.` })
  })
  frames.push({ phase: 'done', index: null, x: null, cur: null, best, seg: { ...seg.snapshot(), title: 'Final tree' }, activeLine: L('return best'), message: `Longest subsequence: ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const code = `longest increasing subsequence where neighbours differ by at most k
  set best to 0
  for each value x in nums
    find the best length ending at a value in [x - k, x - 1] using the segment tree
    set cur to that length plus 1
    if cur is larger than the stored length for x then store cur at x in the tree
    set best to the larger of best and cur
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def length_of_lis(nums, k):
    size = max(nums) + 1
    tree = [0] * (2 * size)

    def update(i, v):
        i += size
        if tree[i] >= v:
            return
        tree[i] = v
        i //= 2
        while i:
            tree[i] = max(tree[2 * i], tree[2 * i + 1])
            i //= 2

    def query(lo, hi):
        res = 0
        lo += size
        hi += size + 1
        while lo < hi:
            if lo & 1:
                res = max(res, tree[lo])
                lo += 1
            if hi & 1:
                hi -= 1
                res = max(res, tree[hi])
            lo //= 2
            hi //= 2
        return res

    best = 0
    for x in nums:
        lo = max(0, x - k)
        prior = query(lo, x - 1) if x - 1 >= lo else 0
        cur = prior + 1
        update(x, cur)
        best = max(best, cur)
    return best
`
