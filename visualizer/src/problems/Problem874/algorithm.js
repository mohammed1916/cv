export const code = `put all obstacles into a set for fast lookup
start at x = 0, y = 0, facing north (d = 0), with best = 0
for each command c in commands, do
  if c is -2, turn left: d becomes d - 1, taken mod 4
  else if c is -1, turn right: d becomes d + 1, taken mod 4
  else repeat c times, one unit at a time
    let (nx, ny) be the next cell one unit ahead in direction d
    if (nx, ny) is an obstacle, stop repeating for this command
    move to (nx, ny), and set best to the larger of best and x*x + y*y
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = (s) => code.findIndex((c) => c.text.includes(s)) + 1
const DIRS = ['north', 'east', 'south', 'west']

export const python = `def robot_sim(commands, obstacles):
    obs = {tuple(o) for o in obstacles}
    dx, dy = [0, 1, 0, -1], [1, 0, -1, 0]
    x = y = d = 0
    best = 0
    for c in commands:
        if c == -2:
            d = (d - 1) % 4
        elif c == -1:
            d = (d + 1) % 4
        else:
            for _ in range(c):
                nx, ny = x + dx[d], y + dy[d]
                if (nx, ny) in obs:
                    break
                x, y = nx, ny
                best = max(best, x * x + y * y)
    return best
`

export function parseInput(text) {
  let v
  try { v = JSON.parse(text) } catch { throw new Error('Input must be valid JSON: {"commands": [...], "obstacles": [[x,y],...]}') }
  if (!v || typeof v !== 'object' || !Array.isArray(v.commands) || !Array.isArray(v.obstacles)) throw new Error('Input must be an object with "commands" and "obstacles" arrays.')
  const { commands, obstacles } = v
  if (commands.length < 1 || commands.length > 30) throw new Error('commands must have 1 to 30 entries (visualization cap).')
  if (!commands.every((c) => c === -1 || c === -2 || (Number.isInteger(c) && c >= 1 && c <= 9))) throw new Error('Each command must be -2, -1, or an integer 1 to 9 (visualization cap).')
  if (obstacles.length > 30) throw new Error('obstacles may have at most 30 points (visualization cap).')
  for (const o of obstacles) if (!Array.isArray(o) || o.length !== 2 || !o.every((q) => Number.isInteger(q) && Math.abs(q) <= 30000)) throw new Error('Each obstacle must be [x, y] with integer coordinates.')
  return { commands: [...commands], obstacles: obstacles.map((o) => [...o]) }
}

export function buildTrace({ commands, obstacles }) {
  const obs = new Set(obstacles.map(([a, b]) => `${a},${b}`))
  const dx = [0, 1, 0, -1]; const dy = [1, 0, -1, 0]
  let x = 0; let y = 0; let d = 0; let best = 0
  const trail = [[0, 0]]
  const frames = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, x, y, d, best, cmd: -1, trail: trail.map((p) => [...p]), blocked: null, ...extra })
  push('start', L('put all obstacles'), 'Robot starts at (0, 0) facing north. Obstacles go into a set for O(1) lookup.')
  commands.forEach((c, ci) => {
    if (c === -2) {
      d = (d + 3) % 4
      push('turn', L('turn left'), `Command ${c}: turn left 90 degrees, now facing ${DIRS[d]}.`, { cmd: ci })
    } else if (c === -1) {
      d = (d + 1) % 4
      push('turn', L('turn right'), `Command ${c}: turn right 90 degrees, now facing ${DIRS[d]}.`, { cmd: ci })
    } else {
      push('move', L('repeat c times'), `Command ${c}: try to walk ${c} unit${c > 1 ? 's' : ''} ${DIRS[d]}, one unit at a time.`, { cmd: ci })
      for (let s = 0; s < c; s++) {
        const nx = x + dx[d]; const ny = y + dy[d]
        if (obs.has(`${nx},${ny}`)) {
          push('blocked', L('is an obstacle, stop'), `(${nx}, ${ny}) is an obstacle, so the robot stays at (${x}, ${y}) and abandons the rest of this command.`, { cmd: ci, blocked: [nx, ny] })
          break
        }
        x = nx; y = ny; trail.push([x, y])
        const dist = x * x + y * y
        const improved = dist > best
        best = Math.max(best, dist)
        push('move', L('move to (nx, ny)'), `Step to (${x}, ${y}): squared distance ${dist}${improved ? ' is a new maximum' : ` does not beat ${best}`}.`, { cmd: ci })
      }
    }
  })
  push('done', L('return best'), `Done: the farthest squared distance from the origin was ${best}.`)
  return { input: { commands, obstacles }, result: best, frames }
}
