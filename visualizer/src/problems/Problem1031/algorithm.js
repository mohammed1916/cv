export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, first_len, and second_len.')
  const { nums, first_len: firstLen, second_len: secondLen } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('nums must have 2 to 12 integers from 0 to 100.')
  if (!Number.isInteger(firstLen) || !Number.isInteger(secondLen) || firstLen < 1 || secondLen < 1) throw new Error('first_len and second_len must be positive integers.')
  if (firstLen + secondLen > nums.length) throw new Error('first_len plus second_len must fit inside nums.')
  return { nums, first_len: firstLen, second_len: secondLen }
}

// Window sums of a given length, indexed by start position.
const windowSums = (nums, length) => Array.from({ length: nums.length - length + 1 }, (_, s) => nums.slice(s, s + length).reduce((a, b) => a + b, 0))

export function buildTrace(input) {
  const { nums } = input
  const L1 = input.first_len
  const L2 = input.second_len
  const first = windowSums(nums, L1)
  const second = windowSums(nums, L2)
  let best = null
  const frames = [{ phase: 'start', activeLine: L('compute the sum of each window of first_len'), index: -1, span: null, best: null, message: `First window length ${L1}, second window length ${L2}.` }]
  // Sweep the second window; the best first window must end before it starts.
  let bestFirst = null
  for (let s = 0; s < second.length; s++) {
    if (s - L1 >= 0 && (bestFirst === null || first[s - L1] > bestFirst)) bestFirst = first[s - L1]
    if (bestFirst !== null && (best === null || second[s] + bestFirst > best)) best = second[s] + bestFirst
    frames.push({ phase: 'second', activeLine: L('combine it with the second window'), index: s, span: [s, s + L2 - 1], best, message: bestFirst === null ? `Second window at ${s} has no earlier first window yet.` : `Second window at ${s} pairs with the best earlier first window (${bestFirst}). Best: ${best}.` })
  }
  // Sweep the first window; the best second window must end before it starts.
  let bestSecond = null
  for (let s = 0; s < first.length; s++) {
    if (s - L2 >= 0 && (bestSecond === null || second[s - L2] > bestSecond)) bestSecond = second[s - L2]
    if (bestSecond !== null && (best === null || first[s] + bestSecond > best)) best = first[s] + bestSecond
    frames.push({ phase: 'first', activeLine: L('combine it with the first window'), index: s, span: [s, s + L1 - 1], best, message: bestSecond === null ? `First window at ${s} has no earlier second window yet.` : `First window at ${s} pairs with the best earlier second window (${bestSecond}). Best: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, span: null, best, message: `Largest total: ${best}.` })
  return { input, result: best, frames }
}

export const code = `max sum of two non overlapping subarrays (nums, first_len, second_len):
  compute the sum of each window of first_len
  compute the sum of each window of second_len
  set best to nothing
  set best first to nothing
  for each start s of a second window from left to right
    if a first window ends before s then
      update best first with the best of them
    if best first exists then
      combine it with the second window at s and update best
  set best second to nothing
  for each start s of a first window from left to right
    if a second window ends before s then
      update best second with the best of them
    if best second exists then
      combine it with the first window at s and update best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_two_subarrays(nums, first_len, second_len):
    n = len(nums)
    first = [sum(nums[s:s + first_len]) for s in range(n - first_len + 1)]
    second = [sum(nums[s:s + second_len]) for s in range(n - second_len + 1)]
    best = None
    best_first = None
    for s in range(len(second)):
        if s - first_len >= 0 and (best_first is None or first[s - first_len] > best_first):
            best_first = first[s - first_len]
        if best_first is not None and (best is None or second[s] + best_first > best):
            best = second[s] + best_first
    best_second = None
    for s in range(len(first)):
        if s - second_len >= 0 and (best_second is None or second[s - second_len] > best_second):
            best_second = second[s - second_len]
        if best_second is not None and (best is None or first[s] + best_second > best):
            best = first[s] + best_second
    return best
`
