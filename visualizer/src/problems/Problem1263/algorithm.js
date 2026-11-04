const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 2 || grid.length > 6 || grid.some(row => typeof row !== 'string' || row.length !== grid[0].length)) throw new Error('Use a JSON array of 2 to 6 equal-length strings.')
  if (grid[0].length < 2 || grid[0].length > 6) throw new Error('Each row has 2 to 6 characters.')
  const cells = grid.join('')
  if ([...cells].some(ch => !'#.SBT'.includes(ch))) throw new Error('Use only # (wall), . (floor), S (player), B (box) and T (target).')
  for (const ch of 'SBT') if (cells.split(ch).length !== 2) throw new Error(`Use exactly one ${ch}.`)
  return grid
}

export function buildTrace(grid) {
  const rows = grid.length, cols = grid[0].length
  const find = ch => { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === ch) return [r, c]; return null }
  const player0 = find('S'), box0 = find('B'), target = find('T')
  const open = ([r, c]) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== '#'
  const same = (a, b) => a[0] === b[0] && a[1] === b[1]
  const key = (box, player) => `${box[0]},${box[1]},${player[0]},${player[1]}`
  const dist = new Map([[key(box0, player0), 0]])
  // 0-1 BFS: walking goes to the front of the deque, pushing goes to the back.
  const queue = [{ cost: 0, box: box0, player: player0 }]
  const frames = [{ pythonLine: 19, phase: 'start', activeLine: L('const dist = new Map'), box: box0, player: player0, cost: 0, message: 'The player starts beside the box. Walking costs 0 and each push costs 1.' }]
  let answer = -1
  let last = { box: box0, player: player0 }
  while (queue.length) {
    const { cost, box, player } = queue.shift()
    if (dist.get(key(box, player)) !== cost) continue
    if (same(box, target)) { answer = cost; last = { box, player }; break }
    frames.push({ pythonLine: 27, phase: 'explore', activeLine: L('for (const [dr, dc] of'), box, player, cost, message: `Box at ${box}, player at ${player}, cost ${cost}.` })
    for (const [dr, dc] of DIRS) {
      const step = [player[0] + dr, player[1] + dc]
      if (!open(step)) continue
      if (same(step, box)) {
        const pushed = [box[0] + dr, box[1] + dc]
        if (!open(pushed)) continue
        const k = key(pushed, box), nc = cost + 1
        if (!dist.has(k) || dist.get(k) > nc) { dist.set(k, nc); queue.push({ cost: nc, box: pushed, player: box }) }
      } else {
        const k = key(box, step)
        if (!dist.has(k) || dist.get(k) > cost) { dist.set(k, cost); queue.unshift({ cost, box, player: step }) }
      }
    }
  }
  frames.push({ pythonLine: answer === -1 ? 41 : 26, phase: 'done', activeLine: L('return -1'), box: last.box, player: last.player, cost: answer, message: answer === -1 ? 'The box can never reach the target.' : `The box reaches the target after ${answer} push(es).` })
  return { input: grid, result: answer, frames }
}

export const code = `function minPushes(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const find = ch => grid.flatMap((row, r) => [...row].map((x, c) => (x === ch ? [r, c] : null))).find(Boolean)
  const player = find('S')
  const box = find('B')
  const target = find('T')
  const open = ([r, c]) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== '#'
  const same = (a, b) => a[0] === b[0] && a[1] === b[1]
  const key = (b, p) => b + "|" + p
  const dist = new Map([[key(box, player), 0]])
  const deque = [[0, box, player]]
  while (deque.length > 0) {
    const [cost, b, p] = deque.shift()
    if (dist.get(key(b, p)) !== cost) continue
    if (same(b, target)) return cost
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const step = [p[0] + dr, p[1] + dc]
      if (!open(step)) continue
      if (same(step, b)) {
        const pushed = [b[0] + dr, b[1] + dc]
        if (!open(pushed)) continue
        if ((dist.get(key(pushed, b)) ?? Infinity) > cost + 1) {
          dist.set(key(pushed, b), cost + 1)
          deque.push([cost + 1, pushed, b])
        }
      } else if ((dist.get(key(b, step)) ?? Infinity) > cost) {
        dist.set(key(b, step), cost)
        deque.unshift([cost, b, step])
      }
    }
  }
  return -1
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque


def min_pushes(grid):
    rows, cols = len(grid), len(grid[0])

    def find(ch):
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == ch:
                    return (r, c)

    player, box, target = find('S'), find('B'), find('T')

    def open_cell(cell):
        r, c = cell
        return 0 <= r < rows and 0 <= c < cols and grid[r][c] != '#'

    dist = {(box, player): 0}
    queue = deque([(0, box, player)])
    while queue:
        cost, b, p = queue.popleft()
        if dist[(b, p)] != cost:
            continue
        if b == target:
            return cost
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            step = (p[0] + dr, p[1] + dc)
            if not open_cell(step):
                continue
            if step == b:
                pushed = (b[0] + dr, b[1] + dc)
                if not open_cell(pushed):
                    continue
                if dist.get((pushed, b), float('inf')) > cost + 1:
                    dist[(pushed, b)] = cost + 1
                    queue.append((cost + 1, pushed, b))
            elif dist.get((b, step), float('inf')) > cost:
                dist[(b, step)] = cost
                queue.appendleft((cost, b, step))
    return -1
`
