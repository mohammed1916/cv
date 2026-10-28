export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.balance)) throw new Error('Use a JSON object with a balance array.')
  const n = input.balance.length
  if (n < 1 || n > 12) throw new Error('balance needs 1 to 12 values.')
  if (input.balance.some(v => !Number.isInteger(v) || v < -9 || v > 9)) throw new Error('balance values are integers from -9 to 9.')
  if (input.balance.filter(v => v < 0).length > 1) throw new Error('At most one balance may be negative.')
  return input
}

export function buildTrace(input) {
  const { balance } = input
  const n = balance.length
  const total = balance.reduce((sum, v) => sum + v, 0)
  const dist = (a, b) => Math.min(Math.abs(a - b), n - Math.abs(a - b))
  const frames = []
  if (total < 0) {
    frames.push({ phase: 'done', activeLine: L('if total is less than 0'), person: -1, moves: -1, message: 'The total balance is negative, so no moves can fix it.' })
    return { input, result: -1, frames, order: [] }
  }
  const p = balance.findIndex(v => v < 0)
  if (p < 0) {
    frames.push({ phase: 'done', activeLine: L('if there is no negative balance'), person: -1, moves: 0, message: 'Every balance is already non-negative.' })
    return { input, result: 0, frames, order: [] }
  }
  let need = -balance[p]
  frames.push({ phase: 'find', activeLine: L('the position of the negative balance'), person: p, moves: 0, need, message: `Person ${p} is short by ${need} units.` })
  const order = Array.from({ length: n }, (_, j) => j).filter(j => j !== p).sort((a, b) => dist(a, p) - dist(b, p))
  let moves = 0
  for (const j of order) {
    if (need === 0) break
    const take = Math.min(need, balance[j])
    moves += take * dist(j, p)
    need -= take
    frames.push({ phase: 'take', activeLine: L('take = the smaller of need'), person: j, moves, need, message: `Take ${take} unit(s) from person ${j}, ${dist(j, p)} step(s) away. Moves so far: ${moves}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return moves'), person: -1, moves, need, message: `Minimum moves: ${moves}.` })
  return { input, result: moves, frames, order }
}

export const code = `minimum moves to balance (balance):
  total = sum of all balances
  if total is less than 0 then return -1
  p = the position of the negative balance, if any
  if there is no negative balance then return 0
  need = the absolute value of balance[p]
  sort the other people by circular distance to p, nearest first
  moves = 0
  for each other person j in that order
    if need is 0 then stop
    take = the smaller of need and balance[j]
    add take times the distance from j to p to moves
    subtract take from need
  return moves`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_moves_to_balance_circular_array(balance):
    n = len(balance)
    if sum(balance) < 0:
        return -1
    negatives = [i for i in range(n) if balance[i] < 0]
    if not negatives:
        return 0
    p = negatives[0]
    need = -balance[p]

    def dist(j):
        d = abs(j - p)
        return min(d, n - d)

    moves = 0
    for j in sorted((j for j in range(n) if j != p), key=dist):
        if need == 0:
            break
        take = min(need, balance[j])
        moves += take * dist(j)
        need -= take
    return moves
`
