export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with height, positions and directions.')
  const { height, positions, directions } = input
  if (!Number.isInteger(height) || height < 1 || height > 20) throw new Error('height is an integer from 1 to 20.')
  if (!Array.isArray(positions) || positions.length < 1 || positions.length > 8) throw new Error('positions lists 1 to 8 pistons.')
  if (!positions.every(x => Number.isInteger(x) && x >= 0 && x <= height)) throw new Error('Each position is an integer from 0 to height.')
  if (!Array.isArray(directions) || directions.length !== positions.length || !directions.every(d => d === 'up' || d === 'down')) throw new Error('directions has one "up" or "down" per piston.')
  return { height, positions, directions }
}

// Pistons bounce between 0 and height at unit speed, so each one repeats every 2 * height steps.
// The position at time t follows a triangle wave over that period.
function positionAt(x, direction, t, height) {
  const period = 2 * height
  const start = direction === 'up' ? x : period - x
  const u = (start + t) % period
  return u <= height ? u : period - u
}

export const code = `FUNCTION maxTotalArea(height, positions, directions)
    period ← 2 · height
    best ← 0
    FOR t from 0 to period − 1
        total ← 0
        FOR each piston i
            u ← positions[i] if it moves up, else period − positions[i]
            u ← (u + t) mod period
            total ← total + (u if u ≤ height else period − u)
        best ← larger of best and total
    RETURN best`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_total_area(height, positions, directions):
    period = 2 * height
    best = 0
    for t in range(period):
        total = 0
        for x, d in zip(positions, directions):
            u = x if d == "up" else period - x
            u = (u + t) % period
            total += u if u <= height else period - u
        best = max(best, total)
    return best


if __name__ == "__main__":
    import json
    import sys
    data = json.loads(sys.stdin.read())
    print(max_total_area(data["height"], data["positions"], data["directions"]))
`

const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ height, positions, directions }) {
  const period = 2 * height
  const frames = []
  let best = 0
  let bestTime = 0
  const history = []
  frames.push({
    phase: 'start', activeLine: L('period ← 2'), pythonLine: P('period = 2 * height'),
    t: -1, positions: positions.slice(), total: 0, best, bestTime, period, history: [],
    message: `Every piston repeats after ${period} time units (up and down a height of ${height}).`,
  })
  for (let t = 0; t < period; t++) {
    const at = directions.map((d, i) => positionAt(positions[i], d, t, height))
    const total = at.reduce((sum, p) => sum + p, 0)
    history.push(total)
    frames.push({
      phase: 'sweep', activeLine: L('total ← 0'), pythonLine: P('total = 0'),
      t, positions: at, total, best, bestTime, period, history: history.slice(),
      message: `At time ${t} the pistons sit at [${at.join(', ')}], a total area of ${total}.`,
    })
    if (total > best) {
      best = total
      bestTime = t
      frames.push({
        phase: 'best', activeLine: L('best ← larger'), pythonLine: P('best = max(best, total)'),
        t, positions: at, total, best, bestTime, period, history: history.slice(),
        message: `${total} beats the previous best, so the best time is now ${t}.`,
      })
    }
  }
  frames.push({
    phase: 'done', activeLine: L('RETURN best'), pythonLine: P('return best'),
    t: period, positions: positions.slice(), total: best, best, bestTime, period, history: history.slice(),
    message: `The largest total area is ${best}, first reached at time ${bestTime}.`,
  })
  return { input: { height, positions, directions }, result: best, frames }
}
