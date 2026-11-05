// LeetCode 2139: Minimum Moves to Reach Target Score.
// Work backwards from the target. An even target can be halved (a doubling move) while doublings remain;
// otherwise subtract 1 (an increment). Once doublings run out, the rest is increments: t - 1 moves.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"target":19,"maxDoubles":2}.') }
  const { target, maxDoubles } = data ?? {}
  if (!Number.isInteger(target) || target < 1 || target > 1000000000) throw new Error('target is an integer from 1 to 1000000000.')
  if (!Number.isInteger(maxDoubles) || maxDoubles < 0 || maxDoubles > 100) throw new Error('maxDoubles is an integer from 0 to 100.')
  return { target, maxDoubles }
}

export const code = `function minMoves(target, maxDoubles) {
  let t = target
  let doubles = maxDoubles
  let moves = 0
  while (t > 1 && doubles > 0) {
    if (t % 2 === 0) {
      t /= 2
      doubles--
    } else {
      t -= 1
    }
    moves++
  }
  return moves + (t - 1)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: min_moves
def min_moves(target, maxDoubles):
    t = target
    doubles = maxDoubles
    moves = 0
    while t > 1 and doubles > 0:
        if t % 2 == 0:
            t //= 2
            doubles -= 1
        else:
            t -= 1
        moves += 1
    return moves + (t - 1)
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'halve', label: 'Undo a doubling', description: 'An even value is halved, using one doubling.' },
  { id: 'decrement', label: 'Undo an increment', description: 'An odd value, or no doublings left, is reduced by one.' },
  { id: 'finish', label: 'Only increments', description: 'With no doublings left, the rest is one increment per unit above 1.' },
  { id: 'done', label: 'Result', description: 'The total number of moves.' },
]

export function buildTrace({ target, maxDoubles }) {
  const frames = []
  let t = target
  let doubles = maxDoubles
  let moves = 0
  const rows = []
  frames.push({ phase: 'halve', activeLine: L('let t = target'), pythonLine: P('t = target'), message: `Start from ${target} with ${doubles} doublings to undo.`, rows: [], t, doubles, moves })
  while (t > 1 && doubles > 0) {
    const before = t
    let phase
    if (t % 2 === 0) { t /= 2; doubles--; phase = 'halve' }
    else { t -= 1; phase = 'decrement' }
    moves++
    rows.push({ move: moves, from: before, to: t, action: phase === 'halve' ? 'double (halved)' : 'increment (minus 1)', doublesLeft: doubles })
    frames.push({ phase, activeLine: L(t === before / 2 ? 't /= 2' : 't -= 1'), pythonLine: P(phase === 'halve' ? 't //= 2' : 't -= 1'), message: phase === 'halve' ? `${before} came from ${t} by doubling; ${doubles} doublings left.` : `${before} is odd, so one increment gives ${t}.`, rows: rows.map(r => ({ ...r })), t, doubles, moves })
  }
  const extra = t - 1
  if (t > 1) {
    frames.push({ phase: 'finish', activeLine: L('return moves +'), pythonLine: P('return moves +'), message: `No doublings left: ${t} needs ${extra} more increments.`, rows: rows.map(r => ({ ...r })), t, doubles, moves })
  }
  const result = moves + extra
  frames.push({ phase: 'done', activeLine: L('return moves +'), pythonLine: P('return moves +'), message: `Total moves: ${result}.`, rows: rows.map(r => ({ ...r })), t: 1, doubles, moves: result })
  return { input: { target, maxDoubles }, result, frames }
}
