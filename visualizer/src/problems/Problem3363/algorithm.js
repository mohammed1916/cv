const MAX_SIZE = 5

export function parseInput(text) {
  const data = JSON.parse(text)
  const fruits = data?.fruits
  if (!Array.isArray(fruits) || fruits.length < 2 || fruits.length > MAX_SIZE) throw new Error(`fruits must be a square grid of 2 to ${MAX_SIZE} rows.`)
  const n = fruits.length
  for (const row of fruits) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('fruits must be square.')
    if (row.some(v => !Number.isInteger(v) || v < 0 || v > 99)) throw new Error('Fruit counts are integers from 0 to 99.')
  }
  return { fruits }
}

export const code = `max fruits collected(fruits):
  set n to the side length of fruits
  the first child walks the main diagonal from the top-left to the bottom-right
  set best to 0
  for each path of the second child from the top-right to the bottom-right, moving down-left, down or down-right:
    for each path of the third child from the bottom-left to the bottom-right, moving up-right, right or down-right:
      set cells to the union of the diagonal, the second path and the third path
      set total to the fruit summed over cells, counting each cell once
      if total > best then set best to total
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Every path of exactly n - 1 moves from start to the bottom-right corner, using the given moves.
function pathsTo(fruits, start, moves) {
  const n = fruits.length
  const out = []
  const walk = (r, c, cells) => {
    if (cells.length === n) {
      if (r === n - 1 && c === n - 1) out.push(cells)
      return
    }
    for (const [dr, dc] of moves) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue
      walk(nr, nc, [...cells, [nr, nc]])
    }
  }
  walk(start[0], start[1], [start])
  return out
}

export function buildTrace({ fruits }) {
  const n = fruits.length
  const diagonal = Array.from({ length: n }, (_, i) => [i, i])
  const secondPaths = pathsTo(fruits, [0, n - 1], [[1, -1], [1, 0], [1, 1]])
  const thirdPaths = pathsTo(fruits, [n - 1, 0], [[-1, 1], [0, 1], [1, 1]])
  let best = -1
  let bestCells = []
  const frames = [{ phase: 'start', activeLine: L('the first child walks'), cells: diagonal, total: 0, best: 0, message: `The first child collects the diagonal, ${diagonal.reduce((s, [r, c]) => s + fruits[r][c], 0)} fruit.` }]
  for (const second of secondPaths) {
    for (const third of thirdPaths) {
      const seen = new Map()
      for (const [r, c] of [...diagonal, ...second, ...third]) seen.set(`${r},${c}`, [r, c])
      const cells = [...seen.values()]
      const total = cells.reduce((s, [r, c]) => s + fruits[r][c], 0)
      if (total > best) {
        best = total
        bestCells = cells
        frames.push({ phase: 'improve', activeLine: L('if total > best'), cells, total, best, message: `Paths of the second and third children collect ${total} fruit in total.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), cells: bestCells, total: best, best, message: `Maximum fruit collected: ${best}.` })
  return { input: { fruits }, fruits, result: best, frames }
}

export const python = `def max_fruits_collected(fruits):
    n = len(fruits)

    def paths(start, moves):
        out = []

        def walk(r, c, cells):
            if len(cells) == n:
                if r == n - 1 and c == n - 1:
                    out.append(cells)
                return
            for dr, dc in moves:
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n:
                    walk(nr, nc, cells + [(nr, nc)])

        walk(start[0], start[1], [start])
        return out

    diagonal = [(i, i) for i in range(n)]
    second_paths = paths((0, n - 1), [(1, -1), (1, 0), (1, 1)])
    third_paths = paths((n - 1, 0), [(-1, 1), (0, 1), (1, 1)])
    best = -1
    for second in second_paths:
        for third in third_paths:
            cells = set(diagonal) | set(second) | set(third)
            total = sum(fruits[r][c] for r, c in cells)
            best = max(best, total)
    return best
`
