export const phases = [
  { id: 'start', label: 'Start balance', description: 'The empty prefix has balance 0 at boundary 0.' },
  { id: 'extend', label: 'Extend prefix', description: 'Add nums1 minus nums2 at this index to the running balance.' },
  { id: 'match', label: 'Repeated balance', description: 'A balance seen before means the segment between the two boundaries has equal sums.' },
  { id: 'done', label: 'Result', description: 'Return the widest equal segment length.' },
]

export const code = `function widestPairOfIndices(nums1, nums2) {
  const firstSeen = new Map([[0, 0]])
  let balance = 0
  let widest = 0
  for (let k = 1; k <= nums1.length; k++) {
    balance += nums1[k - 1] - nums2[k - 1]
    if (firstSeen.has(balance)) {
      widest = Math.max(widest, k - firstSeen.get(balance))
    } else {
      firstSeen.set(balance, k)
    }
  }
  return widest
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def widest_pair_of_indices(nums1, nums2):
    first_seen = {0: 0}
    balance = 0
    widest = 0
    for k in range(1, len(nums1) + 1):
        balance += nums1[k - 1] - nums2[k - 1]
        if balance in first_seen:
            widest = max(widest, k - first_seen[balance])
        else:
            first_seen[balance] = k
    return widest
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"nums1":[1,1,0],"nums2":[0,1,1]}.') }
  const { nums1, nums2 } = obj || {}
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || nums1.length < 1 || nums1.length > 50 || nums1.length !== nums2.length) {
    throw new Error('nums1 and nums2 must be arrays of the same length, from 1 to 50 here.')
  }
  if (![...nums1, ...nums2].every(v => v === 0 || v === 1)) throw new Error('Both arrays must contain only 0 and 1.')
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  const frames = []
  const firstSeen = new Map([[0, 0]])
  let balance = 0
  let widest = 0
  let best = null
  const add = (phase, c, p, message, k, first, rMatch) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { diff: diffs(k), k, balance, first, r: rMatch, widest, best },
  })
  const diffs = k => { const out = [0]; let b = 0; for (let i = 0; i < k; i++) { b += nums1[i] - nums2[i]; out.push(b) } return out }
  add('start', 'const firstSeen', 'first_seen = {0: 0}', 'Boundary 0 is before any index, so its balance 0 is recorded first.', 0, 0, null)
  for (let k = 1; k <= nums1.length; k++) {
    balance += nums1[k - 1] - nums2[k - 1]
    add('extend', 'balance +=', 'balance +=', `Index ${k - 1}: running balance is ${balance}.`, k, null, null)
    if (firstSeen.has(balance)) {
      const first = firstSeen.get(balance)
      widest = Math.max(widest, k - first)
      best = [first, k - 1]
      add('match', 'widest = Math.max', 'widest = max', `Balance ${balance} was first seen at boundary ${first}; the segment from index ${first} to ${k - 1} has equal sums, width ${k - first}.`, k, first, k)
    } else {
      firstSeen.set(balance, k)
    }
  }
  add('done', 'return widest', 'return widest', widest ? `The widest equal segment has width ${widest}.` : 'No nonempty segment has equal sums, so the answer is 0.', nums1.length, null, null)
  return { input: { nums1, nums2 }, result: widest, frames }
}
