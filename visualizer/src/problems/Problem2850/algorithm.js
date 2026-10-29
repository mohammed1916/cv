export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be JSON, for example {"grid":[[1,1,0],[1,1,1],[1,2,1]]}.')
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.grid)) throw new Error('Use an object with a grid array.')
  const grid = data.grid
  if (grid.length !== 3 || grid.some(row => !Array.isArray(row) || row.length !== 3)) throw new Error('grid must have 3 rows of 3 cells.')
  if (grid.flat().some(v => !Number.isInteger(v) || v < 0 || v > 9)) throw new Error('Each cell must be an integer from 0 to 9.')
  if (grid.flat().reduce((a, b) => a + b, 0) !== 9) throw new Error('The grid must contain exactly nine stones.')
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const frames = []
  const surplus = []
  const empty = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[r][c] === 0) empty.push(r * 3 + c)
      for (let t = 0; t < grid[r][c] - 1; t++) surplus.push(r * 3 + c)
    }
  }
  const used = empty.map(() => false)
  const path = []
  let best = Infinity
  const cells = () => {
    const counts = grid.flat()
    for (const m of path) {
      counts[m.from] -= 1
      counts[m.to] += 1
    }
    return counts
  }
  const emit = (phase, activeLine, pythonLine, message, extra = {}) => {
    frames.push({
      phase,
      activeLine,
      pythonLine,
      message,
      cells: cells(),
      path: path.map(m => ({ ...m })),
      stone: -1,
      target: -1,
      cost: 0,
      best: best === Infinity ? null : best,
      result: null,
      ...extra,
    })
  }

  emit('setup', 2, 9, `Found ${surplus.length} surplus stones and ${empty.length} empty cells.`)
  emit('setup', 3, 10, 'Set best to infinity. No cell is used yet.')
  emit('setup', 3, 11, 'Every empty cell starts unused.')

  function place(k, cost) {
    if (cost >= best) {
      emit('prune', 5, 13, `Cost ${cost} is not below best ${best}, so this branch stops.`, { stone: k, cost })
      emit('prune', 5, 14, 'Return from this branch.', { stone: k, cost })
      return
    }
    emit('search', 5, 13, `Cost ${cost} is below best, so keep searching.`, { stone: k, cost })
    if (k === surplus.length) {
      emit('record', 6, 15, 'Every surplus stone is placed.', { stone: k, cost })
      best = cost
      emit('record', 6, 16, `Record best = ${best}.`, { stone: k, cost })
      emit('record', 6, 17, 'Return after recording.', { stone: k, cost })
      return
    }
    emit('search', 4, 15, `Stone ${k} still needs a cell.`, { stone: k, cost })
    emit('search', 4, 18, `Take surplus stone ${k} at cell ${surplus[k]}.`, { stone: k, cost })
    for (let j = 0; j < empty.length; j++) {
      emit('search', 7, 19, `Look at empty cell ${empty[j]}.`, { stone: k, target: j, cost })
      if (used[j]) {
        emit('search', 7, 20, `Cell ${empty[j]} is already used.`, { stone: k, target: j, cost })
        continue
      }
      emit('search', 7, 20, `Cell ${empty[j]} is free.`, { stone: k, target: j, cost })
      used[j] = true
      emit('assign', 8, 21, `Mark cell ${empty[j]} as used.`, { stone: k, target: j, cost })
      const from = surplus[k]
      const to = empty[j]
      const d = Math.abs(Math.floor(from / 3) - Math.floor(to / 3)) + Math.abs((from % 3) - (to % 3))
      path.push({ from, to })
      emit('assign', 8, 22, `Move a stone from ${from} to ${to}, adding distance ${d}.`, { stone: k, target: j, cost: cost + d })
      place(k + 1, cost + d)
      path.pop()
      used[j] = false
      emit('undo', 9, 23, `Unmark cell ${to} and undo that move.`, { stone: k, target: j, cost })
    }
  }

  emit('search', 10, 24, 'Start placing from stone 0 with cost 0.', { stone: 0, cost: 0 })
  place(0, 0)
  const result = best
  emit('done', 11, 25, `Return the minimum total moves: ${result}.`, { result })
  return { input, result, frames }
}

export const code = `minimum moves to spread stones over grid
  collect surplus stones and empty cells
  set best to infinity and mark no cell used
  place the next surplus stone starting from cost
  if cost is not below best then stop this branch
  if every surplus stone is placed then record cost as best and stop
  for each empty cell that is still free
  mark the cell used and add its distance to cost
  unmark the cell after the branch is explored
  start placing from stone 0 with cost 0
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimumMoves(grid):
    surplus = []
    empty = []
    for r in range(3):
        for c in range(3):
            if grid[r][c] == 0:
                empty.append((r, c))
            for _ in range(grid[r][c] - 1):
                surplus.append((r, c))
    best = [float('inf')]
    used = [False] * len(empty)
    def place(k, cost):
        if cost >= best[0]:
            return
        if k == len(surplus):
            best[0] = cost
            return
        sr, sc = surplus[k]
        for j, (er, ec) in enumerate(empty):
            if not used[j]:
                used[j] = True
                place(k + 1, cost + abs(sr - er) + abs(sc - ec))
                used[j] = False
    place(0, 0)
    return best[0]
`
