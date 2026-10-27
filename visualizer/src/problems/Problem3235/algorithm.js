const MAX_SIDE = 10
const MAX_CIRCLES = 5

export function parseInput(text) {
  const data = JSON.parse(text)
  const { x, y, circles } = data ?? {}
  if (!Number.isInteger(x) || x < 1 || x > MAX_SIDE) throw new Error(`x must be an integer from 1 to ${MAX_SIDE}.`)
  if (!Number.isInteger(y) || y < 1 || y > MAX_SIDE) throw new Error(`y must be an integer from 1 to ${MAX_SIDE}.`)
  if (!Array.isArray(circles) || circles.length < 1 || circles.length > MAX_CIRCLES) throw new Error(`circles must list 1 to ${MAX_CIRCLES} entries.`)
  for (const c of circles) {
    if (!Array.isArray(c) || c.length !== 3) throw new Error('Each circle is [cx, cy, r].')
    const [cx, cy, r] = c
    if (![cx, cy].every(v => Number.isInteger(v) && v >= 0 && v <= MAX_SIDE)) throw new Error('Centres are integers from 0 to 10.')
    if (!Number.isInteger(r) || r < 1 || r > 5) throw new Error('Radii are integers from 1 to 5.')
  }
  return { x, y, circles }
}

export const code = `corner reachable(x, y, circles)
  if the start corner or the target corner is inside a circle then return false
  set reached to the circles that touch the top or left edge
  while there is an unvisited circle c in reached
    if c touches the bottom or right edge then return false
    add every circle that overlaps c to reached
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// A circle that touches the top or left edge and one that touches the bottom or right edge
// form a wall between the two corners. Distances to the edges are compared exactly in squared integers.
export function buildTrace({ x, y, circles }) {
  const sq = v => v * v
  const inside = (cx, cy, r, px, py) => sq(px - cx) + sq(py - cy) <= r * r
  const touchesTopLeft = ([cx, cy, r]) => sq(cx) + sq(cy - clamp(cy, 0, y)) <= r * r
    || sq(cy - y) + sq(cx - clamp(cx, 0, x)) <= r * r
  const touchesBottomRight = ([cx, cy, r]) => sq(cy) + sq(cx - clamp(cx, 0, x)) <= r * r
    || sq(cx - x) + sq(cy - clamp(cy, 0, y)) <= r * r
  const overlaps = (a, b) => sq(a[0] - b[0]) + sq(a[1] - b[1]) <= sq(a[2] + b[2])
  const describe = c => `circle (${c[0]}, ${c[1]}) r=${c[2]}`
  const frames = []
  const seen = circles.map(() => false)
  const stack = []
  const blockedStart = circles.find(c => inside(c[0], c[1], c[2], 0, 0) || inside(c[0], c[1], c[2], x, y))
  if (blockedStart) {
    frames.push({ phase: 'corner', circle: circles.indexOf(blockedStart), seen: [...seen], activeLine: L('if the start corner'), message: `${describe(blockedStart)} covers the start or target corner.` })
    frames.push({ phase: 'done', circle: null, seen: [...seen], activeLine: L('return false'), result: false, message: 'The corner cannot be reached.' })
    return { input: { x, y, circles }, result: false, frames }
  }
  frames.push({ phase: 'corner', circle: null, seen: [...seen], activeLine: L('if the start corner'), message: 'Neither corner is covered by a circle.' })
  circles.forEach((c, i) => {
    if (touchesTopLeft(c)) { seen[i] = true; stack.push(i) }
  })
  frames.push({ phase: 'reach', circle: null, seen: [...seen], activeLine: L('set reached to'), message: 'Circles touching the top or left edge start the wall.' })
  let result = true
  while (stack.length) {
    const i = stack.pop()
    frames.push({ phase: 'visit', circle: i, seen: [...seen], activeLine: L('while there is an unvisited'), message: `Visit ${describe(circles[i])}.` })
    if (touchesBottomRight(circles[i])) {
      result = false
      frames.push({ phase: 'wall', circle: i, seen: [...seen], activeLine: L('if c touches the bottom'), message: `${describe(circles[i])} also touches the bottom or right edge, closing the wall.` })
      break
    }
    circles.forEach((other, j) => {
      if (!seen[j] && overlaps(circles[i], other)) { seen[j] = true; stack.push(j) }
    })
  }
  frames.push({ phase: 'done', circle: null, seen: [...seen], activeLine: L('return true'), result, message: result ? 'No wall separates the corners, so the target corner is reachable.' : 'A wall separates the corners, so the target corner is unreachable.' })
  return { input: { x, y, circles }, result, frames }
}

export const python = `def can_reach_corner(x, y, circles):
    def clamp(v, lo, hi):
        return max(lo, min(hi, v))

    def inside(cx, cy, r, px, py):
        return (px - cx) ** 2 + (py - cy) ** 2 <= r * r

    def touches_top_left(cx, cy, r):
        return (cx ** 2 + (cy - clamp(cy, 0, y)) ** 2 <= r * r
                or (cy - y) ** 2 + (cx - clamp(cx, 0, x)) ** 2 <= r * r)

    def touches_bottom_right(cx, cy, r):
        return (cy ** 2 + (cx - clamp(cx, 0, x)) ** 2 <= r * r
                or (cx - x) ** 2 + (cy - clamp(cy, 0, y)) ** 2 <= r * r)

    for cx, cy, r in circles:
        if inside(cx, cy, r, 0, 0) or inside(cx, cy, r, x, y):
            return False
    seen = [False] * len(circles)
    stack = []
    for i, (cx, cy, r) in enumerate(circles):
        if touches_top_left(cx, cy, r):
            seen[i] = True
            stack.append(i)
    while stack:
        i = stack.pop()
        cx, cy, r = circles[i]
        if touches_bottom_right(cx, cy, r):
            return False
        for j, (dx, dy, s) in enumerate(circles):
            if not seen[j] and (cx - dx) ** 2 + (cy - dy) ** 2 <= (r + s) ** 2:
                seen[j] = True
                stack.append(j)
    return True
`
