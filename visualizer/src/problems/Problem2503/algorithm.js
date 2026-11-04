export function parseInput(text) {
  const data = JSON.parse(text)
  const { grid, queries } = data ?? {}
  if (!Array.isArray(grid) || grid.length < 2 || grid.length > 4) throw new Error('Use "grid" with 2 to 4 rows.')
  const cols = grid[0]?.length
  if (!Array.isArray(cols) && !Number.isInteger(cols)) throw new Error('Each grid row is an array.')
  if (grid.some(row => !Array.isArray(row) || row.length !== grid[0].length || row.length < 2 || row.length > 4)) throw new Error('Every row has the same length, from 2 to 4.')
  if (grid.some(row => row.some(v => !Number.isInteger(v) || v < 0 || v > 9))) throw new Error('Grid values are integers from 0 to 9.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 4) throw new Error('Use "queries" as an array of 1 to 4 values.')
  if (queries.some(q => !Number.isInteger(q) || q < 1 || q > 10)) throw new Error('Each query is an integer from 1 to 10.')
  return { grid, queries }
}

export function buildTrace({ grid, queries }) {
  const m = grid.length
  const n = grid[0].length
  const order = queries.map((_, i) => i).sort((a, b) => queries[a] - queries[b] || a - b)
  const answer = Array(queries.length).fill(0)
  const seen = new Set(['0,0'])
  const frontier = [{ v: grid[0][0], r: 0, c: 0 }]
  const visited = []
  const frames = [{ phase: 'start', activeLine: L('const seen = new Set'), pythonLine: P('seen = {(0, 0)}'), visited: [], frontier: frontier.map(f => ({ r: f.r, c: f.c, v: f.v })), query: null, points: 0, message: 'Start the region at the top-left cell.' }]
  let points = 0
  const less = (a, b) => a.v < b.v || (a.v === b.v && (a.r < b.r || (a.r === b.r && a.c < b.c)))
  for (const qi of order) {
    const q = queries[qi]
    frames.push({ phase: 'query', activeLine: L('const q = queries[qi]'), pythonLine: P('q = queries[qi]'), visited: [...visited], frontier: frontier.map(f => ({ r: f.r, c: f.c, v: f.v })), query: q, points, message: `Query ${q}: cells below ${q} can be collected.` })
    while (frontier.length) {
      let at = 0
      for (let j = 1; j < frontier.length; j++) if (less(frontier[j], frontier[at])) at = j
      if (frontier[at].v >= q) break
      const cell = frontier.splice(at, 1)[0]
      points++
      visited.push(`${cell.r},${cell.c}`)
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = cell.r + dr
        const nc = cell.c + dc
        if (nr < 0 || nc < 0 || nr >= m || nc >= n || seen.has(`${nr},${nc}`)) continue
        seen.add(`${nr},${nc}`)
        frontier.push({ v: grid[nr][nc], r: nr, c: nc })
      }
      frames.push({ phase: 'expand', activeLine: L('const [, r, c] = heap.pop()'), pythonLine: P('points += 1'), visited: [...visited], frontier: frontier.map(f => ({ r: f.r, c: f.c, v: f.v })), query: q, points, message: `Collect cell (${cell.r}, ${cell.c}) with value ${cell.v}. Points: ${points}.` })
    }
    answer[qi] = points
    frames.push({ phase: 'answer', activeLine: L('answer[qi] = points'), pythonLine: P('answer[qi] = points'), visited: [...visited], frontier: frontier.map(f => ({ r: f.r, c: f.c, v: f.v })), query: q, points, message: `Answer for query ${q}: ${points}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), visited: [...visited], frontier: frontier.map(f => ({ r: f.r, c: f.c, v: f.v })), query: null, points, message: 'Answers are in the original query order.' })
  return { input: { grid, queries }, result: answer, frames }
}

const CODE = [
  'function maxPoints(grid, queries) {',
  '  const m = grid.length, n = grid[0].length',
  '  const order = queries.map((_, i) => i).sort((a, b) => queries[a] - queries[b])',
  '  const answer = Array(queries.length).fill(0)',
  '  const heap = new MinHeap([[grid[0][0], 0, 0]])',
  '  const seen = new Set(["0,0"])',
  '  let points = 0',
  '  for (const qi of order) {',
  '    const q = queries[qi]',
  '    while (heap.size && heap.peek()[0] < q) {',
  '      const [, r, c] = heap.pop()',
  '      points++',
  '      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {',
  '        const nr = r + dr, nc = c + dc',
  '        if (inBounds(nr, nc) && !seen.has(`${nr},${nc}`)) {',
  '          seen.add(`${nr},${nc}`)',
  '          heap.push([grid[nr][nc], nr, nc])',
  '        }',
  '      }',
  '    }',
  '    answer[qi] = points',
  '  }',
  '  return answer',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(c => c.includes(s)) + 1
export const python = `import heapq

def max_points(grid, queries):
    m, n = len(grid), len(grid[0])
    order = sorted(range(len(queries)), key=lambda i: queries[i])
    answer = [0] * len(queries)
    heap = [(grid[0][0], 0, 0)]
    seen = {(0, 0)}
    points = 0
    for qi in order:
        q = queries[qi]
        while heap and heap[0][0] < q:
            _, r, c = heapq.heappop(heap)
            points += 1
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    heapq.heappush(heap, (grid[nr][nc], nr, nc))
        answer[qi] = points
    return answer
`

const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
