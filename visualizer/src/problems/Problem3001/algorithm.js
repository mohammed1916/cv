export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || typeof o !== 'object') throw new Error('Use an object with integers a, b, c, d, e and f.')
  const keys = ['a', 'b', 'c', 'd', 'e', 'f']
  for (const k of keys) if (!Number.isInteger(o[k]) || o[k] < 1 || o[k] > 8) throw new Error(`${k} must be an integer from 1 to 8.`)
  const squares = [[o.a, o.b], [o.c, o.d], [o.e, o.f]].map(p => p.join(','))
  if (new Set(squares).size !== 3) throw new Error('The rook, bishop and queen must stand on different squares.')
  return { a: o.a, b: o.b, c: o.c, d: o.d, e: o.e, f: o.f }
}

// True when some square strictly between from and to (on a line or diagonal) holds the blocker.
function blocked(from, to, blocker) {
  const dr = Math.sign(to[0] - from[0])
  const dc = Math.sign(to[1] - from[1])
  const steps = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]))
  for (let s = 1; s < steps; s++) if (from[0] + s * dr === blocker[0] && from[1] + s * dc === blocker[1]) return true
  return false
}

export function buildTrace({ a, b, c, d, e, f }) {
  const rook = [a, b]
  const bishop = [c, d]
  const queen = [e, f]
  const rookHits = (a === e || b === f) && !blocked(rook, queen, bishop)
  const bishopHits = Math.abs(c - e) === Math.abs(d - f) && !blocked(bishop, queen, rook)
  const frames = [{ phase: 'rook', activeLine: L('if the rook can reach'), rook, bishop, queen, found: rookHits, message: `Rook at (${a}, ${b}) ${rookHits ? 'can' : 'cannot'} capture the queen at (${e}, ${f}) in one move.` }]
  if (rookHits) {
    frames.push({ phase: 'done', activeLine: L('return 1'), rook, bishop, queen, found: true, message: 'The rook captures the queen in one move.' })
    return { input: { a, b, c, d, e, f }, result: 1, frames, rook, bishop, queen }
  }
  frames.push({ phase: 'bishop', activeLine: L('if the bishop can reach'), rook, bishop, queen, found: bishopHits, message: `Bishop at (${c}, ${d}) ${bishopHits ? 'can' : 'cannot'} capture the queen in one move.` })
  if (bishopHits) {
    frames.push({ phase: 'done', activeLine: L('return 1'), rook, bishop, queen, found: true, message: 'The bishop captures the queen in one move.' })
    return { input: { a, b, c, d, e, f }, result: 1, frames, rook, bishop, queen }
  }
  frames.push({ phase: 'done', activeLine: L('return 2'), rook, bishop, queen, found: false, message: 'Neither piece reaches the queen in one move, so two moves are needed.' })
  return { input: { a, b, c, d, e, f }, result: 2, frames, rook, bishop, queen }
}

export const code = `minimum moves for the rook or bishop to capture the queen
  if the rook can reach the queen in one move without the bishop in the way then
    return 1
  if the bishop can reach the queen in one move without the rook in the way then
    return 1
  return 2`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_moves_to_capture_the_queen(a, b, c, d, e, f):
    def blocked(start, end, blocker):
        dr = (end[0] > start[0]) - (end[0] < start[0])
        dc = (end[1] > start[1]) - (end[1] < start[1])
        steps = max(abs(end[0] - start[0]), abs(end[1] - start[1]))
        return any(start[0] + s * dr == blocker[0] and start[1] + s * dc == blocker[1] for s in range(1, steps))

    rook, bishop, queen = (a, b), (c, d), (e, f)
    if (a == e or b == f) and not blocked(rook, queen, bishop):
        return 1
    if abs(c - e) == abs(d - f) and not blocked(bishop, queen, rook):
        return 1
    return 2
`
