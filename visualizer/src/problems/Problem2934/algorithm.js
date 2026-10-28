export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.nums1) || !Array.isArray(obj.nums2)) throw new Error('Use an object with array keys nums1 and nums2.')
  const { nums1, nums2 } = obj
  if (nums1.length !== nums2.length || nums1.length < 1 || nums1.length > 8) throw new Error('nums1 and nums2 have equal length from 1 to 8.')
  if ([...nums1, ...nums2].some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Values are integers from 1 to 9.')
  return { nums1, nums2 }
}

export function buildTrace(input) {
  const { nums1, nums2 } = input
  const n = nums1.length
  let answer = null
  const frames = [{ phase: 'start', activeLine: L('set answer to nothing'), index: -1, choice: null, cost: null, answer, message: 'Try both choices for the last index: swap it or keep it.' }]
  for (let flag = 0; flag <= 1; flag++) {
    const last1 = flag ? nums2[n - 1] : nums1[n - 1]
    const last2 = flag ? nums1[n - 1] : nums2[n - 1]
    let cost = flag
    let ok = true
    for (let i = 0; i < n - 1; i++) {
      const keep = nums1[i] <= last1 && nums2[i] <= last2
      const swap = nums2[i] <= last1 && nums1[i] <= last2
      if (keep) continue
      if (swap) cost += 1
      else { ok = false; break }
    }
    if (ok && (answer === null || cost < answer)) answer = cost
    frames.push({ phase: 'choice', activeLine: L('for each choice of swapping'), index: -1, choice: flag ? 'swap last' : 'keep last', cost: ok ? cost : null, answer, message: ok ? `Swapping the last pair ${flag ? 'is' : 'is not'} used: total cost ${cost}.` : `Swapping the last pair ${flag ? 'is' : 'is not'} used, but some index has no valid choice.` })
  }
  const result = answer === null ? -1 : answer
  frames.push({ phase: 'done', activeLine: L('return -1 if answer'), index: -1, choice: null, cost: null, answer: result, message: `Minimum operations: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum swaps to make the last values the maxima
  set answer to nothing
  for each choice of swapping the last pair or not
    set cost to 1 if swapped, otherwise 0
    set ok to true
    for each index i before the last
      if keeping the pair fits at i then
        leave the cost as it is
      else if swapping the pair fits at i then
        add 1 to cost
      else
        set ok to false
    if ok and (answer is unset or cost is below answer) then
      set answer to cost
  return -1 if answer is unset, otherwise answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations_to_maximize_last(nums1, nums2):
    n = len(nums1)
    best = None
    for flag in (0, 1):
        last1 = nums2[-1] if flag else nums1[-1]
        last2 = nums1[-1] if flag else nums2[-1]
        cost = flag
        ok = True
        for i in range(n - 1):
            keep = nums1[i] <= last1 and nums2[i] <= last2
            swap = nums2[i] <= last1 and nums1[i] <= last2
            if keep:
                continue
            if swap:
                cost += 1
            else:
                ok = False
                break
        if ok and (best is None or cost < best):
            best = cost
    return -1 if best is None else best
`
