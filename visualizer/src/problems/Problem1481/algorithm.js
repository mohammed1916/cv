export const phases = [
  { id: 'start', label: 'Start', description: 'Read the array and the number of removals.' },
  { id: 'count', label: 'Count copies', description: 'Count how many copies each value has.' },
  { id: 'sort', label: 'Sort by copies', description: 'Order the values so the cheapest to delete come first.' },
  { id: 'remove', label: 'Delete a value', description: 'Delete every copy of a value that the remaining removals can afford.' },
  { id: 'stop', label: 'Stop', description: 'The next value has too many copies to delete completely.' },
  { id: 'done', label: 'Complete', description: 'The distinct count after the removals.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.arr) || !Number.isInteger(data.k)) throw new Error('Use an object with an integer array arr and an integer k, for example {"arr":[2,2,3],"k":1}.')
  if (data.arr.length < 1 || data.arr.length > 60) throw new Error('arr must have 1 to 60 values in this visualization.')
  if (!data.arr.every(v => Number.isInteger(v) && Math.abs(v) <= 1000000000)) throw new Error('Every value in arr must be an integer with absolute value at most 1000000000.')
  if (data.k < 0 || data.k > data.arr.length) throw new Error(`k must be from 0 to ${data.arr.length}, the length of arr.`)
  return { arr: data.arr, k: data.k }
}

export const code = `least distinct after k removals (arr, k):
  count how many times each value appears
  sort the values by count, smallest count first
  distinct = number of values
  for each value in that order:
    if its count is more than k: stop
    k = k - its count
    distinct = distinct - 1
  return distinct`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `from collections import Counter

def find_least_num_of_unique_ints(arr, k):
    groups = sorted(Counter(arr).items(), key=lambda item: item[1])
    distinct = len(groups)
    for value, count in groups:
        if count > k:
            break
        k -= count
        distinct -= 1
    return distinct
`

export function buildTrace({ arr, k }) {
  const frames = []
  const counts = new Map()
  for (const v of arr) counts.set(v, (counts.get(v) || 0) + 1)
  const groups = [...counts].map(([value, count]) => ({ value, count, status: 'pending' }))
  let remaining = k
  let distinct = groups.length
  const snapshot = (extra = {}) => ({ groups: groups.map(g => ({ ...g })), remaining, distinct, ...extra })

  frames.push({
    phase: 'start', activeLine: L('least distinct after'), pythonLine: P('from collections'),
    message: `We may delete exactly ${k} elements. Deleting every copy of a value removes that value from the set of distinct values, so we want to remove the cheapest values first.`,
    scene: snapshot(),
  })
  frames.push({
    phase: 'count', activeLine: L('count how many times'), pythonLine: P('Counter(arr)'),
    message: `Count the copies. The array has ${groups.length} distinct values: ${groups.map(g => `${g.value}×${g.count}`).join(', ')}.`,
    scene: snapshot(),
  })
  groups.sort((a, b) => a.count - b.count || a.value - b.value)
  frames.push({
    phase: 'sort', activeLine: L('sort the values by count'), pythonLine: P('sorted(Counter'),
    message: `Sort by copy count, smallest first: ${groups.map(g => `${g.value} (${g.count})`).join(', ')}.`,
    scene: snapshot(),
  })
  frames.push({
    phase: 'sort', activeLine: L('distinct = number of values'), pythonLine: P('distinct = len(groups)'),
    message: `Start with ${distinct} distinct values and ${remaining} removals to spend.`,
    scene: snapshot(),
  })

  for (const g of groups) {
    if (g.count > remaining) {
      g.status = 'kept'
      frames.push({
        phase: 'stop', activeLine: L('if its count is more than k'), pythonLine: P('if count > k'),
        message: `Value ${g.value} has ${g.count} copies, but only ${remaining} removals remain. Removing part of its copies would not drop it from the set, so we stop here.`,
        scene: snapshot({ current: g.value }),
      })
      break
    }
    remaining -= g.count
    distinct -= 1
    g.status = 'removed'
    frames.push({
      phase: 'remove', activeLine: L('k = k - its count'), pythonLine: P('k -= count'),
      message: `Delete all ${g.count} copies of ${g.value}. ${remaining} removals remain, and ${distinct} distinct values are left.`,
      scene: snapshot({ current: g.value }),
    })
  }

  frames.push({
    phase: 'done', activeLine: L('return distinct'), pythonLine: P('return distinct'),
    message: `The fewest distinct values left after exactly ${k} removals is ${distinct}.`,
    scene: snapshot(),
  })
  return { input: { arr, k }, result: distinct, frames }
}
