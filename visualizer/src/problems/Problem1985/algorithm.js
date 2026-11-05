export const phases = [
  { id: 'start', label: 'Start', description: 'Each number is a string, so compare length first and then characters.' },
  { id: 'sort', label: 'Order numbers', description: 'Sort ascending by length, then lexicographically. Equal values stay as separate entries.' },
  { id: 'pick', label: 'Count from the top', description: 'The k-th largest is k positions from the end of the ascending order.' },
  { id: 'done', label: 'Result', description: 'Return the string at that position.' },
]

export const code = `function kthLargestNumber(nums, k) {
  const sorted = [...nums].sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0))
  return sorted[sorted.length - k]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def kth_largest_number(nums, k):
    ordered = sorted(nums, key=lambda s: (len(s), s))
    return ordered[len(ordered) - k]
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"nums":["3","6","7","10"],"k":4}.') }
  const { nums, k } = obj || {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50) throw new Error('nums must have 1 to 50 strings here.')
  if (!nums.every(s => typeof s === 'string' && /^(0|[1-9][0-9]{0,19})$/.test(s))) {
    throw new Error('Each entry must be a decimal integer string without leading zeros, up to 20 digits.')
  }
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be from 1 to the number of strings.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const ordered = [...nums].sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0))
  const target = ordered.length - k
  const add = (phase, c, p, message, position) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { ordered, k, position },
  })
  add('start', 'const sorted', 'ordered = sorted', `Ordering ${nums.length} strings by length, then by characters.`, -1)
  add('sort', 'return sorted', 'return ordered', `Ascending order: ${ordered.join(', ')}.`, -1)
  add('pick', 'return sorted', 'return ordered', `Position ${target} from the start is the ${k}-th largest, which is ${ordered[target]}.`, target)
  add('done', 'return sorted', 'return ordered', `The ${k}-th largest integer is ${ordered[target]}.`, target)
  return { input: { nums, k }, result: ordered[target], frames }
}
