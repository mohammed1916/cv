// LeetCode 2179: Count Good Triplets in an Array.
// A good triplet is three values x, y, z whose positions increase in both arrays. Fix the middle value y:
// the number of valid x is the count of values before y in both arrays, and the number of valid z is the count
// after y in both arrays. Multiply the two counts and add over all y.

const MAX_LEN = 8

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"nums1":[0,1,2,3],"nums2":[0,2,1,3]}.') }
  if (!spec || !Array.isArray(spec.nums1) || !Array.isArray(spec.nums2)) throw new Error('Give nums1 and nums2 arrays.')
  const n = spec.nums1.length
  if (n < 3 || n > MAX_LEN || spec.nums2.length !== n) throw new Error(`Use two arrays of the same length, from 3 to ${MAX_LEN}.`)
  const isPerm = arr => [...arr].sort((a, b) => a - b).every((v, i) => v === i)
  if (!isPerm(spec.nums1) || !isPerm(spec.nums2)) throw new Error(`Each array must be a permutation of 0 to ${n - 1}.`)
  return { nums1: spec.nums1, nums2: spec.nums2 }
}

export const code = `FUNCTION goodTriplets(nums1, nums2)
    n ← length of nums1
    pos1 ← position of each value in nums1
    pos2 ← position of each value in nums2
    total ← 0
    FOR each value y from 0 to n - 1
        left ← 0
        right ← 0
        FOR each value x from 0 to n - 1
            IF pos1[x] < pos1[y] AND pos2[x] < pos2[y] THEN left ← left + 1
            IF pos1[x] > pos1[y] AND pos2[x] > pos2[y] THEN right ← right + 1
        total ← total + left * right
    RETURN total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def good_triplets(nums1, nums2):
    n = len(nums1)
    pos1 = [0] * n
    pos2 = [0] * n
    for i, v in enumerate(nums1):
        pos1[v] = i
    for i, v in enumerate(nums2):
        pos2[v] = i
    total = 0
    for y in range(n):
        left = 0
        right = 0
        for x in range(n):
            if pos1[x] < pos1[y] and pos2[x] < pos2[y]:
                left += 1
            if pos1[x] > pos1[y] and pos2[x] > pos2[y]:
                right += 1
        total += left * right
    return total
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Positions', description: 'Record where each value sits in both arrays.' },
  { id: 'middle', label: 'Middle value', description: 'Fix y and count the values that fit on its left and on its right.' },
  { id: 'done', label: 'Result', description: 'The total number of good triplets.' },
]

export function buildTrace({ nums1, nums2 }) {
  const n = nums1.length
  const pos1 = Array(n).fill(0)
  const pos2 = Array(n).fill(0)
  nums1.forEach((v, i) => { pos1[v] = i })
  nums2.forEach((v, i) => { pos2[v] = i })
  let total = 0
  const frames = []
  const push = (phase, y, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, y, index: y, activeLine, pythonLine, message, nums1, nums2, pos1: pos1.slice(), pos2: pos2.slice(), total, ...extra,
  })
  push('start', -1, L('pos1 ← position'), P('pos1 = [0]'), `Positions recorded for ${n} values in both arrays.`)
  for (let y = 0; y < n; y++) {
    const leftSet = []
    const rightSet = []
    for (let x = 0; x < n; x++) {
      if (pos1[x] < pos1[y] && pos2[x] < pos2[y]) leftSet.push(x)
      if (pos1[x] > pos1[y] && pos2[x] > pos2[y]) rightSet.push(x)
    }
    const add = leftSet.length * rightSet.length
    total += add
    push('middle', y, L('total ← total + left'), P('total += left * right'),
      `Middle value ${y}: ${leftSet.length} values fit before it (${leftSet.join(', ') || 'none'}) and ${rightSet.length} after it (${rightSet.join(', ') || 'none'}). That adds ${add}. Total ${total}.`,
      { leftSet, rightSet, add })
  }
  push('done', -1, L('RETURN total'), P('return total'), `There are ${total} good triplets.`)
  return { input: { nums1, nums2 }, result: total, frames }
}
