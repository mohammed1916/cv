// Sort by increasing frequency: count values, order by count ascending then value descending, then expand.
const JS_LINES = [
  { text: 'const freq = new Map()', py: 'freq = Counter' },
  { text: 'for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1)', py: null },
  { text: 'const order = [...freq.keys()].sort((a, b) => freq.get(a) - freq.get(b) || b - a)', py: 'order = sorted' },
  { text: 'return order.flatMap(v => Array(freq.get(v)).fill(v))', py: 'return [v' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `from collections import Counter

def frequencySort(nums):
    freq = Counter(nums)
    order = sorted(freq, key=lambda v: (freq[v], -v))
    return [v for v in order for _ in range(freq[v])]
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'freq = Counter')]))

export const phases = [
  { id: 'count', label: 'Count', description: 'Count how often each value appears.' },
  { id: 'order', label: 'Order', description: 'Rarer values come first; equal counts put the larger value first.' },
  { id: 'expand', label: 'Expand', description: 'Write each value out as many times as it appeared.' },
  { id: 'done', label: 'Result', description: 'The expanded list is the answer.' },
]

export const examples = [
  { label: 'Ties by value', input: '[5,5,7,9,9,9,4]' },
  { label: 'All distinct', input: '[3,1,2]' },
  { label: 'One value', input: '[8,8,8,8]' },
]

export const complexity = 'O(n + k log k) time for n values with k distinct values. Space is O(n).'

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 100) throw new Error('Use a JSON array of 1 to 100 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) throw new Error('Values are integers from -100 to 100.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const freq = new Map()
  const snap = extra => ({ counts: Object.fromEntries(freq), ...extra })
  frames.push({ phase: 'count', activeLine: 1, index: -1, message: 'Start with no counts.', snapshot: snap({}) })
  nums.forEach((x, i) => {
    freq.set(x, (freq.get(x) ?? 0) + 1)
    frames.push({ phase: 'count', activeLine: 2, index: i, message: `${x} seen ${freq.get(x)} time${freq.get(x) === 1 ? '' : 's'}.`, snapshot: snap({}) })
  })
  const order = [...freq.keys()].sort((a, b) => freq.get(a) - freq.get(b) || b - a)
  frames.push({ phase: 'order', activeLine: 3, index: -1, message: `Order of values: ${order.join(', ')}.`, snapshot: snap({ order }) })
  const out = []
  for (const v of order) {
    for (let k = 0; k < freq.get(v); k++) out.push(v)
    frames.push({ phase: 'expand', activeLine: 4, index: -1, message: `Write ${v} ${freq.get(v)} time${freq.get(v) === 1 ? '' : 's'}.`, snapshot: snap({ order, out: [...out] }) })
  }
  frames.push({ phase: 'done', activeLine: 4, index: -1, result: out, message: `Result: [${out.join(', ')}].`, snapshot: snap({ order, out, result: out }) })
  return { input: nums, result: out, frames }
}
