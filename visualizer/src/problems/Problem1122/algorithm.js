export const phases = [
  { id: 'start', label: 'Start', description: 'Read both arrays. arr2 sets the order of the listed values.' },
  { id: 'count', label: 'Count', description: 'Count how many times each value appears in arr1.' },
  { id: 'place', label: 'Place listed values', description: 'Walk arr2 in order and write each value as many times as it was counted.' },
  { id: 'tail', label: 'Place leftovers', description: 'Values not listed in arr2 are written in ascending order.' },
  { id: 'done', label: 'Answer', description: 'Return the rearranged array.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.arr1) || !Array.isArray(data.arr2)) throw new Error('Use an object with arrays arr1 and arr2, for example {"arr1":[3,1,3],"arr2":[3,1]}.')
  if (data.arr1.length < 1 || data.arr1.length > 30) throw new Error('arr1 must have 1 to 30 values.')
  if (!data.arr1.every(v => Number.isInteger(v) && v >= 0 && v <= 30)) throw new Error('arr1 values must be integers from 0 to 30.')
  if (data.arr2.length < 1 || data.arr2.length > data.arr1.length) throw new Error('arr2 must have 1 to as many values as arr1.')
  if (new Set(data.arr2).size !== data.arr2.length) throw new Error('arr2 values must be distinct.')
  if (!data.arr2.every(v => data.arr1.includes(v))) throw new Error('every value in arr2 must also appear in arr1.')
  return { arr1: data.arr1, arr2: data.arr2 }
}

export const code = [
  'relative sort(arr1, arr2):',
  '  count how many times each value appears in arr1',
  '  result = empty',
  '  for v in arr2, in order:',
  '    append v to result, as many times as it was counted, then clear its count',
  '  for each leftover value v in ascending order:',
  '    append v to result, as many times as it was counted',
  '  return result',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def relative_sort(arr1, arr2):
    count = Counter(arr1)
    result = []
    for v in arr2:
        result += [v] * count.pop(v)
    for v in sorted(count):
        result += [v] * count[v]
    return result`

export function buildTrace(input) {
  const { arr1, arr2 } = input
  const frames = []
  const frame = (phase, line, message, snapshot) => frames.push({ phase, activeLine: line, pythonLine: line, message, snapshot })
  const counts = new Map()
  for (const v of arr1) counts.set(v, (counts.get(v) || 0) + 1)
  const countList = () => [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([value, count]) => ({ value, count }))
  const result = []
  const listed = new Set(arr2)

  frame('start', 1, `Read arr1 (${arr1.length} values) and arr2 (${arr2.length} values). arr2 sets the front of the answer.`, { counts: countList(), result: [], current: null, listed: arr2 })
  frame('count', 2, 'Every value of arr1 now has a count. Counts are the only state we need to rebuild the array.', { counts: countList(), result: [], current: null, listed: arr2 })

  for (const v of arr2) {
    const copies = counts.get(v)
    for (let k = 0; k < copies; k++) result.push(v)
    counts.set(v, 0)
    frame('place', 5, `Value ${v} is listed first in arr2, so write its ${copies} copies. The answer is now ${result.join(', ')}.`, { counts: countList(), result: [...result], current: v, listed: arr2 })
  }

  const leftovers = [...counts.keys()].filter(v => !listed.has(v) && counts.get(v) > 0).sort((a, b) => a - b)
  for (const v of leftovers) {
    const copies = counts.get(v)
    for (let k = 0; k < copies; k++) result.push(v)
    counts.set(v, 0)
    frame('tail', 7, `Value ${v} is not in arr2, so it goes after the listed values, in ascending order. ${copies} copies are appended.`, { counts: countList(), result: [...result], current: v, listed: arr2 })
  }

  frame('done', 8, `The rearranged array is ${result.join(', ')}.`, { counts: countList(), result: [...result], current: null, listed: arr2 })
  return { input, result, frames }
}
