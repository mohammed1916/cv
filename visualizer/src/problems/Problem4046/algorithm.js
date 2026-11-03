// Dijkstra over states (row, column, last direction, turns used). Each state keeps the cheapest cost found so far.
// Moving in the same direction keeps the turn count; a different direction (including a reversal) uses one turn.
// The start has no direction yet, so the first move is free of turns. Popping the bottom-right cell gives the answer.

const MAX_SIDE = 6
const MAX_VALUE = 9

const codeLines = [
  'best of the start (0, 0, no direction, 0 turns) is grid[0][0]',
  'push the start into the queue ordered by cost',
  'while the queue is not empty',
  '  pop the cheapest state (cost, r, c, dir, turns)',
  '  if cost is larger than the best for this state, skip it',
  '  if (r, c) is the bottom-right cell, return cost',
  '  for each direction nd',
  '    turns is turns plus one when nd differs from dir and dir is set',
  '    if turns is above k, skip this direction',
  '    relax (nr, nc, nd, turns) to cost plus grid[nr][nc]',
  'return -1',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'import heapq',
  'def min_cost_k_turns(grid, k):',
  '    rows, cols = len(grid), len(grid[0])',
  '    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]',
  '    best = {(0, 0, -1, 0): grid[0][0]}',
  '    heap = [(grid[0][0], 0, 0, -1, 0)]',
  '    while heap:',
  '        cost, r, c, d, t = heapq.heappop(heap)',
  '        if cost > best[(r, c, d, t)]:',
  '            continue',
  '        if (r, c) == (rows - 1, cols - 1):',
  '            return cost',
  '        for nd, (dr, dc) in enumerate(dirs):',
  '            nt = t + (1 if d != -1 and nd != d else 0)',
  '            if nt > k:',
  '                continue',
  '            nr, nc = r + dr, c + dc',
  '            if not (0 <= nr < rows and 0 <= nc < cols):',
  '                continue',
  '            ncost = cost + grid[nr][nc]',
  '            key = (nr, nc, nd, nt)',
  "            if ncost < best.get(key, float('inf')):",
  '                best[key] = ncost',
  '                heapq.heappush(heap, (ncost, nr, nc, nd, nt))',
  '    return -1',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]
const ARROWS = ['→', '↓', '←', '↑']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid and k.')
  const { grid, k } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIDE || !Array.isArray(grid[0])) throw new Error(`grid has 1 to ${MAX_SIDE} rows.`)
  const cols = grid[0].length
  if (cols < 1 || cols > MAX_SIDE) throw new Error(`Each row has 1 to ${MAX_SIDE} columns.`)
  if (!grid.every(row => Array.isArray(row) && row.length === cols && row.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE))) {
    throw new Error(`Every row has ${cols} whole values from 0 to ${MAX_VALUE}.`)
  }
  if (!Number.isInteger(k) || k < 0 || k >= Math.min(grid.length, cols)) throw new Error('k is an integer from 0 to min(rows, columns) minus 1.')
  return { grid, k }
}

const keyOf = (r, c, d, t) => `${r},${c},${d},${t}`
const cmp = (a, b) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]
  return 0
}

export function buildTrace({ grid, k }) {
  const rows = grid.length
  const cols = grid[0].length
  const frames = []
  const best = new Map([[keyOf(0, 0, -1, 0), grid[0][0]]])
  const heap = [[grid[0][0], 0, 0, -1, 0]]
  const push = item => {
    let i = heap.length
    heap.push(item)
    while (i > 0 && cmp(heap[i], heap[i - 1]) < 0) {
      ;[heap[i], heap[i - 1]] = [heap[i - 1], heap[i]]
      i -= 1
    }
  }
  const pop = () => {
    const top = heap[0]
    const last = heap.pop()
    if (heap.length > 0) {
      heap[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < heap.length && cmp(heap[l], heap[m]) < 0) m = l
        if (r < heap.length && cmp(heap[r], heap[m]) < 0) m = r
        if (m === i) break
        ;[heap[i], heap[m]] = [heap[m], heap[i]]
        i = m
      }
    }
    return top
  }
  const cellBest = () => {
    const out = Array.from({ length: rows }, () => Array(cols).fill(null))
    for (const [k2, v] of best) {
      const [r, c] = k2.split(',').map(Number)
      if (out[r][c] === null || v < out[r][c]) out[r][c] = v
    }
    return out
  }
  const heapTop = () => heap.slice(0, 4).map(([cost, r, c, d, t]) => ({ cost, r, c, d, t }))

  frames.push({ phase: 'start', pythonLine: P('best = {(0, 0'), activeLine: L('best of the start'), state: null, cells: cellBest(), queue: heapTop(), turnsLeft: k, message: `Start at the top-left cell with cost ${grid[0][0]}; no turns used yet.` })
  frames.push({ phase: 'start', pythonLine: P('heap = ['), activeLine: L('push the start'), state: null, cells: cellBest(), queue: heapTop(), turnsLeft: k, message: 'The queue holds only the start.' })

  let answer = -1
  while (heap.length > 0) {
    const [cost, r, c, d, t] = pop()
    frames.push({ phase: 'pop', pythonLine: P('cost, r, c, d, t = heapq'), activeLine: L('pop the cheapest'), state: { r, c, d, t, cost }, cells: cellBest(), queue: heapTop(), turnsLeft: k - t, message: `Pop cost ${cost} at ${r},${c}, ${d < 0 ? 'no direction yet' : `moving ${ARROWS[d]}`}, ${t} turn${t === 1 ? '' : 's'} used.` })
    if (cost > best.get(keyOf(r, c, d, t))) {
      frames.push({ phase: 'stale', pythonLine: P('if cost > best'), activeLine: L('if cost is larger'), state: { r, c, d, t, cost }, cells: cellBest(), queue: heapTop(), turnsLeft: k - t, message: 'A cheaper route to this state was already found; skip it.' })
      continue
    }
    if (r === rows - 1 && c === cols - 1) {
      answer = cost
      frames.push({ phase: 'goal', pythonLine: P('return cost'), activeLine: L('if (r, c) is the bottom-right'), state: { r, c, d, t, cost }, cells: cellBest(), queue: heapTop(), turnsLeft: k - t, message: `Bottom-right reached with cost ${cost} using ${t} turn${t === 1 ? '' : 's'}.` })
      break
    }
    for (let nd = 0; nd < 4; nd++) {
      const [dr, dc] = DIRS[nd]
      const turn = d !== -1 && nd !== d ? 1 : 0
      const nt = t + turn
      const nr = r + dr
      const nc = c + dc
      if (nt > k) {
        frames.push({ phase: 'limit', pythonLine: P('if nt > k'), activeLine: L('if turns is above k'), state: { r, c, d, t, cost, nd }, cells: cellBest(), queue: heapTop(), turnsLeft: k - t, message: `Turning ${ARROWS[nd]} would need turn ${nt} of ${k}; skip.` })
        continue
      }
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      const ncost = cost + grid[nr][nc]
      const key = keyOf(nr, nc, nd, nt)
      const improved = !best.has(key) || ncost < best.get(key)
      if (improved) {
        best.set(key, ncost)
        push([ncost, nr, nc, nd, nt])
      }
      frames.push({ phase: improved ? 'relax' : 'keep', pythonLine: P("if ncost < best.get"), activeLine: L('relax (nr, nc, nd, turns)'), state: { r, c, d, t, cost, nd, nr, nc, nt, ncost }, cells: cellBest(), queue: heapTop(), turnsLeft: k - nt, message: `${ARROWS[nd]} to ${nr},${nc} costs ${ncost} with ${nt} turn${nt === 1 ? '' : 's'}; ${improved ? 'store it.' : 'the stored route is already at least as cheap.'}` })
    }
  }
  if (answer === -1 && heap.length === 0) {
    frames.push({ phase: 'done', pythonLine: P('return -1'), activeLine: L('return -1'), state: null, cells: cellBest(), queue: [], turnsLeft: k, message: 'The queue ran out before the bottom-right cell: no path within k turns.' })
  } else {
    frames.push({ phase: 'done', pythonLine: P('return cost'), activeLine: L('if (r, c) is the bottom-right'), state: null, cells: cellBest(), queue: [], turnsLeft: k, message: `Minimum cost: ${answer}.` })
  }
  return { input: { grid, k }, result: answer, frames }
}
