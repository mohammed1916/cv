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

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function maxTwoSubarrays(nums, firstLen, secondLen) {', 'def max_two_subarrays(nums, first_len, second_len):'],
  ['  const first = windowSums(nums, firstLen)', '    first = [sum(nums[s:s + first_len]) for s in range(len(nums) - first_len + 1)]'],
  ['  const second = windowSums(nums, secondLen)', '    second = [sum(nums[s:s + second_len]) for s in range(len(nums) - second_len + 1)]'],
  ['  let best = null', '    best = None'],
  ['  let bestFirst = null', '    best_first = None'],
  ['  for (let s = 0; s < second.length; s++) {', '    for s in range(len(second)):'],
  ['    if (s - firstLen >= 0 && (bestFirst === null || first[s - firstLen] > bestFirst)) bestFirst = first[s - firstLen]', '        if s - first_len >= 0 and (best_first is None or first[s - first_len] > best_first): best_first = first[s - first_len]'],
  ['    if (bestFirst !== null && (best === null || second[s] + bestFirst > best)) best = second[s] + bestFirst', '        if best_first is not None and (best is None or second[s] + best_first > best): best = second[s] + best_first'],
  ['  }', ''],
  ['  let bestSecond = null', '    best_second = None'],
  ['  for (let s = 0; s < first.length; s++) {', '    for s in range(len(first)):'],
  ['    if (s - secondLen >= 0 && (bestSecond === null || second[s - secondLen] > bestSecond)) bestSecond = second[s - secondLen]', '        if s - second_len >= 0 and (best_second is None or second[s - second_len] > best_second): best_second = second[s - second_len]'],
  ['    if (bestSecond !== null && (best === null || first[s] + bestSecond > best)) best = first[s] + bestSecond', '        if best_second is not None and (best is None or first[s] + best_second > best): best = first[s] + best_second'],
  ['  }', ''],
  ['  return best', '    return best'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { nums } = input
  const L1 = input.first_len
  const L2 = input.second_len
  const first = windowSums(nums, L1)
  const second = windowSums(nums, L2)
  let best = null
  const frames = [{ phase: 'start', pythonLine: P('first = ['), activeLine: L('const first = windowSums'), index: -1, span: null, best: null, message: `First window length ${L1}, second window length ${L2}.` }]
  // Sweep the second window; the best first window must end before it starts.
  let bestFirst = null
  for (let s = 0; s < second.length; s++) {
    if (s - L1 >= 0 && (bestFirst === null || first[s - L1] > bestFirst)) bestFirst = first[s - L1]
    if (bestFirst !== null && (best === null || second[s] + bestFirst > best)) best = second[s] + bestFirst
    frames.push({ phase: 'second', pythonLine: P(bestFirst !== null ? 'best = second[s] + best_first' : 'best_first is None or'), activeLine: L(bestFirst !== null ? 'best = second[s] + bestFirst' : 'if (s - firstLen >= 0'), index: s, span: [s, s + L2 - 1], best, message: bestFirst === null ? `Second window at ${s} has no earlier first window yet.` : `Second window at ${s} pairs with the best earlier first window (${bestFirst}). Best: ${best}.` })
  }
  // Sweep the first window; the best second window must end before it starts.
  let bestSecond = null
  for (let s = 0; s < first.length; s++) {
    if (s - L2 >= 0 && (bestSecond === null || second[s - L2] > bestSecond)) bestSecond = second[s - L2]
    if (bestSecond !== null && (best === null || first[s] + bestSecond > best)) best = first[s] + bestSecond
    frames.push({ phase: 'first', pythonLine: P(bestSecond !== null ? 'best = first[s] + best_second' : 'best_second is None or'), activeLine: L(bestSecond !== null ? 'best = first[s] + bestSecond' : 'if (s - secondLen >= 0'), index: s, span: [s, s + L1 - 1], best, message: bestSecond === null ? `First window at ${s} has no earlier second window yet.` : `First window at ${s} pairs with the best earlier second window (${bestSecond}). Best: ${best}.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return best'), activeLine: L('return best'), index: -1, span: null, best, message: `Largest total: ${best}.` })
  return { input, result: best, frames }
}
