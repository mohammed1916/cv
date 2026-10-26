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
  const frames = [{ phase: 'start', from: [0, 0], to: null, steps: 0, cut: 0, activeLine: 2, message: 'Start at (0, 0); visit trees from shortest to tallest.' }]
  let r0 = 0, c0 = 0, total = 0
  for (let k = 0; k < trees.length; k++) {
    const t = trees[k]
    const d = bfs(r0, c0, t.r, t.c)
    if (d < 0) {
      frames.push({ phase: 'blocked', from: [r0, c0], to: [t.r, t.c], steps: null, cut: k, activeLine: 6, message: `No route from (${r0}, ${c0}) to the tree at (${t.r}, ${t.c}).` })
      return { input: forest, result: -1, frames }
    }
    total += d
    frames.push({ phase: 'walk', from: [r0, c0], to: [t.r, t.c], steps: d, cut: k + 1, activeLine: 8, message: `Walk ${d} step${d === 1 ? '' : 's'} to the tree of height ${t.h}; cut it.` })
    r0 = t.r; c0 = t.c
  }
  frames.push({ phase: 'done', from: [r0, c0], to: null, steps: total, cut: trees.length, result: total, activeLine: 10, message: `Total steps: ${total}.` })
  return { input: forest, result: total, frames }
}

export const code = `def cutOffTree(forest):
    trees = sorted((h, r, c) for r, row in enumerate(forest) for c, h in enumerate(row) if h > 1)
    r, c, total = 0, 0, 0
    for h, tr, tc in trees:
        d = bfs(forest, (r, c), (tr, tc))
        if d < 0: return -1
        total += d
        r, c = tr, tc
    return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
