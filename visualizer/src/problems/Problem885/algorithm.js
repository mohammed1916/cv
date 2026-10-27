const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]
const NAMES = ['east', 'south', 'west', 'north']

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length !== 4 || arr.some(v => !Number.isInteger(v))) throw new Error('Enter a JSON array [rows, cols, rStart, cStart].')
  const [rows, cols, r, c] = arr
  if (rows < 1 || cols < 1 || rows > 12 || cols > 12) throw new Error('rows and cols must be between 1 and 12 (visualization cap).')
  if (r < 0 || r >= rows || c < 0 || c >= cols) throw new Error('The start cell must lie inside the grid.')
  return { rows, cols, rStart: r, cStart: c }
}

export function buildTrace({ rows, cols, rStart, cStart }) {
  const order = Array.from({ length: rows }, () => Array(cols).fill(''))
  const res = [[rStart, cStart]]
  order[rStart][cStart] = 1
  const snap = () => order.map(row => [...row])
  let r = rStart, c = cStart, d = 0, step = 1
  const frames = [{ phase: 'start', grid: snap(), pos: [r, c], dir: d, step, count: 1, activeLine: L('let res start as'), message: `Record the start cell (${r}, ${c}) first, then spiral clockwise beginning eastward with legs of length 1, 1, 2, 2, 3, 3, ...` }]
  while (res.length < rows * cols) {
    for (let leg = 0; leg < 2; leg++) {
      for (let s = 0; s < step; s++) {
        r += DIRS[d][0]
        c += DIRS[d][1]
        const inside = r >= 0 && r < rows && c >= 0 && c < cols
        if (inside) {
          res.push([r, c])
          order[r][c] = res.length
          frames.push({ phase: 'record', grid: snap(), pos: [r, c], dir: d, step, count: res.length, activeLine: L('append (r, c) to res'), message: `Step ${NAMES[d]} to (${r}, ${c}), inside the grid: it is visited number ${res.length}.` })
        } else {
          frames.push({ phase: 'walk', grid: snap(), pos: [r, c], dir: d, step, count: res.length, activeLine: L('record nothing'), message: `Step ${NAMES[d]} to (${r}, ${c}), outside the grid: keep walking but record nothing.` })
        }
        if (res.length === rows * cols) break
      }
      if (res.length === rows * cols) break
      d = (d + 1) % 4
      frames.push({ phase: 'turn', grid: snap(), pos: [r, c], dir: d, step, count: res.length, activeLine: L('turn clockwise'), message: `Leg of ${step} finished: turn clockwise to face ${NAMES[d]}.` })
    }
    if (res.length === rows * cols) break
    step += 1
    frames.push({ phase: 'turn', grid: snap(), pos: [r, c], dir: d, step, count: res.length, activeLine: L('make the next legs one longer'), message: `After two legs the spiral widens: each leg is now ${step} steps long.` })
  }
  frames.push({ phase: 'done', grid: snap(), pos: [r, c], dir: d, step, count: res.length, activeLine: L('return res'), message: `All ${rows * cols} cells visited. Return the coordinates in visiting order.` })
  return { input: { rows, cols, rStart, cStart }, result: res, frames }
}

export const code = `let res start as [(rStart, cStart)], the start cell, already visited
let (r, c) be (rStart, cStart), direction d be east (0), and leg length step be 1
while res holds fewer than rows * cols cells, do
  repeat two times, once per leg of length step
    repeat step times, moving one cell in direction d
      if (r, c) is inside the grid, append (r, c) to res
      otherwise, keep walking but record nothing
      if res is full, stop at once
    turn clockwise: d becomes d + 1, taken mod 4
  make the next legs one longer: step becomes step + 1
return res`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def spiral_matrix_iii(rows, cols, rStart, cStart):
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    res = [[rStart, cStart]]
    r, c, d, step = rStart, cStart, 0, 1
    while len(res) < rows * cols:
        for _ in range(2):
            for _ in range(step):
                r += dirs[d][0]
                c += dirs[d][1]
                if 0 <= r < rows and 0 <= c < cols:
                    res.append([r, c])
            d = (d + 1) % 4
        step += 1
    return res
`
