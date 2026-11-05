export function parseInput(text) {
  const data = JSON.parse(text)
  const { rec1, rec2 } = data ?? {}
  const ok = r => Array.isArray(r) && r.length === 4 && r.every(v => Number.isInteger(v) && v >= -1000 && v <= 1000) && r[0] < r[2] && r[1] < r[3]
  if (!ok(rec1) || !ok(rec2)) throw new Error('Each rectangle is [x1, y1, x2, y2] with x1 < x2 and y1 < y2, coordinates from -1,000 to 1,000.')
  return { rec1, rec2 }
}

const JS_LINES = [
  'function isRectangleOverlap(rec1, rec2) {',
  '  const [ax1, ay1, ax2, ay2] = rec1',
  '  const [bx1, by1, bx2, by2] = rec2',
  '  // Overlap needs a positive width and height: each rectangle starts before the other ends.',
  '  const overlapX = ax1 < bx2 && bx1 < ax2',
  '  const overlapY = ay1 < by2 && by1 < ay2',
  '  return overlapX && overlapY // touching edges do not count as overlap',
  '}',
]
const PY_LINES = [
  'def is_rectangle_overlap(rec1, rec2):',
  '    ax1, ay1, ax2, ay2 = rec1',
  '    bx1, by1, bx2, by2 = rec2',
  '    overlap_x = ax1 < bx2 and bx1 < ax2',
  '    overlap_y = ay1 < by2 and by1 < ay2',
  '    return overlap_x and overlap_y',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Two axis-aligned rectangles overlap when their x-ranges overlap and their y-ranges overlap, with strict inequalities.
export function buildTrace({ rec1, rec2 }) {
  const [ax1, ay1, ax2, ay2] = rec1
  const [bx1, by1, bx2, by2] = rec2
  const overlapX = ax1 < bx2 && bx1 < ax2
  const overlapY = ay1 < by2 && by1 < ay2
  const result = overlapX && overlapY
  const frames = [
    { phase: 'x', rec1, rec2, axis: 'x', ok: overlapX, activeLine: L('const overlapX'), pythonLine: P('overlap_x ='), message: `x ranges [${ax1}, ${ax2}] and [${bx1}, ${bx2}] ${overlapX ? 'overlap' : 'do not overlap'}.` },
    { phase: 'y', rec1, rec2, axis: 'y', ok: overlapY, activeLine: L('const overlapY'), pythonLine: P('overlap_y ='), message: `y ranges [${ay1}, ${ay2}] and [${by1}, ${by2}] ${overlapY ? 'overlap' : 'do not overlap'}.` },
    { phase: 'done', rec1, rec2, axis: null, ok: result, result, activeLine: L('return overlapX'), pythonLine: P('return overlap_x'), message: result ? 'Both ranges overlap, so the rectangles share area.' : 'At least one axis has no overlap, so the rectangles are apart or only touch.' },
  ]
  return { input: { rec1, rec2 }, result, frames }
}
