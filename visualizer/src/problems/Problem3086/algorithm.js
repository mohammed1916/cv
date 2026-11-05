export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, k and maxChanges.')
  const { nums, k, maxChanges } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 16 || !nums.every(v => v === 0 || v === 1)) throw new Error('nums is 2 to 16 values, each 0 or 1.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  if (!Number.isInteger(maxChanges) || maxChanges < 0 || maxChanges > nums.length) throw new Error('maxChanges is an integer from 0 to the length of nums.')
  if (maxChanges + nums.reduce((a, b) => a + b, 0) < k) throw new Error('maxChanges plus the number of ones must be at least k.')
  return { nums, k, maxChanges }
}

// For a standing index a, an existing one at distance d costs d moves, and a new one
// created at an empty cell at distance d costs d + 1 (one creation move, then d moves).
export function buildTrace({ nums, k, maxChanges }) {
  const frames = []
  let best = Infinity
  let bestAt = -1
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('let best = Infinity'), at: -1, cost: null, best, message: 'Try every index as the start.' })
  for (let a = 0; a < nums.length; a++) {
    const own = nums[a] === 1 ? 1 : 0
    const need = Math.max(0, k - own)
    const ones = []
    const empties = []
    for (let j = 0; j < nums.length; j++) {
      if (j === a) continue
      const d = Math.abs(j - a)
      if (nums[j] === 1) ones.push(d)
      else empties.push(d + 1)
    }
    const candidates = [...ones, ...empties.sort((x, y) => x - y).slice(0, maxChanges)].sort((x, y) => x - y)
    let cost = Infinity
    if (candidates.length >= need) cost = candidates.slice(0, need).reduce((s, v) => s + v, 0)
    if (cost < best) { best = cost; bestAt = a }
    frames.push({ pythonLine: 9, phase: 'try', activeLine: L('const candidates'), at: a, cost, best, message: cost === Infinity ? `Index ${a} cannot gather ${k} ones.` : `Index ${a} costs ${cost} moves.` })
  }
  frames.push({ pythonLine: 12, phase: 'done', activeLine: L('return best'), at: bestAt, cost: best, best, message: `Minimum moves: ${best}.` })
  return { input: { nums, k, maxChanges }, result: best, frames }
}

export const code = `function minMoves(nums, k, maxChanges) {
  let best = Infinity
  const n = nums.length
  for (let a = 0; a < n; a++) {
    const own = nums[a] === 1 ? 1 : 0
    const need = Math.max(0, k - own)
    const ones = []
    const empties = []
    for (let j = 0; j < n; j++) {
      if (j === a) continue
      const d = Math.abs(j - a)
      if (nums[j] === 1) ones.push(d)
      else empties.push(d + 1)
    }
    empties.sort((x, y) => x - y)
    const candidates = [...ones, ...empties.slice(0, maxChanges)].sort((x, y) => x - y)
    if (candidates.length >= need) best = Math.min(best, candidates.slice(0, need).reduce((s, v) => s + v, 0))
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_moves(nums, k, max_changes):
    best = float("inf")
    n = len(nums)
    for a in range(n):
        own = 1 if nums[a] == 1 else 0
        need = max(0, k - own)
        ones = [abs(j - a) for j in range(n) if j != a and nums[j] == 1]
        empties = sorted(abs(j - a) + 1 for j in range(n) if j != a and nums[j] == 0)
        candidates = sorted(ones + empties[:max_changes])
        if len(candidates) >= need:
            best = min(best, sum(candidates[:need]))
    return best
`
