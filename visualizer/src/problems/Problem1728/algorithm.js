export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || !Array.isArray(input.grid) || !Number.isInteger(input.catJump) || !Number.isInteger(input.mouseJump)) {
    throw new Error('Use an object such as {"grid": ["M.C...F"], "catJump": 1, "mouseJump": 4}.')
  }
  const { grid, catJump, mouseJump } = input
  if (grid.length < 1 || grid.length > 8 || grid.some(row => typeof row !== 'string' || row.length !== grid[0].length)) {
    throw new Error('grid has 1 to 8 rows of equal length.')
  }
  if (grid[0].length < 1 || grid[0].length > 8) throw new Error('Each row has 1 to 8 cells.')
  if (grid.some(row => /[^CMF.#]/.test(row))) throw new Error('Cells are C, M, F, ., or #.')
  const count = ch => grid.join('').split(ch).length - 1
  if (count('C') !== 1 || count('M') !== 1 || count('F') !== 1) throw new Error('The grid has exactly one C, one M and one F.')
  if (catJump < 1 || catJump > 8 || mouseJump < 1 || mouseJump > 8) throw new Error('Jumps are integers from 1 to 8.')
  return { grid, catJump, mouseJump }
}

// Cells a piece can reach in one move: stay, or step 1..jump in a straight line until a wall or the edge.
function reachable(grid, cell, jump) {
  const rows = grid.length
  const cols = grid[0].length
  const r0 = Math.floor(cell / cols)
  const c0 = cell % cols
  const out = [cell]
  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (let step = 1; step <= jump; step++) {
      const r = r0 + dr * step
      const c = c0 + dc * step
      if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '#') break
      out.push(r * cols + c)
    }
  }
  return out
}

// Retrograde analysis over states (mouse cell, cat cell, mover). Each state gets the outcome and the
// number of moves it takes under best play; a draw (no result) is a cat win after 1000 turns.
export function solveGame(grid, catJump, mouseJump) {
  const rows = grid.length
  const cols = grid[0].length
  const n = rows * cols
  const find = ch => grid.join('').indexOf(ch)
  const mouseStart = find('M')
  const catStart = find('C')
  const food = find('F')
  const moveM = Array.from({ length: n }, (_, cell) => reachable(grid, cell, mouseJump))
  const moveC = Array.from({ length: n }, (_, cell) => reachable(grid, cell, catJump))
  const MOUSE = 1
  const CAT = 2
  const flat = grid.join('')
  const result = new Int8Array(n * n * 2)
  const depth = new Int32Array(n * n * 2)
  const remaining = new Int32Array(n * n * 2)
  const id = (m, c, t) => (m * n + c) * 2 + t
  const queue = []
  for (let m = 0; m < n; m++) {
    for (let c = 0; c < n; c++) {
      for (let t = 0; t < 2; t++) {
        const s = id(m, c, t)
        remaining[s] = t === 0 ? moveM[m].length : moveC[c].length
        // Wall cells hold no piece, so their states are never reached and must not link to real states.
        if (flat[m] === '#' || flat[c] === '#') { result[s] = 3; continue }
        if (m === food) { result[s] = MOUSE; queue.push(s) } else if (c === food || c === m) { result[s] = CAT; queue.push(s) }
      }
    }
  }
  const layers = []
  for (let head = 0; head < queue.length; head++) {
    const s = queue[head]
    const t = s % 2
    const c = Math.floor(s / 2) % n
    const m = Math.floor(Math.floor(s / 2) / n)
    const outcome = result[s]
    // Predecessors of a mouse-to-move state come from cat-to-move states, and the reverse.
    const preds = t === 0 ? moveC[c].map(y => id(m, y, 1)) : moveM[m].map(x => id(x, c, 0))
    for (const p of preds) {
      if (result[p] !== 0) continue
      const pt = p % 2
      if (pt === 0 && outcome === CAT) {
        // Mouse to move and cat wins: the mouse would look for another move.
        remaining[p] -= 1
        if (remaining[p] === 0) { result[p] = CAT; depth[p] = depth[s] + 1; queue.push(p) }
      } else if (pt === 0 && outcome === MOUSE) {
        result[p] = MOUSE; depth[p] = depth[s] + 1; queue.push(p)
      } else if (pt === 1 && outcome === MOUSE) {
        remaining[p] -= 1
        if (remaining[p] === 0) { result[p] = MOUSE; depth[p] = depth[s] + 1; queue.push(p) }
      } else if (pt === 1 && outcome === CAT) {
        result[p] = CAT; depth[p] = depth[s] + 1; queue.push(p)
      }
    }
    if (layers.length === 0 || depth[s] !== layers[layers.length - 1].depth) layers.push({ depth: depth[s], decided: 0 })
    layers[layers.length - 1].decided += 1
  }
  const start = id(mouseStart, catStart, 0)
  const mouseWins = result[start] === MOUSE && depth[start] <= 1000
  return { mouseWins, outcome: result[start], moves: depth[start], layers, cells: n }
}

export function buildTrace({ grid, catJump, mouseJump }) {
  const input = { grid, catJump, mouseJump }
  const game = solveGame(grid, catJump, mouseJump)
  const frames = [{ phase: 'start', activeLine: L('mark finished states'), depth: 0, decided: 0, message: 'Finished states are known: the mouse on food, or the cat on the mouse or on food.' }]
  let decided = 0
  for (const layer of game.layers) {
    decided += layer.decided
    frames.push({ phase: 'layer', activeLine: L('a state where the mouse moves is a mouse win'), depth: layer.depth, decided, message: `${decided} states decided after ${layer.depth} moves.` })
  }
  const result = game.mouseWins
  frames.push({ phase: 'done', activeLine: L('return whether the start state'), depth: game.moves, decided, message: result ? `The mouse wins in ${game.moves} moves.` : 'The mouse cannot force food within 1000 turns, so the cat wins.' })
  return { input, result, frames }
}

export const code = `can the mouse force food first when both play best
  mark finished states: mouse on food, or cat on food or on the mouse
  repeat until no state changes
    a state where the mouse moves is a mouse win if some move reaches a mouse win
    a state where the mouse moves is a cat win if every move reaches a cat win
    a state where the cat moves is a mouse win if every move reaches a mouse win
    a state where the cat moves is a cat win if some move reaches a cat win
  a draw within 1000 turns counts as a cat win
  return whether the start state is a mouse win`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def can_mouse_win(grid, catJump, mouseJump):
    rows = len(grid)
    cols = len(grid[0])
    n = rows * cols
    flat = ''.join(grid)
    food = flat.index('F')
    mouse_start = flat.index('M')
    cat_start = flat.index('C')

    def reachable(cell, jump):
        r0, c0 = divmod(cell, cols)
        out = [cell]
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            for step in range(1, jump + 1):
                r, c = r0 + dr * step, c0 + dc * step
                if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == '#':
                    break
                out.append(r * cols + c)
        return out

    move_m = [reachable(cell, mouseJump) for cell in range(n)]
    move_c = [reachable(cell, catJump) for cell in range(n)]
    MOUSE, CAT = 1, 2
    result = {}
    depth = {}
    remaining = {}
    queue = deque()
    for m in range(n):
        for c in range(n):
            for t in range(2):
                state = (m, c, t)
                remaining[state] = len(move_m[m]) if t == 0 else len(move_c[c])
                if flat[m] == '#' or flat[c] == '#':
                    result[state] = 0
                    continue
                if m == food:
                    result[state] = MOUSE
                    depth[state] = 0
                    queue.append(state)
                elif c == food or c == m:
                    result[state] = CAT
                    depth[state] = 0
                    queue.append(state)
    while queue:
        m, c, t = queue.popleft()
        outcome = result[(m, c, t)]
        if t == 0:
            preds = [(m, y, 1) for y in move_c[c]]
        else:
            preds = [(x, c, 0) for x in move_m[m]]
        for p in preds:
            if p in result:
                continue
            pm, pc, pt = p
            if pt == 0 and outcome == CAT:
                remaining[p] -= 1
                if remaining[p] == 0:
                    result[p] = CAT
                    depth[p] = depth[(m, c, t)] + 1
                    queue.append(p)
            elif pt == 0 and outcome == MOUSE:
                result[p] = MOUSE
                depth[p] = depth[(m, c, t)] + 1
                queue.append(p)
            elif pt == 1 and outcome == MOUSE:
                remaining[p] -= 1
                if remaining[p] == 0:
                    result[p] = MOUSE
                    depth[p] = depth[(m, c, t)] + 1
                    queue.append(p)
            elif pt == 1 and outcome == CAT:
                result[p] = CAT
                depth[p] = depth[(m, c, t)] + 1
                queue.append(p)
    start = (mouse_start, cat_start, 0)
    return result.get(start) == MOUSE and depth[start] <= 1000
`
