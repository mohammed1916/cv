export const phases = [
  { id: 'start', label: 'Start', description: 'Start with no values seen and no pairs counted.' },
  { id: 'value', label: 'Look for partners', description: 'For this value, earlier values equal to value - k or value + k each form one pair.' },
  { id: 'record', label: 'Record value', description: 'Add this value to the counts so that later values can pair with it.' },
  { id: 'done', label: 'Result', description: 'Return the number of index pairs with absolute difference k.' },
]

export const code = `function countKDifferencePairs(nums, k) {
  const seen = new Map()
  let pairs = 0
  for (const value of nums) {
    pairs += (seen.get(value - k) ?? 0) + (seen.get(value + k) ?? 0)
    seen.set(value, (seen.get(value) ?? 0) + 1)
  }
  return pairs
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_k_difference_pairs(nums, k):
    seen = {}
    pairs = 0
    for value in nums:
        pairs += seen.get(value - k, 0) + seen.get(value + k, 0)
        seen[value] = seen.get(value, 0) + 1
    return pairs
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"nums":[1,2,2,1],"k":1}.') }
  const { nums, k } = obj || {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 40) throw new Error('nums must have 1 to 40 values here.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value must be a whole number from 1 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > 99) throw new Error('k must be a whole number from 1 to 99.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const seen = new Map()
  let pairs = 0
  const add = (phase, c, p, message, index, gained) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nums, index, k, counts: [...seen.entries()].sort((a, b) => a[0] - b[0]), pairs, gained },
  })
  add('start', 'const seen', 'seen = {}', 'No values seen yet.', -1, 0)
  nums.forEach((value, i) => {
    const gained = (seen.get(value - k) ?? 0) + (seen.get(value + k) ?? 0)
    pairs += gained
    add('value', 'pairs += (seen', 'pairs += seen.get', `Value ${value} at index ${i} pairs with ${gained} earlier value(s).`, i, gained)
    seen.set(value, (seen.get(value) ?? 0) + 1)
    add('record', 'seen.set(value', 'seen[value] = ', `Record ${value}; it can now pair with later values.`, i, gained)
  })
  add('done', 'return pairs', 'return pairs', `${pairs} pair(s) have difference ${k}.`, nums.length - 1, 0)
  return { input: { nums, k }, result: pairs, frames }
}
