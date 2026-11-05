export function parseInput(text) {
  const squares = JSON.parse(text)
  if (!Array.isArray(squares) || squares.length < 1 || squares.length > 40 || squares.some(p => !Array.isArray(p) || p.length !== 2 || !Number.isInteger(p[0]) || !Number.isInteger(p[1]) || p[0] < 1 || p[0] > 100000000 || p[1] < 1 || p[1] > 1000000)) throw new Error('Enter 1–40 squares as [left, side] pairs: left 1–100,000,000 and side 1–1,000,000.')
  return squares
}

// A square lands on top of every earlier square it overlaps: its base is the tallest of them, and its own
// height is that base plus its side. The answer after each drop is the tallest height so far.
export function buildTrace(squares) {
  const placed = []
  let best = 0
  const result = []
  const frames = [{ phase: 'start', index: null, placed: [], best, result: [...result], activeLine: L('const placed = []'), pythonLine: P('placed = []'), message: 'Drop the squares one at a time.' }]
  squares.forEach(([left, side], index) => {
    const right = left + side
    let base = 0
    for (const s of placed) if (s.left < right && s.right > left) base = Math.max(base, s.height)
    const height = base + side
    placed.push({ left, right, height, index })
    best = Math.max(best, height)
    result.push(best)
    frames.push({ phase: 'drop', index, placed: placed.map(s => ({ ...s })), base, height, best, result: [...result], activeLine: L('const height = base + side'), pythonLine: P('height = base + side'), message: `Square ${index + 1} at [${left}, ${right}): base ${base}, height ${height}, tallest so far ${best}.` })
  })
  frames.push({ phase: 'done', index: null, placed: placed.map(s => ({ ...s })), best, result: [...result], activeLine: L('return result'), pythonLine: P('return result'), message: `Tallest height after each drop: [${result.join(', ')}].` })
  return { input: squares, result, frames }
}

const SOURCE = `function fallingSquares(positions) {
  const placed = []
  let best = 0
  const result = []
  for (const [left, side] of positions) {
    const right = left + side
    let base = 0
    for (const s of placed) {
      if (s.left < right && s.right > left) base = Math.max(base, s.height)
    }
    const height = base + side
    placed.push({ left, right, height })
    best = Math.max(best, height)
    result.push(best)
  }
  return result
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def falling_squares(positions):
    placed = []
    best = 0
    result = []
    for left, side in positions:
        right = left + side
        base = 0
        for s_left, s_right, s_height in placed:
            if s_left < right and s_right > left:
                base = max(base, s_height)
        height = base + side
        placed.append((left, right, height))
        best = max(best, height)
        result.append(best)
    return result`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
