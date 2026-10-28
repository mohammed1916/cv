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

export function buildTrace(input) {
  const { values, labels, num_wanted, use_limit } = input
  const order = values.map((_, i) => i).sort((a, b) => values[b] - values[a] || a - b)
  let total = 0
  let taken = 0
  const used = {}
  const frames = [{ phase: 'start', activeLine: L('sort item indexes'), index: -1, total, taken, message: 'Sort the items by value, largest first.' }]
  for (const i of order) {
    if (taken >= num_wanted) {
      frames.push({ phase: 'stop', activeLine: L('if taken is at least'), index: i, total, taken, message: `${taken} items taken, which is num_wanted; stop.` })
      break
    }
    const label = labels[i]
    const count = used[label] ?? 0
    if (count >= use_limit) {
      frames.push({ phase: 'skip', activeLine: L('if the label of this item'), index: i, total, taken, message: `Skip ${values[i]}: label ${label} already has ${use_limit} items.` })
      continue
    }
    total += values[i]
    taken += 1
    used[label] = count + 1
    frames.push({ phase: 'take', activeLine: L('otherwise add its value'), index: i, total, taken, message: `Take ${values[i]} with label ${label}; total is ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, total, taken, message: `Largest total is ${total}.` })
  return { input, result: total, frames }
}

export const code = `largest value total with label limits:
  sort item indexes by value, largest first
  set total to 0 and taken to 0
  set every label count to 0
  for each item index in that order
    if taken is at least num_wanted then stop the loop
    if the label of this item already has use_limit items then skip it
    otherwise add its value to total, add one to taken, and add one to its label count
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_values_from_labels(values, labels, num_wanted, use_limit):
    order = sorted(range(len(values)), key=lambda i: (-values[i], i))
    total = 0
    taken = 0
    used = {}
    for i in order:
        if taken >= num_wanted:
            break
        label = labels[i]
        if used.get(label, 0) >= use_limit:
            continue
        total += values[i]
        taken += 1
        used[label] = used.get(label, 0) + 1
    return total
`
