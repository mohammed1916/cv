export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.m) || !Number.isInteger(input.k) || !Array.isArray(input.operations)) throw new Error('Use an object with integers m and k and an array of operations.')
  if (input.m < 3 || input.m > 30) throw new Error('m must be an integer from 3 to 30.')
  if (input.k < 1 || 2 * input.k >= input.m) throw new Error('k must be at least 1 and twice k must be less than m.')
  if (input.operations.length < 1 || input.operations.length > 60) throw new Error('operations must have 1 to 60 entries.')
  for (const op of input.operations) {
    if (Array.isArray(op) && op.length === 1 && op[0] === 'calc') continue
    if (Array.isArray(op) && op.length === 2 && op[0] === 'add' && Number.isInteger(op[1]) && op[1] >= 0 && op[1] <= 1000) continue
    throw new Error('Each operation is ["add", n] with n from 0 to 1000, or ["calc"].')
  }
  return { m: input.m, k: input.k, operations: input.operations }
}

export function buildTrace({ m, k, operations }) {
  const stream = []
  const results = []
  const frames = []
  frames.push({ phase: 'start', activeLine: L('set stream to empty'), stream: [], last: null, results: [], message: `Track the last ${m} values, drop the ${k} smallest and ${k} largest.` })
  for (const op of operations) {
    if (op[0] === 'add') {
      stream.push(op[1])
      results.push(null)
      frames.push({ phase: 'add', activeLine: L('if the operation is add'), stream: [...stream], last: null, results: [...results], message: `Add ${op[1]} to the stream.` })
      continue
    }
    if (stream.length < m) {
      results.push(-1)
      frames.push({ phase: 'calc', activeLine: L('fewer than m values'), stream: [...stream], last: -1, results: [...results], message: `Only ${stream.length} values, fewer than ${m}, so the answer is -1.` })
      continue
    }
    const sorted = stream.slice(-m).sort((a, b) => a - b)
    const middle = sorted.slice(k, m - k)
    const average = Math.floor(middle.reduce((a, b) => a + b, 0) / (m - 2 * k))
    results.push(average)
    frames.push({ phase: 'calc', activeLine: L('record the floor'), stream: [...stream], last: average, results: [...results], message: `Sorted last ${m} values, kept [${middle.join(', ')}]. Average ${average}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the records'), stream: [...stream], last: null, results: [...results], message: 'All operations are processed.' })
  return { input: { m, k, operations }, result: results, frames }
}

export const code = `finding mk average (m, k, operations):
  set stream to empty
  set records to empty
  for each operation in operations
    if the operation is add then append its value to stream and record nothing
    otherwise
      if the stream has fewer than m values then record -1
      otherwise
        take the last m values of stream and sort them
        remove the k smallest and the k largest values
        record the floor of the sum of the rest divided by m minus 2k
  return the records`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def mk_average(m, k, operations):
    stream = []
    results = []
    for op in operations:
        if op[0] == 'add':
            stream.append(op[1])
            results.append(None)
        elif len(stream) < m:
            results.append(-1)
        else:
            last = sorted(stream[-m:])
            middle = last[k:m - k]
            results.append(sum(middle) // (m - 2 * k))
    return results
`
