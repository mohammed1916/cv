export const phases = [
  { id: 'start', label: 'Start', description: 'Count how many times each value appears. Removing a value entirely needs all of its copies removed.' },
  { id: 'count', label: 'Count values', description: 'Tally each value in the array.' },
  { id: 'sort', label: 'Sort counts', description: 'Sort the counts from smallest to largest; the cheapest values to remove come first.' },
  { id: 'remove', label: 'Remove a value', description: 'If k covers all copies of this value, remove them all and the unique count drops by one.' },
  { id: 'stop', label: 'Stop', description: 'The next value needs more removals than k has left, so stop here.' },
  { id: 'done', label: 'Complete', description: 'Return how many distinct values remain.' },
]

export const examples = [
  { label: 'Remove the rare values', input: '{"arr":[5,5,4,3,3,3],"k":2}' },
  { label: 'Plenty of removals', input: '{"arr":[7,7,8,9,9,9,10,10],"k":4}' },
  { label: 'No removals', input: '{"arr":[1,2,3],"k":0}' },
  { label: 'Single value', input: '{"arr":[4],"k":1}' },
  { label: 'Frequency ties', input: '{"arr":[1,1,2,2,3,3],"k":3}' },
  { label: 'Remove everything', input: '{"arr":[6,6,6],"k":3}' },
  { label: 'Long run: 60 values', input: '{"arr":[1,8,5,4,5,8,6,4,3,2,5,8,3,8,6,7,3,6,5,5,1,8,2,1,2,1,8,6,1,4,5,1,7,5,6,6,5,1,3,6,6,2,8,3,2,5,2,2,2,6,3,5,3,6,8,2,8,2,1,5],"k":20}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.arr)) throw new Error('Use an object with an arr list and an integer k.')
  if (data.arr.length < 1 || data.arr.length > 60) throw new Error('arr must have 1 to 60 values in this visualization.')
  if (!data.arr.every(Number.isInteger)) throw new Error('Every arr value must be an integer.')
  if (!Number.isInteger(data.k) || data.k < 0 || data.k > data.arr.length) throw new Error(`k must be from 0 to ${data.arr.length}.`)
  return { arr: data.arr, k: data.k }
}

export function buildTrace({ arr, k }) {
  const count = new Map()
  const snap = (extra = {}) => ({ arr, k: extra.k ?? k, counts: [...count.entries()].map(([v, c]) => ({ value: v, count: c })), ...extra })
  const frames = [{ phase: 'start', activeLine: L('const count = new Map()'), pythonLine: P('count = Counter'), snapshot: snap(),
    message: `Remove ${k} element(s) to leave as few distinct values as possible.` }]
  for (const v of arr) {
    count.set(v, (count.get(v) || 0) + 1)
  }
  frames.push({ phase: 'count', activeLine: L('for (const v of arr)'), pythonLine: P('for v in arr'), snapshot: snap(),
    message: `${count.size} distinct value(s) with counts ${[...count.values()].join(', ')}.` })
  const sorted = [...count.values()].sort((a, b) => a - b)
  frames.push({ phase: 'sort', activeLine: L('const counts ='), pythonLine: P('counts = sorted'), snapshot: snap({ sorted }),
    message: `Counts from smallest: ${sorted.join(', ')}.` })
  let unique = sorted.length
  let left = k
  let stopped = false
  for (const c of sorted) {
    if (left < c) {
      stopped = true
      frames.push({ phase: 'stop', activeLine: L('if (k < c)'), pythonLine: P('if k < c'), snapshot: snap({ sorted, left, unique }),
        message: `${c} copies do not fit in the ${left} removal(s) left, so stop with ${unique} distinct value(s).` })
      break
    }
    left -= c
    unique--
    frames.push({ phase: 'remove', activeLine: L('unique--'), pythonLine: P('unique -= 1'), snapshot: snap({ sorted, left, unique }),
      message: `Remove all ${c} copies; ${left} removal(s) left, ${unique} distinct value(s) remain.` })
  }
  frames.push({ phase: 'done', activeLine: L('return unique'), pythonLine: P('return unique'), snapshot: snap({ sorted, left, unique, result: unique }),
    message: `Return ${unique}${stopped ? '' : ', since every value could be removed'}.`, result: unique })
  for (const f of frames) f.scene = { ...f.snapshot, distinct: f.snapshot.unique ?? f.snapshot.counts.length }
  return { input: { arr, k }, result: unique, frames }
}

export const code = `function findLeastNumOfUniqueInts(arr, k) {
  const count = new Map()
  for (const v of arr) count.set(v, (count.get(v) || 0) + 1)
  const counts = [...count.values()].sort((a, b) => a - b)
  let unique = counts.length
  for (const c of counts) { if (k < c) break; k -= c; unique-- }
  return unique
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def find_least_num_of_unique_ints(arr, k):
    count = Counter(arr)
    counts = sorted(count.values())
    unique = len(counts)
    for c in counts:
        if k < c:
            break
        k -= c
        unique -= 1
    return unique
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
