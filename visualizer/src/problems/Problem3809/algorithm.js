export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.towers) || !Array.isArray(input.center)) throw new Error('Use an object with towers and center.')
  const { towers, center, radius } = input
  if (towers.length < 1 || towers.length > 12) throw new Error('towers has 1 to 12 entries.')
  if (!towers.every(t => Array.isArray(t) && t.length === 3 && t.every(v => Number.isInteger(v) && v >= 0 && v <= 30))) throw new Error('Each tower is [x, y, q] with values 0 to 30.')
  if (!Array.isArray(center) || center.length !== 2 || !center.every(v => Number.isInteger(v) && v >= 0 && v <= 30)) throw new Error('center is [cx, cy] with values 0 to 30.')
  if (!Number.isInteger(radius) || radius < 0 || radius > 60) throw new Error('radius is an integer from 0 to 60.')
  return { towers, center, radius }
}

export function buildTrace({ towers, center, radius }) {
  const [cx, cy] = center
  const frames = []
  let best = null
  towers.forEach(([x, y, q], i) => {
    const distance = Math.abs(x - cx) + Math.abs(y - cy)
    const reachable = distance <= radius
    frames.push({ pythonLine: P('if distance <= radius'), phase: 'check', activeLine: C('if (distance <= radius)'), at: i, distance, reachable, best: best ? [...best.at] : null,
      message: `Tower ${i} at (${x}, ${y}) is ${distance} away; ${reachable ? 'reachable' : 'out of range'}.` })
    if (!reachable) return
    const better = !best || q > best.q || (q === best.q && (x < best.at[0] || (x === best.at[0] && y < best.at[1])))
    if (better) {
      best = { q, at: [x, y] }
      frames.push({ pythonLine: P('best = '), phase: 'best', activeLine: C('best = { q'), at: i, distance, reachable, best: [...best.at],
        message: `Quality ${q} becomes the best so far.` })
    }
  })
  const result = best ? best.at : [-1, -1]
  frames.push({ pythonLine: P('return'), phase: 'done', activeLine: C('return best ?'), at: -1, distance: null, reachable: null, best: result,
    message: best ? `Answer (${result[0]}, ${result[1]}).` : 'No tower is reachable, so the answer is [-1, -1].' })
  return { input: { towers, center, radius }, result, frames }
}

export function solve(input) {
  return buildTrace(input).result
}

export const code = `function bestReachableTower(towers, center, radius) {
  const [cx, cy] = center
  let best = null
  for (const [x, y, q] of towers) {
    const distance = Math.abs(x - cx) + Math.abs(y - cy)
    if (distance <= radius) {
      if (best === null || q > best.q || (q === best.q && (x < best.at[0] || (x === best.at[0] && y < best.at[1])))) {
        best = { q, at: [x, y] }
      }
    }
  }
  return best ? best.at : [-1, -1]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def best_reachable_tower(towers, center, radius):
    cx, cy = center
    best = None
    for x, y, q in towers:
        distance = abs(x - cx) + abs(y - cy)
        if distance <= radius:
            if best is None or q > best[0] or (q == best[0] and (x, y) < best[1]):
                best = (q, (x, y))
    return list(best[1]) if best else [-1, -1]
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
