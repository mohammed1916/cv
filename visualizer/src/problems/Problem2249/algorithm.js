const MAX_CIRCLES = 6

export function parseInput(text) {
  const data = JSON.parse(text)
  const circles = data?.circles
  if (!Array.isArray(circles) || circles.length < 1 || circles.length > MAX_CIRCLES) throw new Error(`circles must list 1 to ${MAX_CIRCLES} entries.`)
  for (const c of circles) {
    if (!Array.isArray(c) || c.length !== 3) throw new Error('Each circle is [x, y, r].')
    const [x, y, r] = c
    if (![x, y].every(v => Number.isInteger(v) && v >= -6 && v <= 6)) throw new Error('Centres are integers from -6 to 6.')
    if (!Number.isInteger(r) || r < 1 || r > 4) throw new Error('Radii are integers from 1 to 4.')
  }
  return { circles }
}

export const code = `count lattice points(circles)
  set lo and hi to the square box that contains every circle
  set count to 0
  for each integer point (x, y) in the box
    if some circle has (x - cx)^2 + (y - cy)^2 at most r^2 then
      add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// The points are scanned row by row inside the box around all circles, and each point is tested against every circle.
export function buildTrace({ circles }) {
  const xs = circles.flatMap(([x, , r]) => [x - r, x + r])
  const ys = circles.flatMap(([, y, r]) => [y - r, y + r])
  const loX = Math.min(...xs)
  const hiX = Math.max(...xs)
  const loY = Math.min(...ys)
  const hiY = Math.max(...ys)
  const frames = [{ phase: 'start', index: -1, x: null, y: null, inside: false, count: 0, flags: null, activeLine: L('set lo and hi'), message: `Scan the box x from ${loX} to ${hiX}, y from ${loY} to ${hiY}.` }]
  const flags = []
  let count = 0
  let index = 0
  for (let y = loY; y <= hiY; y++) {
    for (let x = loX; x <= hiX; x++) {
      const inside = circles.some(([cx, cy, r]) => (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r)
      if (inside) count++
      flags.push(inside)
      frames.push({ phase: 'point', index, x, y, inside, count, flags: [...flags], activeLine: L(inside ? 'add 1 to count' : 'if some circle'), message: inside ? `(${x}, ${y}) lies in a circle: count ${count}.` : `(${x}, ${y}) lies in no circle.` })
      index++
    }
  }
  frames.push({ phase: 'done', index: -1, x: null, y: null, inside: false, count, flags: [...flags], activeLine: L('return count'), result: count, message: `${count} lattice points lie inside or on at least one circle.` })
  return { input: { circles }, result: count, width: hiX - loX + 1, box: { loX, hiX, loY, hiY }, frames }
}

export const python = `def count_lattice_points(circles):
    lo_x = min(x - r for x, y, r in circles)
    hi_x = max(x + r for x, y, r in circles)
    lo_y = min(y - r for x, y, r in circles)
    hi_y = max(y + r for x, y, r in circles)
    count = 0
    for py in range(lo_y, hi_y + 1):
        for px in range(lo_x, hi_x + 1):
            if any((px - cx) ** 2 + (py - cy) ** 2 <= r * r for cx, cy, r in circles):
                count += 1
    return count
`
