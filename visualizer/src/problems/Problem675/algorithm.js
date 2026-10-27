export function parseInput(text) {
  const forest = JSON.parse(text)
  if (!Array.isArray(forest) || forest.length < 1 || forest.length > 8 || forest.some(r => !Array.isArray(r) || r.length !== forest[0].length || r.length < 1 || r.length > 8)) throw new Error('Enter a rectangular JSON array of up to 8×8 cells.')
  if (forest.flat().some(v => !Number.isInteger(v) || v < 0 || v > 1000000000)) throw new Error('Cells must be integers from 0 (blocked) to 1e9 (tree height); 1 is open ground.')
  if (forest.flat().filter(v => v > 1).length > 12) throw new Error('At most 12 trees for the visualization.')
  return forest
}

// Cut trees in increasing height. Between consecutive trees, a BFS finds the shortest walk over open cells.
export function buildTrace(forest) {
  const m = forest.length, n = forest[0].length
  const trees = []
  forest.forEach((row, r) => row.forEach((v, c) => { if (v > 1) trees.push({ r, c, h: v }) }))
  trees.sort((a, b) => a.h - b.h)
  const open = (r, c) => r >= 0 && r < m && c >= 0 && c < n && forest[r][c] !== 0
  const bfs = (sr, sc, tr, tc) => {
    if (sr === tr && sc === tc) return 0
    const dist = Array.from({ length: m }, () => Array(n).fill(-1))
    dist[sr][sc] = 0
    const queue = [[sr, sc]]
    for (let q = 0; q < queue.length; q++) {
      const [r, c] = queue[q]
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc
        if (!open(nr, nc) || dist[nr][nc] >= 0) continue
        dist[nr][nc] = dist[r][c] + 1
        if (nr === tr && nc === tc) return dist[nr][nc]
        queue.push([nr, nc])
      }
    }
    return -1
  }
  const frames = [{ phase: 'start', from: [0, 0], to: null, steps: 0, cut: 0, activeLine: L('start at the top-left'), message: 'Start at (0, 0); visit trees from shortest to tallest.' }]
  let r0 = 0, c0 = 0, total = 0
  for (let k = 0; k < trees.length; k++) {
    const t = trees[k]
    const d = bfs(r0, c0, t.r, t.c)
    if (d < 0) {
      frames.push({ phase: 'blocked', from: [r0, c0], to: [t.r, t.c], steps: null, cut: k, activeLine: L('if no walk exists'), message: `No route from (${r0}, ${c0}) to the tree at (${t.r}, ${t.c}).` })
      return { input: forest, result: -1, frames }
    }
    total += d
    frames.push({ phase: 'walk', from: [r0, c0], to: [t.r, t.c], steps: d, cut: k + 1, activeLine: L('add the walk length'), message: `Walk ${d} step${d === 1 ? '' : 's'} to the tree of height ${t.h}; cut it.` })
    r0 = t.r; c0 = t.c
  }
  frames.push({ phase: 'done', from: [r0, c0], to: null, steps: total, cut: trees.length, result: total, activeLine: L('return total'), message: `Total steps: ${total}.` })
  return { input: forest, result: total, frames }
}

export const code = `sort every tree by height, shortest first
start at the top-left cell with total = 0
for each tree in height order
  find the shortest walk from the current cell to the tree with BFS over open cells
  if no walk exists, return -1
  add the walk length to total
  move the current cell to the tree
return total`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque


def walk_length(forest, start, goal):
    if start == goal:
        return 0
    rows, cols = len(forest), len(forest[0])
    dist = {start: 0}
    queue = deque([start])
    while queue:
        r, c = queue.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and forest[nr][nc] != 0 and (nr, nc) not in dist:
                dist[(nr, nc)] = dist[(r, c)] + 1
                if (nr, nc) == goal:
                    return dist[(nr, nc)]
                queue.append((nr, nc))
    return -1


def cut_off_tree(forest):
    rows, cols = len(forest), len(forest[0])
    trees = sorted((forest[r][c], r, c) for r in range(rows) for c in range(cols) if forest[r][c] > 1)
    r, c, total = 0, 0, 0
    for h, tr, tc in trees:
        d = walk_length(forest, (r, c), (tr, tc))
        if d < 0:
            return -1
        total += d
        r, c = tr, tc
    return total
`
