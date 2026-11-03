export const phases = [
  { id: 'count', label: 'Count values', description: 'Count how often each value appears, listing values in the order they first appear.' },
  { id: 'order', label: 'Order keys', description: 'Sort by count ascending. Among equal counts, larger values come first.' },
  { id: 'place', label: 'Place elements', description: 'Write each element out in that order, repeating a value as many times as it appears.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums)) throw new Error('Use {"nums":[...]}.')
  if (data.nums.length < 1 || data.nums.length > 20) throw new Error('Use 1 to 20 numbers.')
  if (!data.nums.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) throw new Error('Each number must be an integer from -100 to 100.')
  return { nums: [...data.nums] }
}

const CODE = `sort by increasing frequency (nums):
  count = how many times each value appears
  for each distinct value v, in first-appearance order:
    record the pair (count[v], v)
  sort the elements by count ascending, then value descending
  place each element in that order
  return the placed list`.split('\n')
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = { count: 2, tally: 4, order: 5, place: 6, done: 7 }

export const python = `def frequency_sort(nums):
    count = Counter(nums)
    order = sorted(nums, key=lambda x: (count[x], -x))
    return order`
const PYLINE = { count: 2, tally: 2, order: 3, place: 3, done: 4 }

export function buildTrace(input) {
  const { nums } = input
  const count = new Map()
  for (const v of nums) count.set(v, (count.get(v) || 0) + 1)
  const distinct = [...new Set(nums)]
  const frames = []
  const tally = []
  frames.push({ phase: 'count', activeLine: L.count, pythonLine: PYLINE.count, message: `Count each value in the list of ${nums.length} numbers.`, tally: [], keys: [], placed: [] })
  for (const v of distinct) {
    tally.push({ value: v, count: count.get(v) })
    frames.push({ phase: 'count', activeLine: L.tally, pythonLine: PYLINE.tally, message: `${v} appears ${count.get(v)} time${count.get(v) === 1 ? '' : 's'}.`, tally: tally.map(t => ({ ...t })), keys: [], placed: [] })
  }
  const keys = [...distinct].sort((a, b) => count.get(a) - count.get(b) || b - a).map(v => ({ value: v, count: count.get(v) }))
  frames.push({ phase: 'order', activeLine: L.order, pythonLine: PYLINE.order, message: `Order the values: ${keys.map(k => `${k.value} (×${k.count})`).join(', ')}.`, tally: [], keys, placed: [] })
  const result = []
  for (const k of keys) {
    for (let c = 0; c < k.count; c++) {
      result.push(k.value)
      frames.push({ phase: 'place', activeLine: L.place, pythonLine: PYLINE.place, message: `Place ${k.value} (copy ${c + 1} of ${k.count}).`, tally: [], keys, placed: [...result] })
    }
  }
  frames.push({ phase: 'place', activeLine: L.done, pythonLine: PYLINE.done, message: `The sorted list is ${result.join(', ')}.`, tally: [], keys, placed: [...result] })
  return { input, result, frames }
}
