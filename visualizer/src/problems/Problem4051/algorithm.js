// Let P be the prefix sums. A subarray ending before index j has sum P[j] - P[i]. It is "distant" when
// |P[j] - P[i] - goal| >= k. The other earlier prefixes form a "close" band: P[i] strictly inside
// (P[j] - goal - k, P[j] - goal + k). Every earlier prefix is either close or distant, so we count the
// close ones with binary search over a sorted list and add the rest.

const MAX_LENGTH = 12

const codeLines = [
  'seen holds prefix 0, and prefix is 0',
  'answer is 0',
  'for each end index j from 1 to n',
  '  prefix is the sum up to j',
  '  close counts earlier prefixes p with prefix minus goal minus k < p < prefix minus goal plus k',
  '  answer grows by j minus close',
  '  add prefix to seen, keeping seen sorted',
  'return answer',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'from bisect import bisect_left, bisect_right, insort',
  'def count_distant_sums(nums, goal, k):',
  '    seen = [0]',
  '    prefix = 0',
  '    answer = 0',
  '    for j, v in enumerate(nums, start=1):',
  '        prefix += v',
  '        lo = prefix - goal - k',
  '        hi = prefix - goal + k',
  '        close = max(0, bisect_left(seen, hi) - bisect_right(seen, lo))',
  '        answer += j - close',
  '        insort(seen, prefix)',
  '    return answer',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, goal and k.')
  const { nums, goal, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`nums has 1 to ${MAX_LENGTH} values.`)
  if (!nums.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) throw new Error('Each value is an integer from -100 to 100.')
  if (!Number.isInteger(goal) || goal < -1000 || goal > 1000) throw new Error('goal is an integer from -1000 to 1000.')
  if (!Number.isInteger(k) || k < 0 || k > 1000) throw new Error('k is an integer from 0 to 1000.')
  return { nums, goal, k }
}

export function buildTrace({ nums, goal, k }) {
  const frames = []
  const prefixes = [0]
  for (const v of nums) prefixes.push(prefixes[prefixes.length - 1] + v)
  const seen = [0]
  let prefix = 0
  let answer = 0
  const sortedCopy = () => [...seen]

  frames.push({ phase: 'start', pythonLine: P('seen = [0]'), activeLine: L('seen holds prefix 0'), j: 0, prefix: 0, lo: null, hi: null, close: null, good: null, seen: sortedCopy(), answer, prefixes, message: `Start with prefix 0 recorded; the target is a difference at least ${k} away from ${goal}.` })
  frames.push({ phase: 'start', pythonLine: P('answer = 0'), activeLine: L('answer is 0'), j: 0, prefix: 0, lo: null, hi: null, close: null, good: null, seen: sortedCopy(), answer, prefixes, message: 'No distant subarray counted yet.' })

  for (let j = 1; j <= nums.length; j++) {
    prefix += nums[j - 1]
    frames.push({ phase: 'prefix', pythonLine: P('prefix += v'), activeLine: L('prefix is the sum'), j, prefix, lo: null, hi: null, close: null, good: null, seen: sortedCopy(), answer, prefixes, message: `Prefix up to index ${j - 1} is ${prefix}.` })
    const lo = prefix - goal - k
    const hi = prefix - goal + k
    const closeList = seen.filter(p => p > lo && p < hi)
    const close = closeList.length
    frames.push({ phase: 'band', pythonLine: P('lo = prefix'), activeLine: L('close counts earlier'), j, prefix, lo, hi, close, closeList, good: null, seen: sortedCopy(), answer, prefixes, message: `Close band (${lo}, ${hi}) holds ${close} earlier prefix${close === 1 ? '' : 'es'}.` })
    answer += j - close
    frames.push({ phase: 'add', pythonLine: P('answer += j - close'), activeLine: L('answer grows by'), j, prefix, lo, hi, close, closeList, good: j - close, seen: sortedCopy(), answer, prefixes, message: `${j} subarray${j === 1 ? '' : 's'} end here; ${close} are too close to goal, so ${j - close} are distant. Answer is ${answer}.` })
    const at = seen.findIndex(p => p > prefix)
    if (at === -1) seen.push(prefix)
    else seen.splice(at, 0, prefix)
    frames.push({ phase: 'insert', pythonLine: P('insort(seen, prefix)'), activeLine: L('add prefix to seen'), j, prefix, lo, hi, close, closeList, good: null, seen: sortedCopy(), answer, prefixes, message: `Record prefix ${prefix} for later end indices.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return answer'), activeLine: L('return answer'), j: nums.length, prefix, lo: null, hi: null, close: null, good: null, seen: sortedCopy(), answer, prefixes, message: `Distant subarrays: ${answer}.` })
  return { input: { nums, goal, k }, result: answer, frames, prefixes }
}
