export const phases = [
  { id: 'setup', label: 'Set up', description: 'Start with empty counts and zero good pairs.' },
  { id: 'read', label: 'Read a value', description: 'Take the next value from left to right.' },
  { id: 'pair', label: 'Pair with earlier equals', description: 'Every earlier equal value forms one good pair with this index. Read the count before storing this value.' },
  { id: 'store', label: 'Record the value', description: 'Increase the count for this value so later indices can pair with it.' },
  { id: 'done', label: 'Complete', description: 'Return the number of good pairs.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 60 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Enter a JSON array of 1 to 60 integers from 1 to 100.')
  return nums
}

export const code = `count good pairs (nums):
  seen = empty counts
  good = 0
  for each index i with value v in nums:
    good = good + seen[v]
    seen[v] = seen[v] + 1
  return good`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def num_identical_pairs(nums):
    seen = {}
    good = 0
    for value in nums:
        good += seen.get(value, 0)
        seen[value] = seen.get(value, 0) + 1
    return good
`

const SPOT = {
  setup: ['seen = empty counts', 'seen = {}'],
  read: ['for each index i', 'for value in nums'],
  pair: ['good = good + seen[v]', 'good += seen.get'],
  store: ['seen[v] = seen[v] + 1', 'seen[value] = seen.get'],
  done: ['return good', 'return good'],
}
function where(key) {
  const [pseudo, py] = SPOT[key]
  return {
    activeLine: code.findIndex(c => c.text.includes(pseudo)) + 1,
    pythonLine: python.split('\n').findIndex(l => l.includes(py)) + 1,
  }
}

export function buildTrace(nums) {
  const seen = new Map()
  const frames = []
  let good = 0
  const counts = () => [...seen].map(([value, count]) => ({ value, count }))
  const emit = (phase, key, message, snapshot) => frames.push({ phase, ...where(key), message, snapshot })

  emit('setup', 'setup', `Scan ${nums.length} values. Counts of values seen so far start empty.`, { index: null, value: null, seen: [], good })
  nums.forEach((value, index) => {
    emit('read', 'read', `Index ${index} holds ${value}.`, { index, value, seen: counts(), good })
    const before = seen.get(value) || 0
    good += before
    emit('pair', 'pair', before
      ? `${before} earlier ${value} value${before === 1 ? '' : 's'} pair${before === 1 ? 's' : ''} with index ${index}. Good pairs: ${good}.`
      : `No earlier ${value}, so index ${index} forms no pair yet.`, { index, value, seen: counts(), good })
    seen.set(value, before + 1)
    emit('store', 'store', `Count of ${value} becomes ${before + 1}.`, { index, value, seen: counts(), good })
  })
  emit('done', 'done', `Good pairs: ${good}.`, { index: null, value: null, seen: counts(), good })
  return { input: nums, result: good, frames }
}
