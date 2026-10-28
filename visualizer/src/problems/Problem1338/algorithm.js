export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 2 || arr.length > 14 || arr.length % 2 !== 0) throw new Error('Use a JSON array of an even number of entries, 2 to 14.')
  if (arr.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Values are integers from 1 to 9.')
  return arr
}

export function buildTrace(arr) {
  const counts = new Map()
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1)
  const order = [...counts].sort((a, b) => b[1] - a[1])
  const frames = [{ phase: 'count', activeLine: L('count how often'), value: null, chosen: [], removed: 0, message: `Count the values. The most frequent value appears ${order[0][1]} times.` }]
  let removed = 0
  const chosen = []
  for (const [value, count] of order) {
    if (removed * 2 >= arr.length) break
    removed += count
    chosen.push(value)
    frames.push({ phase: 'pick', activeLine: L('removed = removed + count'), value, chosen: [...chosen], removed, message: `Remove every ${value} (${count} copies): ${removed} of ${arr.length} entries are gone.` })
  }
  frames.push({ phase: 'done', activeLine: L('return chosen'), value: null, chosen: [...chosen], removed, message: `Smallest set size: ${chosen.length}.` })
  return { input: arr, result: chosen.length, frames }
}

export const code = `smallest number of distinct values to remove
  count how often each value appears
  order the values by count, most frequent first
  removed = 0
  chosen = 0
  for each value v in that order
    if removed is at least half the length then stop
    removed = removed + count of v
    chosen = chosen + 1
  return chosen`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def min_set_size(arr):
    removed = 0
    chosen = 0
    for _, count in Counter(arr).most_common():
        if removed * 2 >= len(arr):
            break
        removed += count
        chosen += 1
    return chosen
`
