export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with values, labels, num_wanted and use_limit.')
  const { values, labels, num_wanted, use_limit } = input
  if (!Array.isArray(values) || values.length < 1 || values.length > 12) throw new Error('values needs 1 to 12 entries.')
  if (!Array.isArray(labels) || labels.length !== values.length) throw new Error('labels must match values in length.')
  if (values.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Values are integers from 0 to 100.')
  if (labels.some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('Labels are integers from 0 to 20.')
  if (!Number.isInteger(num_wanted) || num_wanted < 1 || num_wanted > 12) throw new Error('num_wanted is an integer from 1 to 12.')
  if (!Number.isInteger(use_limit) || use_limit < 1 || use_limit > 12) throw new Error('use_limit is an integer from 1 to 12.')
  return { values, labels, num_wanted, use_limit }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function largestValuesFromLabels(values, labels, numWanted, useLimit) {', 'def largest_values_from_labels(values, labels, num_wanted, use_limit):'],
  ['  const order = values.map((_, i) => i).sort((a, b) => values[b] - values[a] || a - b)', '    order = sorted(range(len(values)), key=lambda i: (-values[i], i))'],
  ['  let total = 0', '    total = 0'],
  ['  let taken = 0', '    taken = 0'],
  ['  const used = {}', '    used = {}'],
  ['  for (const i of order) {', '    for i in order:'],
  ['    if (taken >= numWanted) break', '        if taken >= num_wanted: break'],
  ['    const label = labels[i]', '        label = labels[i]'],
  ['    const count = used[label] ?? 0', '        count = used.get(label, 0)'],
  ['    if (count >= useLimit) continue', '        if count >= use_limit: continue'],
  ['    total += values[i]', '        total += values[i]'],
  ['    taken += 1', '        taken += 1'],
  ['    used[label] = count + 1', '        used[label] = count + 1'],
  ['  }', ''],
  ['  return total', '    return total'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { values, labels, num_wanted, use_limit } = input
  const order = values.map((_, i) => i).sort((a, b) => values[b] - values[a] || a - b)
  let total = 0
  let taken = 0
  const used = {}
  const frames = [{ phase: 'start', pythonLine: P('order = sorted'), activeLine: L('const order'), index: -1, total, taken, message: 'Sort the items by value, largest first.' }]
  for (const i of order) {
    if (taken >= num_wanted) {
      frames.push({ phase: 'stop', pythonLine: P('if taken >= num_wanted'), activeLine: L('if (taken >= numWanted)'), index: i, total, taken, message: `${taken} items taken, which is num_wanted; stop.` })
      break
    }
    const label = labels[i]
    const count = used[label] ?? 0
    if (count >= use_limit) {
      frames.push({ phase: 'skip', pythonLine: P('if count >= use_limit'), activeLine: L('if (count >= useLimit)'), index: i, total, taken, message: `Skip ${values[i]}: label ${label} already has ${use_limit} items.` })
      continue
    }
    total += values[i]
    taken += 1
    used[label] = count + 1
    frames.push({ phase: 'take', pythonLine: P('total += values[i]'), activeLine: L('total += values[i]'), index: i, total, taken, message: `Take ${values[i]} with label ${label}; total is ${total}.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return total'), activeLine: L('return total'), index: -1, total, taken, message: `Largest total is ${total}.` })
  return { input, result: total, frames }
}
