// LeetCode 2150: Find All Lonely Numbers in the Array.
// A number is lonely when it occurs exactly once and neither neighbour value (x - 1, x + 1) occurs at all.
// Count occurrences first, then check each distinct value against those counts.

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of integers, e.g. [10,6,5,8].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 40 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 40)) {
    throw new Error('Use 1 to 40 integers from 0 to 40.')
  }
  return { nums }
}

export const code = `function findLonely(nums) {
  const count = new Map()
  for (const value of nums) count.set(value, (count.get(value) ?? 0) + 1)
  const lonely = []
  for (const value of [...count.keys()].sort((a, b) => a - b)) {
    if (count.get(value) === 1 && !count.has(value - 1) && !count.has(value + 1)) lonely.push(value)
  }
  return lonely
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: find_lonely
def find_lonely(nums):
    count = {}
    for value in nums:
        count[value] = count.get(value, 0) + 1
    lonely = []
    for value in sorted(count):
        if count[value] == 1 and (value - 1) not in count and (value + 1) not in count:
            lonely.append(value)
    return lonely
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
  { id: 'count', label: 'Count', description: 'Count how often each value occurs.' },
  { id: 'check', label: 'Check neighbours', description: 'A lonely value occurs once and has no neighbour value present.' },
  { id: 'lonely', label: 'Lonely', description: 'The value passes both tests.' },
  { id: 'done', label: 'Result', description: 'All lonely values.' },
]

export function buildTrace({ nums }) {
  const frames = []
  const count = new Map()
  for (const value of nums) count.set(value, (count.get(value) ?? 0) + 1)
  const rows = []
  frames.push({ phase: 'count', activeLine: L('for (const value of nums)'), pythonLine: P('for value in nums'), message: `${count.size} distinct values.`, rows: [], lonely: [] })
  const lonely = []
  for (const value of [...count.keys()].sort((a, b) => a - b)) {
    const occurrences = count.get(value)
    const below = count.has(value - 1)
    const above = count.has(value + 1)
    const ok = occurrences === 1 && !below && !above
    rows.push({ value, occurs: occurrences, neighbourBelow: below ? 'yes' : 'no', neighbourAbove: above ? 'yes' : 'no', lonely: ok ? 'yes' : 'no' })
    if (ok) lonely.push(value)
    frames.push({ phase: ok ? 'lonely' : 'check', activeLine: L('if (count.get(value) === 1'), pythonLine: P('if count[value] == 1'), message: ok ? `${value} occurs once and has no neighbours: lonely.` : `${value} is not lonely.`, rows: rows.map(r => ({ ...r })), lonely: [...lonely] })
  }
  frames.push({ phase: 'done', activeLine: L('return lonely'), pythonLine: P('return lonely'), message: lonely.length ? `Lonely numbers: ${lonely.join(', ')}.` : 'No lonely numbers.', rows: rows.map(r => ({ ...r })), lonely: [...lonely] })
  return { input: { nums }, result: lonely, frames }
}
