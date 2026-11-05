// LeetCode 1964: keep tails[k] = smallest last height of a non-decreasing course of length k + 1. Each obstacle replaces the first tail taller than it (binary search), and its course length is that position + 1.
const SOURCE = [
  "function longestObstacleCourse(obstacles) {",
  "  const tails = [], ans = []",
  "  for (const x of obstacles) {",
  "    let lo = 0, hi = tails.length",
  "    while (lo < hi) {",
  "      const mid = (lo + hi) >> 1",
  "      if (tails[mid] <= x) lo = mid + 1",
  "      else hi = mid",
  "    }",
  "    if (lo === tails.length) tails.push(x)",
  "    else tails[lo] = x",
  "    ans.push(lo + 1)",
  "  }",
  "  return ans",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `from bisect import bisect_right

def longest_obstacle_course(obstacles):
    tails = []
    ans = []
    for x in obstacles:
        pos = bisect_right(tails, x)
        if pos == len(tails):
            tails.append(x)
        else:
            tails[pos] = x
        ans.append(pos + 1)
    return ans
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'place', label: 'Place obstacle', description: 'Find where this obstacle lands in the tails list.' },
  { id: 'done', label: 'Result', description: 'Longest course ending at each position.' },
]

export function parseInput(text) {
  let obstacles
  try { obstacles = JSON.parse(text) } catch { throw new Error('Enter a JSON array of heights, for example [1,2,3,2].') }
  if (!Array.isArray(obstacles) || obstacles.length < 1 || obstacles.length > 14 || !obstacles.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Use 1 to 14 heights from 1 to 1000.')
  return { obstacles }
}

export function buildTrace({ obstacles }) {
  const tails = []
  const ans = []
  const frames = []
  obstacles.forEach((x, i) => {
    let lo = 0, hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] <= x) lo = mid + 1
      else hi = mid
    }
    const pos = lo
    const appended = pos === tails.length
    if (appended) tails.push(x)
    else tails[pos] = x
    ans.push(pos + 1)
    frames.push({ phase: 'place', activeLine: L(appended ? 'tails.push(x)' : 'else tails[lo] = x'), pythonLine: P(appended ? 'tails.append(x)' : 'tails[pos] = x'), message: `Obstacle ${x} at index ${i} joins a course of length ${pos + 1}.`, i, x, pos, tails: [...tails], ans: [...ans] })
  })
  frames.push({ phase: 'done', activeLine: L('return ans'), pythonLine: P('return ans'), message: 'Longest course ending at each obstacle is recorded.', i: -1, x: null, pos: null, tails: [...tails], ans: [...ans] })
  return { input: { obstacles }, result: ans, frames }
}
