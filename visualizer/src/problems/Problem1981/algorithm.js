export const phases = [
  { id: 'start', label: 'Start sums', description: 'Start with the single reachable sum 0 before choosing any row.' },
  { id: 'row', label: 'Add a row', description: 'Every reachable sum is extended by each value of the next row.' },
  { id: 'closest', label: 'Closest sum', description: 'After all rows, the answer is the smallest distance from a reachable sum to target.' },
  { id: 'done', label: 'Result', description: 'Return the minimum absolute difference.' },
]

export const code = `function minimizeTheDifference(mat, target) {
  let reachable = new Set([0])
  for (const row of mat) {
    const next = new Set()
    for (const sum of reachable) {
      for (const value of row) next.add(sum + value)
    }
    reachable = next
  }
  let best = Infinity
  for (const sum of reachable) best = Math.min(best, Math.abs(sum - target))
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimize_the_difference(mat, target):
    reachable = {0}
    for row in mat:
        next_sums = set()
        for total in reachable:
            for value in row:
                next_sums.add(total + value)
        reachable = next_sums
    best = float('inf')
    for total in reachable:
        best = min(best, abs(total - target))
    return best
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"mat":[[1,2],[3,4]],"target":5}.') }
  const { mat, target } = obj || {}
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 70) throw new Error('mat must have 1 to 70 rows.')
  if (!mat.every(row => Array.isArray(row) && row.length >= 1 && row.length <= 70 && row.every(v => Number.isInteger(v) && v >= 1 && v <= 70))) {
    throw new Error('Each row needs 1 to 70 whole numbers from 1 to 70.')
  }
  if (!Number.isInteger(target) || target < 1 || target > 800) throw new Error('target must be a whole number from 1 to 800.')
  return { mat, target }
}

export function buildTrace({ mat, target }) {
  const frames = []
  let reachable = new Set([0])
  const add = (phase, c, p, message, row) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { mat, target, row, sums: [...reachable].sort((a, b) => a - b) },
  })
  add('start', 'let reachable', 'reachable = {0}', 'Only the empty choice exists, so the sum set is {0}.', -1)
  mat.forEach((values, r) => {
    const next = new Set()
    for (const sum of reachable) for (const value of values) next.add(sum + value)
    reachable = next
    add('row', 'for (const sum', 'for total in reachable', `Row ${r} adds one of ${values.join(', ')} to each reachable sum. ${reachable.size} sums are now reachable.`, r)
  })
  let best = Infinity
  for (const sum of reachable) best = Math.min(best, Math.abs(sum - target))
  add('closest', 'let best', 'best = float', `The closest reachable sum to ${target} is ${target + best} or ${target - best}, distance ${best}.`, mat.length - 1)
  add('done', 'return best', 'return best', `The minimum absolute difference is ${best}.`, mat.length - 1)
  return { input: { mat, target }, result: best, frames }
}
