export const phases = [
  { id: 'start', label: 'Start', description: 'Read the values and the number k of strongest values wanted.' },
  { id: 'sort', label: 'Sort values', description: 'Sort a copy of the values so the middle position can be found.' },
  { id: 'median', label: 'Lower median', description: 'Take the value at position (n - 1) // 2 in sorted order.' },
  { id: 'rank', label: 'Rank strength', description: 'Strength is the distance from the median. Ties go to the larger value.' },
  { id: 'take', label: 'Take strongest', description: 'Collect the first k values of the ranking.' },
  { id: 'done', label: 'Complete', description: 'Return the k strongest values.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with arr and k.')
  const { arr, k } = input
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 1000 || !arr.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) {
    throw new Error('arr is a list of 1 to 1000 integers from -1000 to 1000.')
  }
  if (!Number.isInteger(k) || k < 1 || k > arr.length) throw new Error('k is an integer from 1 to the length of arr.')
  return { arr, k }
}

const at = (activeLine, pythonLine = activeLine) => ({ activeLine, pythonLine })

export function buildTrace({ arr, k }) {
  const sorted = [...arr].sort((a, b) => a - b)
  const medianIndex = Math.floor((sorted.length - 1) / 2)
  const median = sorted[medianIndex]
  const ranked = arr
    .map(value => ({ value, distance: Math.abs(value - median) }))
    .sort((a, b) => (b.distance - a.distance) || (b.value - a.value))
  const result = ranked.slice(0, k).map(item => item.value)
  const base = { sorted: [], median: null, medianIndex: null, ranked: [], chosen: [] }
  const frames = [{ phase: 'start', ...at(1), snapshot: base, message: `Read ${arr.length} values and k = ${k}.` }]
  frames.push({ phase: 'sort', ...at(2), snapshot: { ...base, sorted }, message: `Sorted values: ${sorted.join(', ')}.` })
  frames.push({ phase: 'median', ...at(3), snapshot: { ...base, sorted, median, medianIndex }, message: `The lower median is position ${medianIndex} in sorted order, which is ${median}.` })
  frames.push({ phase: 'rank', ...at(4), snapshot: { ...base, sorted, median, medianIndex, ranked }, message: `Each value is ranked by its distance from ${median}. Equal distances put the larger value first.` })
  result.forEach((value, j) => frames.push({
    phase: 'take', ...at(5),
    snapshot: { ...base, sorted, median, medianIndex, ranked, chosen: result.slice(0, j + 1) },
    message: `Take ${value}, strength place ${j + 1} of ${k}.`,
  }))
  frames.push({ phase: 'done', ...at(5), snapshot: { ...base, sorted, median, medianIndex, ranked, chosen: result }, message: `Return [${result.join(', ')}].` })
  return { input: { arr, k }, result, frames }
}

export const code = `function getStrongest(arr, k) {
  const sorted = [...arr].sort((a, b) => a - b)
  const median = sorted[Math.floor((sorted.length - 1) / 2)]
  const ranked = [...arr].sort((a, b) => (Math.abs(b - median) - Math.abs(a - median)) || (b - a))
  return ranked.slice(0, k)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def get_strongest(arr, k):
    ordered = sorted(arr)
    median = ordered[(len(ordered) - 1) // 2]
    ranked = sorted(arr, key=lambda x: (abs(x - median), x), reverse=True)
    return ranked[:k]
`
