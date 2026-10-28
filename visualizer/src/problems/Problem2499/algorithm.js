export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with nums1 and nums2.')
  const { nums1, nums2 } = data
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || nums1.length !== nums2.length || nums1.length < 1 || nums1.length > 6) throw new Error('nums1 and nums2 must be equal-length arrays of 1 to 6 entries.')
  if ([...nums1, ...nums2].some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Values are integers from 1 to 9.')
  return { nums1, nums2 }
}

export function buildTrace(input) {
  const { nums1, nums2 } = input
  const n = nums1.length
  const conflicts = []
  for (let i = 0; i < n; i++) if (nums1[i] === nums2[i]) conflicts.push(i)
  const frames = [{ phase: 'start', activeLine: L('collect the indices where'), index: -1, cost: 0, extra: [], message: `${conflicts.length} indices clash (equal values at the same position).` }]
  if (conflicts.length === 0) {
    frames.push({ phase: 'done', activeLine: L('return the total cost'), index: -1, cost: 0, extra: [], message: 'No clashes, so no swaps are needed.' })
    return { input, result: 0, frames }
  }
  const counts = new Map()
  for (const i of conflicts) counts.set(nums1[i], (counts.get(nums1[i]) || 0) + 1)
  let majority = null
  for (const [v, c] of counts) if (majority === null || c > counts.get(majority)) majority = v
  const c = conflicts.length
  let cost = conflicts.reduce((a, b) => a + b, 0)
  const extra = []
  frames.push({ phase: 'cost', activeLine: L('sum of the clashing indices'), index: -1, cost, extra: [], message: `Swapping the clashing indices among themselves costs ${cost}.` })
  let need = 2 * counts.get(majority) - c
  if (need > 0) {
    for (let j = 0; j < n && need > 0; j++) {
      if (nums1[j] !== nums2[j] && nums1[j] !== majority && nums2[j] !== majority) {
        extra.push(j)
        cost += j
        need -= 1
        frames.push({ phase: 'borrow', activeLine: L('borrow the smallest index'), index: j, cost, extra: [...extra], message: `Value ${majority} dominates the clashes, so borrow index ${j} for ${j}. Cost ${cost}.` })
      }
    }
    if (need > 0) {
      frames.push({ phase: 'done', activeLine: L('return minus one'), index: -1, cost, extra: [...extra], message: 'Not enough free indices to break the dominant value, so the answer is -1.' })
      return { input, result: -1, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the total cost'), index: -1, cost, extra: [...extra], message: `Minimum total cost: ${cost}.` })
  return { input, result: cost, frames }
}

export const code = `minimum total cost to make every position differ:
  collect the indices where nums1 and nums2 hold equal values
  if there are none then return zero
  count the clashing values, and find the value that clashes most often
  set cost to the sum of the clashing indices
  set need to twice that count minus the number of clashes
  for each index in increasing order while need is above zero
    if it is not a clash and neither value there is the dominant value then
      borrow the smallest index: add it to cost and subtract one from need
  if need is still above zero then return minus one
  return the total cost`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_unequal_cost(nums1, nums2):
    n = len(nums1)
    conflicts = [i for i in range(n) if nums1[i] == nums2[i]]
    if not conflicts:
        return 0
    counts = {}
    for i in conflicts:
        counts[nums1[i]] = counts.get(nums1[i], 0) + 1
    majority = max(counts, key=lambda v: counts[v])
    cost = sum(conflicts)
    need = 2 * counts[majority] - len(conflicts)
    for j in range(n):
        if need <= 0:
            break
        if nums1[j] != nums2[j] and nums1[j] != majority and nums2[j] != majority:
            cost += j
            need -= 1
    if need > 0:
        return -1
    return cost
`
