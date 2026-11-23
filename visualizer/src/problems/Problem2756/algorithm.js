// Query Batching: split values into consecutive batches of at most k items, and return each batch's sum.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.values) || input.values.length < 1 || input.values.length > 12) throw new Error('Use an object with values: 1 to 12 non-negative integers.')
  if (input.values.some(v => !Number.isInteger(v) || v < 0 || v > 9)) throw new Error('Each value is an integer from 0 to 9.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 4) throw new Error('k is an integer from 1 to 4.')
  return { values: input.values, k: input.k }
}

export const CODE_LINES = [
  'def batch_sums(values, k):',
  '    sums = []',
  '    current = 0',
  '    count = 0',
  '    for value in values:',
  '        if count == k:',
  '            sums.append(current)',
  '            current = 0',
  '            count = 0',
  '        current += value',
  '        count += 1',
  '    if count > 0:',
  '        sums.append(current)',
  '    return sums',
]
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = CODE_LINES.join('\n') + '\n'

export function buildTrace({ values, k }) {
  const sums = []
  let current = 0
  let count = 0
  const batchOf = []
  const frames = [{ phase: 'start', activeLine: 2, index: -1, values, batchOf: [], sums: [], current, message: `Start with no batches; the batch size is ${k}.` }]
  values.forEach((value, index) => {
    if (count === k) {
      sums.push(current)
      frames.push({ phase: 'close', activeLine: 7, index, values, batchOf: [...batchOf], sums: [...sums], current, message: `The batch is full, so its sum ${current} is recorded.` })
      current = 0
      count = 0
    }
    current += value
    count += 1
    batchOf.push(sums.length)
    frames.push({ phase: 'add', activeLine: 10, index, values, batchOf: [...batchOf], sums: [...sums], current, message: `Add ${value} to the open batch; its sum is now ${current}.` })
  })
  if (count > 0) {
    sums.push(current)
    frames.push({ phase: 'close', activeLine: 13, index: values.length - 1, values, batchOf: [...batchOf], sums: [...sums], current, message: `Record the last batch with sum ${current}.` })
  }
  frames.push({ phase: 'done', activeLine: 14, index: values.length - 1, values, batchOf: [...batchOf], sums: [...sums], current: 0, message: `Batch sums: [${sums.join(', ')}].` })
  return { input: { values, k }, result: sums, frames }
}
