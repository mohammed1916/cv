import { SegTree } from '../../components/shared/segtreeModel.js'

export function parseInput(text) {
  const squares = JSON.parse(text)
  if (!Array.isArray(squares) || squares.length < 1 || squares.length > 100 || squares.some(s => !Array.isArray(s) || s.length !== 2 || !Number.isInteger(s[0]) || !Number.isInteger(s[1]) || s[0] < 1 || s[0] > 100 || s[1] < 1 || s[1] > 100)) throw new Error('Enter 1–100 squares as [left, side] pairs with integers from 1 to 100.')
  return squares
}

// Each square lands on the tallest surface under its span, then its top becomes the new height there.
export function buildTrace(squares) {
  const heights = new Map()
  const tops = []
  // The same drops on a lazy max/assign segment tree over the compressed x-coordinates (one leaf per gap between edges).
  const xs = [...new Set(squares.flatMap(([left, side]) => [left, left + side]))].sort((a, b) => a - b)
  const seg = new SegTree(Math.max(1, xs.length - 1), 'max-assign')
  const segView = (extra = {}) => ({ seg: { ...seg.snapshot(), coords: xs, title: 'Segment tree of heights (max, lazy assign)' }, ...extra })
  const frames = [{ phase: 'start', index: -1, span: null, landed: null, heights: [], activeLine: L('heights = empty map from column to height'), ...segView(), message: 'The ground is flat; each square lands on the tallest surface it touches.' }]
  let best = 0
  for (let i = 0; i < squares.length; i++) {
    const [left, side] = squares[i]
    const right = left + side
    let base = 0
    for (let x = left; x < right; x++) base = Math.max(base, heights.get(x) ?? 0)
    const top = base + side
    const from = xs.indexOf(left), to = xs.indexOf(right) - 1
    const segBase = seg.query(from, to)
    frames.push({ phase: 'drop', index: i, span: [left, right - 1], landed: base, top: null, heights: [...tops], activeLine: L('base = highest height'),...segView(), message: `Square ${i} spans [${left}, ${right - 1}]: query the maximum height under that span, which is ${segBase}.` })
    seg.update(from, to, segBase + side)
    for (let x = left; x < right; x++) heights.set(x, top)
    best = Math.max(best, top)
    tops.push(best)
    frames.push({ phase: 'drop', index: i, span: [left, right - 1], landed: base, top, heights: [...tops], activeLine: L('set every column in the span to top'),...segView(), message: `Square ${i} spans [${left}, ${right - 1}]: lands at ${base}, top ${top}. Tallest so far ${best}.` })
  }
  frames.push({ phase: 'done', index: squares.length - 1, span: null, landed: null, heights: [...tops], result: tops, activeLine: L('return out'),...segView(), message: `Tallest stack after each drop: [${tops.join(', ')}].` })
  return { input: squares, result: tops, frames }
}

export const code = `fallingSquares(positions):
  heights = empty map from column to height
  out = empty list, best = 0
  for each square [left, side] in positions
    base = highest height among columns left through left + side - 1, or 0 if none
    top = base + side
    set every column in the span to top
    best = larger of best and top
    append best to out
  return out`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def falling_squares(positions):
    heights = {}
    out, best = [], 0
    for left, side in positions:
        base = max((heights.get(x, 0) for x in range(left, left + side)), default=0)
        top = base + side
        for x in range(left, left + side):
            heights[x] = top
        best = max(best, top)
        out.append(best)
    return out`
