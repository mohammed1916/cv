export function parseInput(text) {
  const forest = JSON.parse(text)
  if (!Array.isArray(forest) || forest.length < 1 || forest.length > 8 || forest.some(r => !Array.isArray(r) || r.length !== forest[0].length || r.length < 1 || r.length > 8)) throw new Error('Enter a rectangular JSON array of up to 8×8 cells.')
  if (forest.flat().some(v => !Number.isInteger(v) || v < 0 || v > 1000000000)) throw new Error('Cells must be integers from 0 (blocked) to 1e9 (tree height); 1 is open ground.')
  const trees = forest.flat().filter(v => v > 1).length
  if (trees > 12) throw new Error('At most 12 trees, so the visualization can show every leg.')
  return forest
}

// Cut the trees in increasing height. Each leg is a breadth-first search from where the walker stands to the
// next tree; any unreachable tree makes the whole cut impossible.
export function buildTrace(forest) {
  const trees = []
  forest.forEach((row, r) => row.forEach((h, c) => { if (h > 1) trees.push({ h, r, c }) }))
  trees.sort((a, b) => a.h - b.h)
  let total = 0
  let at = [0, 0]
  const frames = [{ phase: 'start', at: [...at], target: null, path: [], visited: [], total, activeLine: L('const trees = []'), pythonLine: P('trees = sorted('), message: `${trees.length} tree(s) to cut, shortest first.` }]
  let result = 0
  for (const tree of trees) {
    const leg = search(forest, at[0], at[1], tree.r, tree.c)
    if (leg.steps < 0) {
      result = -1
      frames.push({ phase: 'blocked', at: [...at], target: [tree.r, tree.c], path: [], visited: leg.visited, total, activeLine: L('return -1'), pythonLine: P('return -1'), message: `Tree ${tree.h} at (${tree.r}, ${tree.c}) cannot be reached: return −1.` })
      break
    }
    total += leg.steps
    frames.push({ phase: 'leg', at: [tree.r, tree.c], target: [tree.r, tree.c], path: leg.path, visited: leg.visited, total, activeLine: L('total += steps'), pythonLine: P('total += steps'), message: `Walk ${leg.steps} step(s) to the tree ${tree.h} at (${tree.r}, ${tree.c}); total ${total}.` })
    at = [tree.r, tree.c]
  }
  if (result !== -1) result = total
  frames.push({ phase: 'done', at: [...at], target: null, path: [], visited: [], total: result, result, activeLine: L('return total'), pythonLine: P('return total'), message: `Total steps: ${result}.` })
  return { input: forest, result, frames }
}

// Breadth-first search that also returns the path and the cells it visited.
function search(forest, sr, sc, tr, tc) {
  const rows = forest.length, cols = forest[0].length
  const dist = Array.from({ length: rows }, () => Array(cols).fill(-1))
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null))
  const visited = []
  dist[sr][sc] = 0
  const queue = [[sr, sc]]
  for (let q = 0; q < queue.length; q++) {
    const [r, c] = queue[q]
    visited.push([r, c])
    if (r === tr && c === tc) break
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || forest[nr][nc] === 0 || dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      parent[nr][nc] = [r, c]
      queue.push([nr, nc])
    }
  }
  const steps = dist[tr][tc]
  const path = []
  for (let cell = steps >= 0 ? [tr, tc] : null; cell; cell = parent[cell[0]][cell[1]]) path.unshift(cell)
  return { steps, path, visited }
}

const SOURCE = `function cutOffTree(forest) {
  const trees = []
  forest.forEach((row, r) => row.forEach((h, c) => { if (h > 1) trees.push({ h, r, c }) }))
  trees.sort((a, b) => a.h - b.h)
  let total = 0
  let r0 = 0
  let c0 = 0
  for (const tree of trees) {
    const steps = bfs(forest, r0, c0, tree.r, tree.c)
    if (steps < 0) return -1
    total += steps
    r0 = tree.r
    c0 = tree.c
  }
  return total
}

function bfs(forest, sr, sc, tr, tc) {
  const rows = forest.length
  const cols = forest[0].length
  const dist = Array.from({ length: rows }, () => Array(cols).fill(-1))
  dist[sr][sc] = 0
  const queue = [[sr, sc]]
  for (let q = 0; q < queue.length; q++) {
    const [r, c] = queue[q]
    if (r === tr && c === tc) return dist[r][c]
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || forest[nr][nc] === 0 || dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      queue.push([nr, nc])
    }
  }
  return -1
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque


def cut_off_tree(forest):
    trees = sorted((h, r, c) for r, row in enumerate(forest) for c, h in enumerate(row) if h > 1)
    total = 0
    r0, c0 = 0, 0
    for h, r, c in trees:
        steps = bfs(forest, r0, c0, r, c)
        if steps < 0:
            return -1
        total += steps
        r0, c0 = r, c
    return total


def bfs(forest, sr, sc, tr, tc):
    rows, cols = len(forest), len(forest[0])
    dist = {(sr, sc): 0}
    queue = deque([(sr, sc)])
    while queue:
        r, c = queue.popleft()
        if (r, c) == (tr, tc):
            return dist[(r, c)]
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and forest[nr][nc] != 0 and (nr, nc) not in dist:
                dist[(nr, nc)] = dist[(r, c)] + 1
                queue.append((nr, nc))
    return -1`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
