export function parseInput(text) {
  const input = JSON.parse(text)
  const matrix = input?.matrix
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 5) throw new Error('Use a matrix of 1 to 5 rows.')
  const cols = Array.isArray(matrix[0]) ? matrix[0].length : 0
  if (cols < 1 || cols > 5) throw new Error('Each row needs 1 to 5 values.')
  if (matrix.some(row => !Array.isArray(row) || row.length !== cols || row.some(v => !Number.isInteger(v) || v < -100 || v > 100))) {
    throw new Error('Every row must have the same length, with integers from -100 to 100.')
  }
  return { matrix }
}

export function buildTrace({ matrix }) {
  const rows = matrix.length
  const cols = matrix[0].length
  const ranks = Array.from({ length: rows }, () => Array(cols).fill(0))
  const rowMax = Array(rows).fill(0)
  const colMax = Array(cols).fill(0)
  const cells = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ v: matrix[r][c], r, c })
  cells.sort((x, y) => x.v - y.v || x.r - y.r || x.c - y.c)
  const snapshot = () => ranks.map(row => [...row])
  const frames = [{ phase: 'start', activeLine: L('rank transform of matrix'), group: [], ranks: snapshot(), message: 'Sort the cells by value so that smaller values are ranked first.' }]

  let start = 0
  while (start < cells.length) {
    let end = start
    while (end < cells.length && cells[end].v === cells[start].v) end++
    const group = cells.slice(start, end)
    const value = group[0].v
    frames.push({ phase: 'group', activeLine: L('for each group of cells with equal value'), group: group.map(({ r, c }) => [r, c]), ranks: snapshot(), message: `Value ${value} forms a group of ${group.length} cell${group.length === 1 ? '' : 's'}.` })

    const parent = Array.from({ length: rows + cols }, (_, k) => k)
    const find = x => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]]
        x = parent[x]
      }
      return x
    }
    for (const { r, c } of group) {
      const a = find(r)
      const b = find(rows + c)
      if (a !== b) parent[a] = b
    }
    frames.push({ phase: 'join', activeLine: L("join each cell's row and column"), group: group.map(({ r, c }) => [r, c]), ranks: snapshot(), message: 'Cells that share a row or column through the group must get one rank.' })

    const best = new Map()
    for (const { r, c } of group) {
      const root = find(r)
      best.set(root, Math.max(best.get(root) ?? 0, rowMax[r], colMax[c]))
    }
    for (const { r, c } of group) ranks[r][c] = best.get(find(r)) + 1
    for (const { r, c } of group) {
      rowMax[r] = Math.max(rowMax[r], ranks[r][c])
      colMax[c] = Math.max(colMax[c], ranks[r][c])
    }
    frames.push({ phase: 'rank', activeLine: L("set each cell's rank"), group: group.map(({ r, c }) => [r, c]), ranks: snapshot(), message: `Value ${value} gets its rank, one more than the largest rank already in its rows and columns.` })
    start = end
  }
  frames.push({ phase: 'done', activeLine: L('return the rank matrix'), group: [], ranks: snapshot(), message: 'Every cell has its smallest valid rank.' })
  return { input: { matrix }, result: ranks, frames }
}

export const code = `rank transform of matrix
  sort all cells by value, smallest first
  start with every row and column maximum at zero
  for each group of cells with equal value
    join each cell's row and column in a union-find over rows and columns
    find the largest maximum among the rows and columns of each joined part
    set each cell's rank to that maximum plus one
    record the new rank as the maximum for its row and column
  return the rank matrix`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def matrix_rank_transform(matrix):
    rows = len(matrix)
    cols = len(matrix[0])
    result = [[0] * cols for _ in range(rows)]
    row_max = [0] * rows
    col_max = [0] * cols
    cells = sorted((matrix[r][c], r, c) for r in range(rows) for c in range(cols))
    start = 0
    while start < len(cells):
        end = start
        while end < len(cells) and cells[end][0] == cells[start][0]:
            end += 1
        group = cells[start:end]
        parent = list(range(rows + cols))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for _, r, c in group:
            a = find(r)
            b = find(rows + c)
            if a != b:
                parent[a] = b
        best = {}
        for _, r, c in group:
            root = find(r)
            best[root] = max(best.get(root, 0), row_max[r], col_max[c])
        for _, r, c in group:
            result[r][c] = best[find(r)] + 1
        for _, r, c in group:
            row_max[r] = max(row_max[r], result[r][c])
            col_max[c] = max(col_max[c], result[r][c])
        start = end
    return result
`
