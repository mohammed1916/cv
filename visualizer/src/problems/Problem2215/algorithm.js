// LeetCode 2215: Find the Difference of Two Arrays.
// Put each array's distinct values into a set. The first answer is the values of nums1 that are not in nums2; the
// second is the reverse. Output each list in any order; this page sorts them for stable display.

const MAX_LEN = 10
const MAX_VALUE = 9

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"nums1":[1,2,3,3],"nums2":[1,4,6]}.') }
  if (!spec || !Array.isArray(spec.nums1) || !Array.isArray(spec.nums2)) throw new Error('Give nums1 and nums2 arrays.')
  for (const arr of [spec.nums1, spec.nums2]) {
    if (arr.length < 1 || arr.length > MAX_LEN) throw new Error(`Each array has 1 to ${MAX_LEN} values.`)
    if (!arr.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 0 to ${MAX_VALUE}.`)
  }
  return { nums1: spec.nums1, nums2: spec.nums2 }
}

export const code = `FUNCTION findDifference(nums1, nums2)
    set1 ← distinct values of nums1
    set2 ← distinct values of nums2
    only1 ← values in set1 that are not in set2
    only2 ← values in set2 that are not in set1
    RETURN [only1, only2]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def find_difference(nums1, nums2):
    set1 = set(nums1)
    set2 = set(nums2)
    only1 = [x for x in set1 if x not in set2]
    only2 = [x for x in set2 if x not in set1]
    return [only1, only2]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'sets', label: 'Sets', description: 'Collect the distinct values of each array.' },
  { id: 'compare', label: 'Compare', description: 'Keep the values that appear in one array only.' },
  { id: 'done', label: 'Result', description: 'The two difference lists.' },
]

export function buildTrace({ nums1, nums2 }) {
  const set1 = [...new Set(nums1)].sort((a, b) => a - b)
  const set2 = [...new Set(nums2)].sort((a, b) => a - b)
  const in1 = new Set(set1)
  const in2 = new Set(set2)
  const only1 = set1.filter(x => !in2.has(x))
  const only2 = set2.filter(x => !in1.has(x))
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index: -1, activeLine, pythonLine, message, nums1, nums2, set1, set2, only1: [], only2: [], ...extra })
  push('sets', L('set1 ← distinct'), P('set1 = set'), `Distinct values: nums1 has ${set1.join(', ')}; nums2 has ${set2.join(', ')}.`)
  push('compare', L('only1 ← values'), P('only1 = [x'), `Values only in nums1: ${only1.join(', ') || 'none'}.`, { only1: only1.slice(), only2: [] })
  push('compare', L('only2 ← values'), P('only2 = [x'), `Values only in nums2: ${only2.join(', ') || 'none'}.`, { only1: only1.slice(), only2: only2.slice() })
  push('done', L('RETURN [only1'), P('return [only1'), 'Both difference lists are ready.', { only1: only1.slice(), only2: only2.slice(), result: [only1, only2] })
  return { input: { nums1, nums2 }, result: [only1, only2], frames }
}
