const PHASES = [
  { id: 'start', label: 'Line up', description: 'Each robot is its own group, moving right at its speed.' },
  { id: 'merge', label: 'Merge', description: 'The earliest adjacent pair that comes within distance joins; the merged group keeps the right robot trajectory.' },
  { id: 'done', label: 'Groups', description: 'No adjacent pair will ever come within distance; count the groups.' },
]

export const phases = PHASES

export const code = `function countRobotGroups(position, speed, distance) {
  const groups = position.map((_, i) => i)
  let now = 0
  for (;;) {
    let best = null
    for (let k = 0; k + 1 < groups.length; k++) {
      const left = groups[k]
      const right = groups[k + 1]
      const gap = position[right] - position[left]
      let t = null
      if (gap + (speed[right] - speed[left]) * now <= distance) t = now
      else if (speed[left] > speed[right]) t = (gap - distance) / (speed[left] - speed[right])
      if (t !== null && (best === null || t < best.time)) best = { time: t, k }
    }
    if (best === null) break
    now = best.time
    groups.splice(best.k, 1)
  }
  return groups.length
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `from fractions import Fraction

def count_robot_groups(positions, speeds, d):
    groups = list(range(len(positions)))
    cur = Fraction(0)
    while True:
        best = None
        for k in range(len(groups) - 1):
            left, right = groups[k], groups[k + 1]
            gap0 = positions[right] - positions[left]
            v = speeds[right] - speeds[left]
            if gap0 + v * cur <= d:
                t = cur
            elif v >= 0:
                continue
            else:
                t = Fraction(gap0 - d, speeds[left] - speeds[right])
            if best is None or t < best[0]:
                best = (t, k)
        if best is None:
            break
        cur, k = best
        groups.pop(k)
    return len(groups)
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with positions, speeds and distance.')
  const { positions, speeds, distance } = input
  if (!Array.isArray(positions) || !Array.isArray(speeds) || positions.length !== speeds.length) throw new Error('positions and speeds have equal lengths.')
  if (positions.length < 1 || positions.length > 8) throw new Error('The visualization takes 1 to 8 robots.')
  if (!positions.every((p, i) => Number.isInteger(p) && p >= 1 && p <= 1e9 && (i === 0 || p > positions[i - 1]))) {
    throw new Error('positions are integers from 1 to 10^9, strictly increasing.')
  }
  if (!speeds.every(s => Number.isInteger(s) && s >= 1 && s <= 1e9)) throw new Error('speeds are integers from 1 to 10^9.')
  if (!Number.isInteger(distance) || distance < 1 || distance > 1e9) throw new Error('distance is an integer from 1 to 10^9.')
  return { positions, speeds, distance }
}

// Earliest time at or after cur when the gap between two trajectories is at most d, as an exact fraction.
function fraction(n, d) {
  return d < 0n ? { n: -n, d: -d } : { n, d }
}

function less(a, b) {
  return a.n * b.d < b.n * a.d
}

export function buildTrace({ positions, speeds, distance }) {
  const P0 = positions.map(BigInt)
  const S = speeds.map(BigInt)
  const D = BigInt(distance)
  const groups = positions.map((_, i) => i)
  const frames = []
  let cur = { n: 0n, d: 1n }
  const timeText = t => (Number(t.n) / Number(t.d)).toFixed(3).replace(/\.?0+$/, '') || '0'
  frames.push({ pythonLine: P('def count_robot_groups'), phase: 'start', activeLine: L('const groups = position.map'), groups: [...groups], time: 0, left: null, right: null, message: `${groups.length} robots, each its own group; merge distance ${distance}.` })
  for (;;) {
    let best = null
    for (let k = 0; k < groups.length - 1; k++) {
      const left = groups[k]
      const right = groups[k + 1]
      const gap0 = P0[right] - P0[left]
      const v = S[right] - S[left]
      // gap(cur) = gap0 + v * cur; compare as a fraction to avoid rounding.
      const gapNow = { n: gap0 * cur.d + v * cur.n, d: cur.d }
      let t
      if (gapNow.n <= D * cur.d) t = cur
      else if (v >= 0n) continue
      else t = fraction(gap0 * 1n - D, S[left] - S[right])
      t = { n: t.n, d: t.d }
      if (best === null || less(t, best.t)) best = { t, k, left, right }
    }
    if (best === null) break
    cur = best.t
    groups.splice(best.k, 1)
    frames.push({ pythonLine: P('groups.pop(k)'), phase: 'merge', activeLine: L('groups.splice(best.k, 1)'), groups: [...groups], time: timeText(cur), left: best.left, right: best.right, message: `At time ${timeText(cur)} robot ${best.left} reaches robot ${best.right}'s group and joins it; ${groups.length} group${groups.length === 1 ? '' : 's'} remain.` })
  }
  frames.push({ pythonLine: P('return len(groups)'), phase: 'done', activeLine: L('return groups.length'), groups: [...groups], time: null, left: null, right: null, message: `${groups.length} group${groups.length === 1 ? '' : 's'} at the end.` })
  return { input: { positions, speeds, distance }, result: groups.length, frames }
}
