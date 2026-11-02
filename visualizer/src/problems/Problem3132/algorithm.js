export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  const ok = a => Array.isArray(a) && a.every(v => Number.isInteger(v) && v >= -100 && v <= 100)
  if (!ok(nums1) || !ok(nums2) || nums1.length < 3 || nums1.length > 10 || nums2.length !== nums1.length - 2) throw new Error('nums1 has 3 to 10 integers and nums2 has two fewer.')
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  const frames = []
  const target = [...nums2].sort((a, b) => a - b)
  const n = nums1.length
  let best = null
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('target = sorted nums2'), i: null, j: null, x: null, best, message: `Target sorted is [${target.join(', ')}].` })
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const rest = nums1.filter((_, t) => t !== i && t !== j).sort((a, b) => a - b)
      const x = target[0] - rest[0]
      frames.push({ pythonLine: 8, phase: 'try', activeLine: L('x = target\'s smallest minus rest\'s smallest'), i, j, x, best, message: `Remove indices ${i} and ${j}; shift ${x} lines up the smallest values.` })
      if (rest.every((v, t) => v + x === target[t])) {
        if (best === null || x < best) {
          best = x
          frames.push({ pythonLine: 11, phase: 'valid', activeLine: L('keep the smaller'), i, j, x, best, message: `Every value lines up with shift ${x}; best is ${best}.` })
        }
      }
    }
  }
  frames.push({ pythonLine: 12, phase: 'done', activeLine: L('return best'), i: null, j: null, x: null, best, message: `Minimum integer: ${best}.` })
  return { input: { nums1, nums2 }, result: best, frames }
}

export const code = `minimum integer added to nums1 after removing two values
  target = sorted nums2; best = none
  for each pair of indices i less than j in nums1
    rest = sorted values left after removing i and j
    x = target's smallest minus rest's smallest
    if every rest value plus x matches target, keep the smaller x
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_added(nums1, nums2):
    target = sorted(nums2)
    n = len(nums1)
    best = None
    for i in range(n):
        for j in range(i + 1, n):
            rest = sorted(nums1[t] for t in range(n) if t != i and t != j)
            x = target[0] - rest[0]
            if all(rest[t] + x == target[t] for t in range(len(target))):
                if best is None or x < best:
                    best = x
    return best
`
