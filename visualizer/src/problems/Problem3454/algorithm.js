const MAX_SQUARES = 6
const MAX_COORD = 10
const MAX_SIDE = 5

// Code panel: real JavaScript for the strip sweep.
export const code = [
  "function unionWidth(spans) {",
  "  let width = 0, current = null;",
  "  for (const [s, e] of spans) {",
  "    if (current === null) current = [s, e];",
  "    else if (s <= current[1]) current[1] = Math.max(current[1], e);",
  "    else { width += current[1] - current[0]; current = [s, e]; }",
  "  }",
  "  return current === null ? width : width + current[1] - current[0];",
  "}",
  "function minSeparatingY(squares) {",
  "  const edges = [...new Set(squares.flatMap(([, y, side]) => [y, y + side]))].sort((a, b) => a - b);",
  "  const strips = [];",
  "  for (let i = 0; i + 1 < edges.length; i++) {",
  "    const lo = edges[i], hi = edges[i + 1];",
  "    const spans = squares.filter(([, y, side]) => y <= lo && y + side >= hi).map(([x, , side]) => [x, x + side]).sort((a, b) => a[0] - b[0]);",
  "    const width = unionWidth(spans);",
  "    strips.push({ lo, hi, width, area: width * (hi - lo) });",
  "  }",
  "  const half = strips.reduce((sum, st) => sum + st.area, 0) / 2;",
  "  let cumulative = 0;",
  "  for (const { lo, hi, width, area } of strips) {",
  "    if (area > 0 && cumulative + area >= half) return lo + (half - cumulative) / width;",
  "    cumulative += area;",
  "  }",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def union_width(spans):
    width = 0
    current = None
    for s, e in spans:
        if current is None:
            current = [s, e]
        elif s <= current[1]:
            current[1] = max(current[1], e)
        else:
            width += current[1] - current[0]
            current = [s, e]
    return width if current is None else width + current[1] - current[0]

def min_separating_y(squares):
    edges = sorted({v for _, y, side in squares for v in (y, y + side)})
    strips = []
    for lo, hi in zip(edges, edges[1:]):
        spans = sorted((x, x + side) for x, y, side in squares if y <= lo and y + side >= hi)
        width = union_width(spans)
        strips.append((lo, hi, width, width * (hi - lo)))
    half = sum(area for _, _, _, area in strips) / 2
    cumulative = 0
    for lo, hi, width, area in strips:
        if area > 0 and cumulative + area >= half:
            return lo + (half - cumulative) / width
        cumulative += area
`

const pyLine = text => python.split('\n').findIndex(line => line.includes(text)) + 1
const jsLine = text => code.findIndex(c => c.text.includes(text)) + 1

export function parseInput(text) {
  const data = JSON.parse(text)
  const squares = data?.squares
  if (!Array.isArray(squares) || squares.length < 1 || squares.length > MAX_SQUARES) throw new Error(`squares must list 1 to ${MAX_SQUARES} squares.`)
  for (const sq of squares) {
    if (!Array.isArray(sq) || sq.length !== 3 || !sq.every(Number.isInteger)) throw new Error('Each square is [x, y, side] with integers.')
    const [x, y, side] = sq
    if (x < 0 || y < 0 || x > MAX_COORD || y > MAX_COORD) throw new Error(`Corners run from 0 to ${MAX_COORD}.`)
    if (side < 1 || side > MAX_SIDE) throw new Error(`Side lengths run from 1 to ${MAX_SIDE}.`)
  }
  return { squares }
}

// Total length covered by a set of [start, end] spans, counting overlaps once.
function unionWidth(spans) {
  let width = 0
  let current = null
  for (const [s, e] of spans) {
    if (current === null) current = [s, e]
    else if (s <= current[1]) current[1] = Math.max(current[1], e)
    else { width += current[1] - current[0]; current = [s, e] }
  }
  if (current !== null) width += current[1] - current[0]
  return width
}

export function buildTrace({ squares }) {
  const edges = [...new Set(squares.flatMap(([, y, side]) => [y, y + side]))].sort((a, b) => a - b)
  const strips = []
  for (let i = 0; i + 1 < edges.length; i++) {
    const lo = edges[i]
    const hi = edges[i + 1]
    const spans = squares
      .filter(([, y, side]) => y <= lo && y + side >= hi)
      .map(([x, , side]) => [x, x + side])
      .sort((a, b) => a[0] - b[0])
    const width = unionWidth(spans)
    strips.push({ lo, hi, width, area: width * (hi - lo), covering: spans.length })
  }
  const total = strips.reduce((sum, st) => sum + st.area, 0)
  const half = total / 2
  const frames = [{ pythonLine: pyLine('edges = sorted'), activeLine: jsLine('const edges'), phase: 'start', index: -1, strips, cumulative: 0,
    message: `Edges: ${edges.join(', ')}. Total union area ${total}, so each side must reach ${half}.` }]
  let cumulative = 0
  let result = null
  for (let i = 0; i < strips.length; i++) {
    const st = strips[i]
    frames.push({ pythonLine: pyLine('width = union_width'), activeLine: jsLine('const width = unionWidth'), phase: 'strip', index: i, strips, cumulative,
      message: `Strip y ${st.lo} to ${st.hi}: ${st.covering} square${st.covering === 1 ? '' : 's'} cover it, union width ${st.width}, area ${st.area}.` })
    if (result === null && st.area > 0 && cumulative + st.area >= half) {
      result = st.lo + (half - cumulative) / st.width
      frames.push({ pythonLine: pyLine('return lo +'), activeLine: jsLine('return lo +'), phase: 'walk', index: i, strips, cumulative,
        message: `Half the area is ${half}; it is reached inside this strip at y = ${result}.` })
      break
    }
    cumulative += st.area
  }
  frames.push({ pythonLine: pyLine('return lo +'), activeLine: jsLine('return lo +'), phase: 'done', index: -1, strips, cumulative,
    message: `Minimum y with equal area above and below: ${result}.` })
  return { input: { squares }, squares, result, frames }
}
