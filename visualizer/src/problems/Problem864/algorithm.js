export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || !grid.length || grid.length > 8 || grid.some(r => typeof r !== 'string')) throw new Error('Enter a JSON array of 1 to 8 strings (rows).')
  const cols = grid[0].length
  if (cols < 1 || cols > 8 || grid.some(r => r.length !== cols)) throw new Error('All rows must have the same length, 1 to 8 (visualization cap).')
  let starts = 0
  const keys = [], locks = []
  for (const row of grid) for (const ch of row) {
    if (!/^[.#@a-fA-F]$/.test(ch)) throw new Error(`Invalid character "${ch}". Use . # @ and letters a-f / A-F.`)
    if (ch === '@') starts++
    else if (ch >= 'a' && ch <= 'f') keys.push(ch)
    else if (ch >= 'A' && ch <= 'F') locks.push(ch.toLowerCase())
  }
  if (starts !== 1) throw new Error('The grid needs exactly one start cell "@".')
  if (!keys.length) throw new Error('The grid needs at least one key.')
  if (new Set(keys).size !== keys.length || new Set(locks).size !== locks.length) throw new Error('Each key and each lock may appear at most once.')
  const sorted = [...keys].sort()
  if (sorted.some((c, i) => c !== String.fromCharCode(97 + i))) throw new Error('Keys must be the consecutive letters a, b, c, ... starting at a.')
  if (locks.some(l => !keys.includes(l))) throw new Error('Every lock needs a matching key.')
  return grid
}

export function buildTrace(grid) {
  const m = grid.length, n = grid[0].length
  let sr = 0, sc = 0, k = 0
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
    if (grid[r][c] === '@') { sr = r; sc = c }
    if (grid[r][c] >= 'a' && grid[r][c] <= 'f') k++
  }
  const full = (1 << k) - 1
  const frames = []
  const pops = []
  let queue = [[sr, sc, 0]]
  const seen = new Set([`${sr},${sc},0`])
  const f = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, r: sr, c: sc, mask: 0, steps: 0, popped: -1, queueSize: queue.length, seenSize: seen.size, ...extra })
  f('start', 5, `Start at (${sr}, ${sc}) holding no keys. A state is (row, column, keys held); ${k} keys means full mask ${full.toString(2).padStart(k, '0')}.`)
  let steps = 0
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  while (queue.length) {
    const level = queue
    queue = []
    for (let t = 0; t < level.length; t++) {
      const [r, c, mask] = level[t]
      pops.push([r, c])
      const rest = level.length - t - 1 + queue.length
      if (mask === full) {
        f('done', 12, `State (${r}, ${c}) holds every key after ${steps} moves: that is the shortest path.`, { r, c, mask, steps, popped: pops.length - 1, queueSize: rest })
        return { input: grid, pops, result: steps, frames }
      }
      f('pop', 10, `Pop (${r}, ${c}) with keys ${mask.toString(2).padStart(k, '0')} at distance ${steps}.`, { r, c, mask, steps, popped: pops.length - 1, queueSize: rest })
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc
        if (nr < 0 || nc < 0 || nr >= m || nc >= n || grid[nr][nc] === '#') continue
        const ch = grid[nr][nc]
        let nmask = mask
        if (ch >= 'a' && ch <= 'f') nmask |= 1 << (ch.charCodeAt(0) - 97)
        if (ch >= 'A' && ch <= 'F' && !((mask >> (ch.charCodeAt(0) - 65)) & 1)) {
          f('blocked', 24, `Lock ${ch} at (${nr}, ${nc}) needs key ${ch.toLowerCase()}, which we do not hold. Skip.`, { r, c, mask, steps, popped: pops.length - 1, queueSize: rest, tr: nr, tc: nc })
          continue
        }
        const key = `${nr},${nc},${nmask}`
        if (seen.has(key)) continue
        seen.add(key); queue.push([nr, nc, nmask])
        f('push', 27, `Move to (${nr}, ${nc})${nmask !== mask ? ` and pick up key ${ch}` : ''}: new state with keys ${nmask.toString(2).padStart(k, '0')}.`, { r, c, mask, steps, popped: pops.length - 1, queueSize: rest + 1, tr: nr, tc: nc, nmask })
      }
    }
    steps++
  }
  f('done', 29, 'No reachable state holds all keys, so the answer is -1.', { popped: pops.length - 1 })
  return { input: grid, pops, result: -1, frames }
}

export const code = `def shortestPathAllKeys(grid):
    m, n = len(grid), len(grid[0])
    sr, sc = find('@')
    full = (1 << count_keys) - 1
    queue = deque([(sr, sc, 0)])
    seen = {(sr, sc, 0)}
    steps = 0
    while queue:
        for _ in range(len(queue)):
            r, c, mask = queue.popleft()
            if mask == full:
                return steps
            for dr, dc in ((1,0), (-1,0), (0,1), (0,-1)):
                nr, nc = r + dr, c + dc
                if not (0 <= nr < m and 0 <= nc < n):
                    continue
                ch = grid[nr][nc]
                if ch == '#':
                    continue
                nmask = mask
                if ch.islower():
                    nmask |= 1 << (ord(ch) - 97)
                if ch.isupper() and not (mask >> (ord(ch) - 65)) & 1:
                    continue
                if (nr, nc, nmask) not in seen:
                    seen.add((nr, nc, nmask))
                    queue.append((nr, nc, nmask))
        steps += 1
    return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
