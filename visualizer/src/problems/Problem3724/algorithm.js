// Knowledge-derived model: one append costs 1 and copies some value of nums1.
// Sorted matching pairs nums1 with nums2 minus the appended target at cost |a - b|.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || !Array.isArray(input.nums1) || !Array.isArray(input.nums2)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  if (nums1.length < 1 || nums1.length > 8) throw new Error('nums1 has 1 to 8 integers.')
  if (nums2.length !== nums1.length + 1) throw new Error('nums2 must be one longer than nums1.')
  if (![...nums1, ...nums2].every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('Values are integers from -100 to 100.')
  return { nums1, nums2 }
}

function matchCost(sortedA, sortedB) {
  return sortedA.reduce((sum, a, i) => sum + Math.abs(a - sortedB[i]), 0)
}

export function buildTrace({ nums1, nums2 }) {
  const frames = []
  const sortedA = [...nums1].sort((x, y) => x - y)
  const sortedB = [...nums2].sort((x, y) => x - y)
  frames.push({ pythonLine: 2, phase: 'sort', activeLine: L('sort both'), target: -1, cost: null, best: null, message: `Sorted: nums1 = [${sortedA}], nums2 = [${sortedB}].` })
  let best = Infinity
  let bestTarget = -1
  for (let k = 0; k < sortedB.length; k++) {
    const rest = sortedB.filter((_, i) => i !== k)
    const matched = matchCost(sortedA, rest)
    const copyCost = Math.min(...nums1.map(a => Math.abs(a - sortedB[k])))
    const total = 1 + copyCost + matched
    if (total < best) { best = total; bestTarget = k }
    frames.push({ pythonLine: 6, phase: 'candidate', activeLine: L('try each nums2 value'), target: k, cost: total, best, message: `Let nums2 value ${sortedB[k]} be the appended one: matching costs ${matched}, copy costs ${1 + copyCost}, total ${total}.` })
  }
  frames.push({ pythonLine: 8, phase: 'done', activeLine: L('return best'), target: bestTarget, cost: best, best, message: `Minimum operations: ${best}.` })
  return { input: { nums1, nums2 }, result: best, frames }
}

export const code = `minimum operations to turn nums1 into nums2
  sort nums1 and nums2
  best = infinity
  for each value b at position k in sorted nums2
    matched = sorted pairing of nums1 with nums2 without b
    copy = 1 plus the smallest distance from b to any nums1 value
    best = min(best, matched + copy)
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums1, nums2):
    a = sorted(nums1)
    b = sorted(nums2)
    best = float("inf")
    for k in range(len(b)):
        rest = b[:k] + b[k + 1:]
        matched = sum(abs(x - y) for x, y in zip(a, rest))
        copy = 1 + min(abs(x - b[k]) for x in nums1)
        best = min(best, matched + copy)
    return best
`
