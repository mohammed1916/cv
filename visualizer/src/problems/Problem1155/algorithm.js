export const phases = [
  { id: 'start', label: 'Start', description: 'Zero dice make only the empty sum possible.' },
  { id: 'inspect', label: 'Read previous row', description: 'For one sum, read the previous row at the sums that the last face could complete.' },
  { id: 'update', label: 'Write new cell', description: 'Store the count for this sum in the new row.' },
  { id: 'done', label: 'Result', description: 'The last row at the target sum is the answer.' },
]

const MOD = 1000000007
const SOURCE = [
  ['head', 'function count_ways(n, faces, target):', 'def count_ways(n, faces, target):'],
  ['base', '  prev = [1, 0, 0, ..., 0]  (length target + 1)', '    prev = [1] + [0] * target'],
  ['die', '  for die from 1 to n:', '    for die in range(n):'],
  ['cell', '    for s from 0 to target:', '        for s in range(target + 1):'],
  ['read', '      cur[s] = sum of prev[s - f] for face f = 1..faces, when s - f >= 0', '            cur[s] = sum(prev[s - f] for f in range(1, faces + 1) if s - f >= 0) % MOD'],
  ['swap', '    prev = cur', '        prev = cur'],
  ['ret', '  return prev[target]', '    return prev[target]'],
]
export const code = SOURCE.map(row => row[1]).join('\n')
export const python = SOURCE.map(row => row[2]).join('\n')
export const pythonLineMap = Object.fromEntries(SOURCE.map((_, index) => [index + 1, index + 1]))
const L = Object.fromEntries(SOURCE.map((row, index) => [row[0], index + 1]))

export function parseInput(text) {
  let values
  try { values = JSON.parse(text) } catch { throw new Error('Enter a JSON array [dice, faces, target].') }
  if (!Array.isArray(values) || values.length !== 3 || !values.every(Number.isInteger)) throw new Error('Enter exactly three integers: [dice, faces, target].')
  const [dice, faces, target] = values
  if (dice < 1 || dice > 8) throw new Error('Dice count must be from 1 to 8 for the trace.')
  if (faces < 1 || faces > 8) throw new Error('Faces per die must be from 1 to 8 for the trace.')
  if (target < 1 || target > 40) throw new Error('Target must be from 1 to 40 for the trace.')
  return { dice, faces, target }
}

export function buildTrace({ dice, faces, target }) {
  const frames = []
  let prev = Array(target + 1).fill(0)
  prev[0] = 1
  const snapshot = (extra = {}) => ({ dice, faces, target, row: 0, prev: [...prev], cur: null, reads: [], sum: null, ...extra })
  frames.push({ phase: 'start', activeLine: L.base, message: `With zero dice, only sum 0 is possible. That is the starting row.`, snapshot: snapshot() })

  for (let die = 1; die <= dice; die++) {
    const cur = Array(target + 1).fill(0)
    for (let s = 0; s <= target; s++) {
      const reads = []
      let total = 0
      for (let f = 1; f <= faces; f++) if (s - f >= 0) { reads.push(s - f); total += prev[s - f] }
      frames.push({
        phase: 'inspect', activeLine: L.read,
        message: reads.length
          ? `Sum ${s} with ${die} dice: the last die shows one of its faces, so read previous sums ${reads.join(', ')}.`
          : `Sum ${s} with ${die} dice: no face can be the last one, so the count is 0.`,
        snapshot: snapshot({ row: die, cur: [...cur], reads, sum: s }),
      })
      cur[s] = total % MOD
      frames.push({
        phase: 'update', activeLine: s === target ? L.swap : L.read,
        message: `Store ${cur[s]} for sum ${s} in row ${die}.`,
        snapshot: snapshot({ row: die, cur: [...cur], reads, sum: s }),
      })
    }
    prev = cur
  }
  frames.push({ phase: 'done', activeLine: L.ret, message: `After ${dice} dice, ${prev[target]} ways reach sum ${target}.`, snapshot: snapshot({ row: dice, cur: null }) })
  return { input: { dice, faces, target }, result: prev[target], frames }
}
