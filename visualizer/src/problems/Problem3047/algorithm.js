export function parseInput(text) {
  const rects = JSON.parse(text)
  if (!Array.isArray(rects) || rects.length < 2 || rects.length > 8) throw new Error('Enter 2 to 8 rectangles as [x1, y1, x2, y2].')
  for (const r of rects) {
    if (!Array.isArray(r) || r.length !== 4 || !r.every(v => Number.isInteger(v) && v >= 0 && v <= 20)) throw new Error('Each rectangle is [x1, y1, x2, y2] with integers from 0 to 20.')
    if (r[0] >= r[2] || r[1] >= r[3]) throw new Error('Each rectangle needs x1 < x2 and y1 < y2 (bottom-left, then top-right).')
  }
  return rects
}

export function buildTrace(rects) {
  let best = 0
  const frames = [{ phase: 'start', pair: null, overlap: null, best, activeLine: L('set best to 0'), message: 'Compare every pair of rectangles. Their overlap is a box; its shorter side limits the square.' }]
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const [ax1, ay1, ax2, ay2] = rects[i]
      const [bx1, by1, bx2, by2] = rects[j]
      const w = Math.min(ax2, bx2) - Math.max(ax1, bx1)
      const h = Math.min(ay2, by2) - Math.max(ay1, by1)
      let side = 0
      if (w > 0 && h > 0) {
        side = Math.min(w, h)
        best = Math.max(best, side * side)
      }
      const message = side > 0
        ? `Rectangles ${i} and ${j} overlap in ${w} by ${h}; the largest square is ${side} by ${side}, area ${side * side}.`
        : `Rectangles ${i} and ${j} do not overlap in both directions, so they share no square.`
      frames.push({ phase: 'pair', pair: [i, j], overlap: { w, h, side }, best, activeLine: L('take the shorter side'), message })
    }
  }
  frames.push({ phase: 'done', pair: null, overlap: null, best, activeLine: L('return best'), message: `Largest square area: ${best}.` })
  return { input: rects, result: best, frames }
}

export const code = `largest square area inside two rectangles from a list of rectangles
  set best to 0
  for each pair of rectangles a and b
    find the overlap width as the smaller right edge minus the larger left edge
    find the overlap height the same way with the top and bottom edges
    if both overlap sizes are positive then
      take the shorter side of the overlap as the square side
      set best to the larger of best and side times side
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_square_area(rectangles):
    best = 0
    for i in range(len(rectangles)):
        for j in range(i + 1, len(rectangles)):
            ax1, ay1, ax2, ay2 = rectangles[i]
            bx1, by1, bx2, by2 = rectangles[j]
            width = min(ax2, bx2) - max(ax1, bx1)
            height = min(ay2, by2) - max(ay1, by1)
            if width > 0 and height > 0:
                side = min(width, height)
                best = max(best, side * side)
    return best
`
