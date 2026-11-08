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
  { label: 'Single value', input: '[7]' },
  { label: 'Equal counts', input: '[3,3,1,1,2,2]' },
  { label: 'Extreme values', input: '[-100,100,-100,100,0]' },
  { label: 'Long run: 100 values', input: '[45,-54,63,81,80,-30,-96,-81,98,-19,40,-17,-93,40,-29,-94,64,-13,-57,98,20,51,59,17,60,67,-36,-18,-7,-69,10,-12,-22,-87,-25,-23,-22,17,-90,-35,-89,7,12,31,-20,36,74,44,-34,48,4,38,-56,81,96,-6,89,-77,-42,-16,59,54,-47,53,19,40,-2,-81,-52,57,-6,29,25,-9,46,-75,12,92,-64,-1,-90,31,0,60,-34,-90,-23,-2,-5,-77,-12,22,17,84,-21,65,-65,70,5,-49]' },
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
