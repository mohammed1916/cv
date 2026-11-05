export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 2 || arr.length > 14 || arr.length % 2 !== 0) throw new Error('Use a JSON array of an even number of entries, 2 to 14.')
  if (arr.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Values are integers from 1 to 9.')
  return arr
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function minSetSize(arr) {', 'from collections import Counter'],
  ['', ''],
  ['  const counts = new Map()', 'def min_set_size(arr):'],
  ['  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1)', '    counts = Counter(arr)'],
  ['  const order = [...counts].sort((a, b) => b[1] - a[1])', '    order = counts.most_common()'],
  ['  let removed = 0, chosen = 0', '    removed = chosen = 0'],
  ['  for (const [value, count] of order) {', '    for value, count in order:'],
  ['    if (removed * 2 >= arr.length) break', '        if removed * 2 >= len(arr): break'],
  ['    removed += count; chosen++', '        removed += count; chosen += 1'],
  ['  }', ''],
  ['  return chosen', '    return chosen'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(arr) {
  const counts = new Map()
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1)
  const order = [...counts].sort((a, b) => b[1] - a[1])
  const frames = [{ phase: 'count', activeLine: L('const counts'), pythonLine: P('counts = Counter'), value: null, chosen: [], removed: 0, message: `Count the values. The most frequent value appears ${order[0][1]} times.` }]
  let removed = 0
  const chosen = []
  for (const [value, count] of order) {
    if (removed * 2 >= arr.length) break
    removed += count
    chosen.push(value)
    frames.push({ phase: 'pick', activeLine: L('removed += count'), pythonLine: P('removed += count'), value, chosen: [...chosen], removed, message: `Remove every ${value} (${count} copies): ${removed} of ${arr.length} entries are gone.` })
  }
  frames.push({ phase: 'done', activeLine: L('return chosen'), pythonLine: P('return chosen'), value: null, chosen: [...chosen], removed, message: `Smallest set size: ${chosen.length}.` })
  return { input: arr, result: chosen.length, frames }
}
