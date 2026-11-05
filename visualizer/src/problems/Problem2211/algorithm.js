// LeetCode 2211: Count Collisions on a Road.
// Cars moving left ('L') at the start of the road drive off to the left and never collide; cars moving right ('R') at
// the end drive off to the right. Everything in between eventually collides, and every car in that middle
// section that is not stationary ('S') is involved in exactly one collision.

const MAX_LEN = 16

export function parseInput(text) {
  const s = String(text).trim().replace(/^"|"$/g, '')
  if (!/^[LRS]+$/.test(s)) throw new Error('Use only the letters L, R and S, e.g. RLRSLLRSLLR.')
  if (s.length > MAX_LEN) throw new Error(`Use at most ${MAX_LEN} cars. The visualization caps the road there.`)
  return { road: s }
}

export const code = `FUNCTION countCollisions(directions)
    left ← 0
    WHILE left < length AND directions[left] = 'L'
        left ← left + 1
    right ← length - 1
    WHILE right >= left AND directions[right] = 'R'
        right ← right - 1
    ans ← 0
    FOR i from left to right
        IF directions[i] is not 'S' THEN ans ← ans + 1
    RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_collisions(directions):
    left = 0
    while left < len(directions) and directions[left] == "L":
        left += 1
    right = len(directions) - 1
    while right >= left and directions[right] == "R":
        right -= 1
    ans = 0
    for i in range(left, right + 1):
        if directions[i] != "S":
            ans += 1
    return ans
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
  { id: 'left', label: 'Leave left', description: 'Leading L cars drive off to the left and are safe.' },
  { id: 'right', label: 'Leave right', description: 'Trailing R cars drive off to the right and are safe.' },
  { id: 'count', label: 'Collide', description: 'Every moving car in the middle collides once.' },
  { id: 'done', label: 'Result', description: 'The number of collisions.' },
]

export function buildTrace({ road }) {
  const n = road.length
  let left = 0
  while (left < n && road[left] === 'L') left++
  let right = n - 1
  while (right >= left && road[right] === 'R') right--
  const frames = []
  let ans = 0
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, road, left, right, ans, ...extra })
  push('left', left - 1, L('WHILE left < length'), P('while left < len'), `${left} leading L car(s) leave to the left.`)
  push('right', right + 1, L('WHILE right >= left'), P('while right >= left'), `${n - 1 - right} trailing R car(s) leave to the right.`)
  for (let i = left; i <= right; i++) {
    if (road[i] !== 'S') ans += 1
    push('count', i, L('IF directions[i] is not'), P('if directions[i] != "S"'),
      road[i] === 'S' ? `Car ${i} is stationary and adds nothing. Collisions ${ans}.` : `Car ${i} (${road[i]}) is in the middle and collides once. Collisions ${ans}.`, { counted: road[i] !== 'S' })
  }
  push('done', -1, L('RETURN ans'), P('return ans'), `${ans} collision(s) on the road.`, { result: ans })
  return { input: { road }, result: ans, frames }
}
