export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8 || !nums.every(v => Number.isInteger(v) && v >= 0 && v <= 20)) {
    throw new Error('nums has 1 to 8 integers from 0 to 20.')
  }
  if (!Number.isInteger(k) || k < 2 || k > 6) throw new Error('k is an integer from 2 to 6 (two different residues must exist).')
  return { nums, k }
}

// One operation moves a value by one. The cheapest way to put x on residue r is the shorter way around
// the cycle of length k: min(d, k - d) with d = (r - x) mod k.
export function costTo(x, r, k) {
  const d = ((r - x) % k + k) % k
  return Math.min(d, k - d)
}

export function buildTrace({ nums, k }) {
  const frames = []
  const even = Array(k).fill(0)
  const odd = Array(k).fill(0)
  const snap = extra => ({ even: even.slice(), odd: odd.slice(), a: -1, b: -1, best: null, bestPair: null, ...extra })
  frames.push(snap({ pythonLine: PY('def cost(x, r):'), phase: 'start', activeLine: L('for each residue r from 0'), residue: -1, message: `Costs for residues 0 to ${k - 1}; even and odd positions are priced separately.` }))
  for (let r = 0; r < k; r += 1) {
    for (let i = 0; i < nums.length; i += 2) even[r] += costTo(nums[i], r, k)
    frames.push(snap({ pythonLine: PY('even = [sum'), phase: 'even', activeLine: L('even[r] = total cost'), residue: r, message: `Even positions to residue ${r}: cost ${even[r]}.` }))
  }
  for (let r = 0; r < k; r += 1) {
    for (let i = 1; i < nums.length; i += 2) odd[r] += costTo(nums[i], r, k)
    frames.push(snap({ pythonLine: PY('odd = [sum'), phase: 'odd', activeLine: L('odd[r] = total cost'), residue: r, message: `Odd positions to residue ${r}: cost ${odd[r]}.` }))
  }
  let best = null
  let bestPair = null
  for (let a = 0; a < k; a += 1) {
    for (let b = 0; b < k; b += 1) {
      if (a === b) continue
      const candidate = even[a] + odd[b]
      if (best === null || candidate < best) {
        best = candidate
        bestPair = [a, b]
      }
      frames.push(snap({ pythonLine: PY('for a in range(k)'), phase: 'pair', activeLine: L('candidate = even[a] + odd[b]'), a, b, best, bestPair: bestPair && bestPair.slice(), message: `Evens on ${a}, odds on ${b}: ${candidate} operations; best is ${best}.` }))
    }
  }
  frames.push(snap({ pythonLine: PY('return min('), phase: 'done', activeLine: L('return best'), a: bestPair[0], b: bestPair[1], best, bestPair: bestPair.slice(), message: `Minimum operations: ${best} (evens on ${bestPair[0]}, odds on ${bestPair[1]}).` }))
  return { input: { nums, k }, result: best, frames }
}

export const code = `minimum operations so that even indices share one residue and odd indices another residue
  for each residue r from 0 to k minus 1
    even[r] = total cost of moving every even-index value to residue r
    odd[r] = total cost of moving every odd-index value to residue r
  best = nothing yet
  for each residue a for the evens and each residue b for the odds with a not equal to b
    candidate = even[a] + odd[b]
    keep the smaller candidate in best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def min_ops(nums, k):
    def cost(x, r):
        d = (r - x) % k
        return min(d, k - d)
    even = [sum(cost(nums[i], r) for i in range(0, len(nums), 2)) for r in range(k)]
    odd = [sum(cost(nums[i], r) for i in range(1, len(nums), 2)) for r in range(k)]
    return min(even[a] + odd[b] for a in range(k) for b in range(k) if a != b)
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
