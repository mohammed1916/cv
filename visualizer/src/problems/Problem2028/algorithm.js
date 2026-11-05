export const phases = [
  { id: 'start', label: 'Missing sum', description: 'The overall mean fixes the total of all n + m rolls, so the missing rolls must add to total minus the observed sum.' },
  { id: 'range', label: 'Feasible range', description: 'n dice must add to at least n and at most 6n; outside that range there is no answer.' },
  { id: 'split', label: 'Share evenly', description: 'Give every missing roll the floor of the average; spread the remainder as +1 on the first rolls.' },
  { id: 'done', label: 'Result', description: 'Return the n missing rolls, or an empty array if none is possible.' },
]

export const code = `function missingRolls(rolls, mean, n) {
  const total = (rolls.length + n) * mean
  const observed = rolls.reduce((sum, v) => sum + v, 0)
  const missing = total - observed
  if (missing < n || missing > 6 * n) return []
  const base = Math.floor(missing / n)
  const extra = missing % n
  return Array.from({ length: n }, (_, i) => (i < extra ? base + 1 : base))
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def missing_rolls(rolls, mean, n):
    total = (len(rolls) + n) * mean
    observed = sum(rolls)
    missing = total - observed
    if missing < n or missing > 6 * n:
        return []
    base = missing // n
    extra = missing % n
    return [base + 1 if i < extra else base for i in range(n)]
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"rolls":[3,2,4,3],"mean":4,"n":2}.') }
  const { rolls, mean, n } = obj || {}
  if (!Array.isArray(rolls) || rolls.length < 1 || rolls.length > 30 || !rolls.every(v => Number.isInteger(v) && v >= 1 && v <= 6)) {
    throw new Error('rolls must have 1 to 30 die faces from 1 to 6.')
  }
  if (!Number.isInteger(mean) || mean < 1 || mean > 6) throw new Error('mean must be a whole number from 1 to 6.')
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new Error('n must be a whole number from 1 to 30.')
  return { rolls, mean, n }
}

export function buildTrace({ rolls, mean, n }) {
  const frames = []
  const total = (rolls.length + n) * mean
  const observed = rolls.reduce((sum, v) => sum + v, 0)
  const missing = total - observed
  const feasible = !(missing < n || missing > 6 * n)
  const base = feasible ? Math.floor(missing / n) : 0
  const extra = feasible ? missing % n : 0
  const values = feasible ? Array.from({ length: n }, (_, i) => (i < extra ? base + 1 : base)) : []
  const add = (phase, c, p, message) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { rolls, n, mean, total, observed, missing, values, feasible },
  })
  add('start', 'const total', 'total = (len', `The ${rolls.length + n} rolls must total ${total}; the observed rolls give ${observed}, so ${missing} is missing.`)
  add('range', 'if (missing < n', 'if missing < n', feasible ? `${missing} fits between ${n} and ${6 * n}.` : `${missing} is outside ${n} to ${6 * n}, so no answer exists.`)
  if (feasible) add('split', 'const base = Math.floor', 'base = missing // n', `Base ${base} for each roll, with ${extra} roll(s) getting one more.`)
  add('done', 'return Array.from', 'return [base', feasible ? `Missing rolls: ${values.join(', ')}.` : 'No missing rolls are possible.')
  return { input: { rolls, mean, n }, result: values, frames }
}
