const MAX_SIDE = 8
const MAX_LITTER = 6
const DETAIL_FRAMES = 900

export const phases = [
  { id: 'setup', label: 'Setup', description: 'Number the litter cells and start the queue.' },
  { id: 'pop', label: 'Pop', description: 'Take the oldest state from the queue.' },
  { id: 'stuck', label: 'No energy', description: 'A state with 0 energy cannot move.' },
  { id: 'blocked', label: 'Blocked', description: 'The neighbour is a wall or off the grid.' },
  { id: 'dominated', label: 'Dominated', description: 'An equal or better visit already reached this cell.' },
  { id: 'push', label: 'Push', description: 'A better state joins the queue.' },
  { id: 'level', label: 'Level', description: 'One whole move count finishes in a single step.' },
  { id: 'replay', label: 'Route', description: 'Walk the winning route.' },
  { id: 'done', label: 'Result', description: 'Report the moves or -1.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with classroom and energy.')
  const { classroom, energy } = input
  if (!Array.isArray(classroom) || classroom.length < 1 || classroom.length > MAX_SIDE) throw new Error(`classroom has 1 to ${MAX_SIDE} rows in this view.`)
  if (classroom.some(row => typeof row !== 'string')) throw new Error('Each classroom row is a string.')
  const width = classroom[0].length
  if (width < 1 || width > MAX_SIDE) throw new Error(`Rows have 1 to ${MAX_SIDE} cells in this view.`)
  if (classroom.some(row => row.length !== width)) throw new Error('All rows have the same length.')
  const text2 = classroom.join('')
  if (/[^SLRX.]/.test(text2)) throw new Error('Cells are S, L, R, X or a dot.')
  if (text2.split('S').length !== 2) throw new Error('The grid has exactly one S.')
  if (text2.split('L').length - 1 > MAX_LITTER) throw new Error(`This view handles at most ${MAX_LITTER} litter cells.`)
  if (!Number.isInteger(energy) || energy < 1 || energy > 50) throw new Error('energy is an integer from 1 to 50.')
  return { classroom, energy }
}

export const code = `fewest moves to collect all litter
  number each litter cell and find the start
  if there is no litter the answer is 0
  queue the start with full energy and all litter left
  while the queue has states
    take the oldest state
    if it has 0 energy it cannot move, drop it
    for each of the four neighbours
      skip walls and cells off the grid
      new energy is full on a reset cell, else one less
      collect the litter if the neighbour holds some
      if no litter is left the answer is moves + 1
      skip if this cell and litter set was reached with as much energy
      record the energy and queue the new state
  if the queue empties the answer is -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `from collections import deque


def min_moves(classroom, energy):
    m, n = len(classroom), len(classroom[0])
    bit = {}
    for r, row in enumerate(classroom):
        for c, ch in enumerate(row):
            if ch == 'S':
                start = (r, c)
            elif ch == 'L':
                bit[(r, c)] = len(bit)
    full = (1 << len(bit)) - 1
    if full == 0:
        return 0
    best = {(*start, full): energy}
    queue = deque([(*start, energy, full, 0)])
    while queue:
        r, c, left, mask, moves = queue.popleft()
        if left == 0:
            continue
        for dr, dc in ((-1, 0), (0, 1), (1, 0), (0, -1)):
            nr, nc = r + dr, c + dc
            if not (0 <= nr < m and 0 <= nc < n) or classroom[nr][nc] == 'X':
                continue
            next_left = energy if classroom[nr][nc] == 'R' else left - 1
            next_mask = mask & ~(1 << bit[(nr, nc)]) if (nr, nc) in bit else mask
            if next_mask == 0:
                return moves + 1
            if best.get((nr, nc, next_mask), -1) >= next_left:
                continue
            best[(nr, nc, next_mask)] = next_left
            queue.append((nr, nc, next_left, next_mask, moves + 1))
    return -1
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

const DIRECTIONS = [[-1, 0, 'up'], [0, 1, 'right'], [1, 0, 'down'], [0, -1, 'left']]
const name = (r, c) => `(${r}, ${c})`

export function buildTrace({ classroom, energy }) {
  const m = classroom.length, n = classroom[0].length
  const bit = new Map()
  const litter = []
  let start = null
  classroom.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === 'S') start = [r, c]
    if (ch === 'L') { bit.set(`${r},${c}`, litter.length); litter.push([r, c]) }
  }))
  const full = (1 << litter.length) - 1
  const frames = []
  const best = new Map()
  const nodes = []
  const queue = []
  let head = 0
  const routeOf = node => {
    const cells = []
    for (let at = node; at; at = at.parent) cells.push([at.r, at.c])
    return cells.reverse()
  }
  const bestGrid = mask => Array.from({ length: m }, (_, r) => Array.from({ length: n }, (_, c) => best.get(`${r},${c},${mask}`) ?? null))
  const layers = () => {
    const counts = new Map()
    for (const key of best.keys()) { const mask = Number(key.split(',')[2]); counts.set(mask, (counts.get(mask) ?? 0) + 1) }
    return [...counts].sort((a, b) => b[0] - a[0]).map(([mask, cells]) => ({ mask, cells }))
  }
  const push = (phase, activeLine, pythonLine, message, node, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message,
    at: node ? [node.r, node.c] : start, left: node ? node.left : energy, mask: node ? node.mask : full, moves: node ? node.moves : 0,
    route: node ? routeOf(node) : [start], candidate: null,
    best: bestGrid(node ? node.mask : full), layers: layers(), states: nodes.length,
    queueSize: queue.length - head, queue: queue.slice(head, head + 8).map(({ r, c, left, mask, moves }) => ({ r, c, left, mask, moves })),
    ...extra,
  })
  const finish = (result, last) => {
    const pathNodes = []
    for (let at = last; at; at = at.parent) pathNodes.unshift(at)
    pathNodes.forEach((node, index) => {
      const ch = classroom[node.r][node.c]
      const note = index === 0 ? 'The route starts here.' : ch === 'R' ? 'A reset cell refills the energy.' : ch === 'L' ? 'Litter collected.' : `Energy drops to ${node.left}.`
      push('replay', L('if no litter is left'), P('return moves + 1'), `Move ${node.moves} reaches ${name(node.r, node.c)}. ${note}`, node)
    })
    push('done', L('if no litter is left'), P('return moves + 1'), `All litter is collected in ${result} moves.`, last)
    return { input: { classroom, energy }, result, litter, start, frames, route: routeOf(last) }
  }

  push('setup', L('number each litter'), P("bit[(r, c)] = len(bit)"), litter.length ? `${litter.length} litter cell${litter.length === 1 ? '' : 's'} get a bit each; the student starts at ${name(...start)}.` : `The student starts at ${name(...start)} and the room has no litter.`, null)
  if (full === 0) {
    push('done', L('if there is no litter'), P('return 0'), 'Nothing to collect, so the answer is 0 moves.', null)
    return { input: { classroom, energy }, result: 0, litter, start, frames, route: [start] }
  }
  const first = { r: start[0], c: start[1], left: energy, mask: full, moves: 0, parent: null }
  best.set(`${first.r},${first.c},${full}`, energy)
  nodes.push(first)
  queue.push(first)
  push('setup', L('queue the start'), P('queue = deque('), `Queue the start with ${energy} energy and all litter left. The queue is ordered by moves, so the first finish is the shortest.`, first)
  let detailed = true
  let level = 0
  while (head < queue.length) {
    const node = queue[head++]
    if (detailed && frames.length >= DETAIL_FRAMES) {
      detailed = false
      push('level', L('take the oldest'), P('popleft()'), `Enough single steps for one view: the search continues under the same rules, showing one step per move count.`, node)
    }
    if (detailed) push('pop', L('take the oldest'), P('popleft()'), `Pop ${name(node.r, node.c)} after ${node.moves} moves with ${node.left} energy.`, node)
    else if (node.moves > level) { level = node.moves; push('level', L('take the oldest'), P('popleft()'), `Now on move ${level}: ${queue.length - head + 1} states wait in the queue.`, node) }
    if (node.left === 0) {
      if (detailed) push('stuck', L('if it has 0 energy'), P('if left == 0'), `Energy ran out at ${name(node.r, node.c)}, which is not a reset cell. This branch ends.`, node)
      continue
    }
    for (const [dr, dc, word] of DIRECTIONS) {
      const r = node.r + dr, c = node.c + dc
      if (r < 0 || r >= m || c < 0 || c >= n || classroom[r][c] === 'X') {
        if (detailed) push('blocked', L('skip walls'), P("classroom[nr][nc] == 'X'"), `Going ${word} from ${name(node.r, node.c)} hits ${r < 0 || r >= m || c < 0 || c >= n ? 'the edge' : 'a wall'}.`, node, { candidate: { r, c, kind: 'blocked' } })
        continue
      }
      const ch = classroom[r][c]
      const left = ch === 'R' ? energy : node.left - 1
      const litterBit = bit.get(`${r},${c}`)
      const mask = litterBit === undefined ? node.mask : node.mask & ~(1 << litterBit)
      if (mask === 0) {
        const last = { r, c, left, mask, moves: node.moves + 1, parent: node }
        push('push', L('if no litter is left'), P('if next_mask == 0'), `Going ${word} to ${name(r, c)} collects the last litter after ${last.moves} moves. Nothing in the queue can beat this.`, node, { candidate: { r, c, kind: 'push', left, mask } })
        return finish(last.moves, last)
      }
      const key = `${r},${c},${mask}`
      const seen = best.get(key)
      if (seen !== undefined && seen >= left) {
        if (detailed) push('dominated', L('skip if this cell'), P('best.get((nr, nc, next_mask)'), `${name(r, c)} with this litter set was already reached with ${seen} energy, no later than now. Arriving with ${left} cannot help.`, node, { candidate: { r, c, kind: 'dominated', left, mask } })
        continue
      }
      best.set(key, left)
      const next = { r, c, left, mask, moves: node.moves + 1, parent: node }
      nodes.push(next)
      queue.push(next)
      const got = mask !== node.mask ? ' Litter collected here.' : ch === 'R' ? ' Reset cell: energy is full again.' : ''
      if (detailed) push('push', L('record the energy'), P('queue.append('), `Going ${word} to ${name(r, c)} leaves ${left} energy, better than any earlier visit.${got}`, node, { candidate: { r, c, kind: 'push', left, mask } })
    }
  }
  push('done', L('if the queue empties'), P('return -1'), 'The queue is empty and some litter remains, so the answer is -1.', null, { queueSize: 0, queue: [], route: [start] })
  return { input: { classroom, energy }, result: -1, litter, start, frames, route: null }
}
