export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use an object with keys nums1, nums2 and k.')
  const { nums1, nums2, k } = obj
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || nums1.length !== nums2.length || nums1.length < 1 || nums1.length > 10) throw new Error('nums1 and nums2 are arrays of equal length from 1 to 10.')
  if ([...nums1, ...nums2].some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('Values are integers from 1 to 30.')
  if (!Number.isInteger(k) || k < 1 || k > 5) throw new Error('k is an integer from 1 to 5.')
  return { nums1, nums2, k }
}

export function buildTrace(input) {
  const { nums1, nums2, k } = input
  const diffs = nums1.map((v, i) => v - nums2[i])
  const frames = [{ phase: 'start', activeLine: L('set diffs to'), index: -1, diffs, total: 0, moves: 0, message: `Each position needs its difference closed in steps of ${k}.` }]
  let total = 0
  let moves = 0
  let feasible = true
  for (let i = 0; i < diffs.length && feasible; i++) {
    const d = diffs[i]
    if (d % k !== 0) {
      feasible = false
      frames.push({ phase: 'check', activeLine: L('if diffs[i] is not a multiple'), index: i, diffs, total, moves, message: `Difference ${d} is not a multiple of ${k}, so no sequence works.` })
      break
    }
    const steps = d / k
    total += steps
    if (steps > 0) moves += steps
    frames.push({ phase: 'diff', activeLine: L('add steps to total'), index: i, diffs, total, moves, message: `Position ${i} needs ${steps} step(s) of ${k}. Running total ${total}.` })
  }
  if (feasible && total !== 0) {
    feasible = false
    frames.push({ phase: 'check', activeLine: L('if total is not 0'), index: -1, diffs, total, moves, message: 'The increases and decreases do not cancel, so no sequence works.' })
  }
  const result = feasible ? moves : -1
  frames.push({ phase: 'done', activeLine: L(feasible ? 'return moves' : 'return -1'), index: -1, diffs, total, moves, message: feasible ? `Minimum operations: ${moves}.` : 'Answer: -1.' })
  return { input, diffs, result, frames }
}

export const code = `minimum operations to make nums1 equal nums2
  set diffs to nums1 minus nums2 at each index
  set total to 0 and moves to 0
  for each index i
    if diffs[i] is not a multiple of k then
      return -1
    set steps to diffs[i] divided by k
    add steps to total
    if steps is above 0 then
      add steps to moves
  if total is not 0 then
    return -1
  return moves`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums1, nums2, k):
    total = 0
    moves = 0
    for a, b in zip(nums1, nums2):
        d = a - b
        if d % k != 0:
            return -1
        steps = d // k
        total += steps
        if steps > 0:
            moves += steps
    if total != 0:
        return -1
    return moves
`
