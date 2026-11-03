// Breadth-first search over the 64 squares. A bishop move slides any positive distance along one diagonal,
// so each square's neighbours are every square on the four diagonals that stay on the board.
// The first time a square is reached gives its fewest moves, because every move costs one.

const SIZE = 8

const codeLines = [
  'dist holds the source at distance 0',
  'queue starts with the source',
  'while the queue is not empty',
  '  take the front square (r, c)',
  '  for each of the four diagonal directions',
  '    step along the direction while the square is on the board',
  '      if the square is unvisited, set its distance to dist[r, c] plus one and enqueue it',
  'return the distance of the target, or -1 if it was never set',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'from collections import deque',
  'def bishop_moves(source, target):',
  '    dist = {source: 0}',
  '    queue = deque([source])',
  '    while queue:',
  '        r, c = queue.popleft()',
  '        for dr, dc in ((1, 1), (1, -1), (-1, 1), (-1, -1)):',
  '            nr, nc = r + dr, c + dc',
  '            while 1 <= nr <= 8 and 1 <= nc <= 8:',
  '                if (nr, nc) not in dist:',
  '                    dist[(nr, nc)] = dist[(r, c)] + 1',
  '                    queue.append((nr, nc))',
  '                nr += dr',
  '                nc += dc',
  '    return dist.get(target, -1)',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

const isSquare = s => Array.isArray(s) && s.length === 2 && s.every(v => Number.isInteger(v) && v >= 1 && v <= SIZE)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with source and target.')
  const { source, target } = input
  if (!isSquare(source) || !isSquare(target)) throw new Error('source and target are [row, column] pairs from 1 to 8.')
  if (source[0] === target[0] && source[1] === target[1]) throw new Error('source and target must differ.')
  return { source, target }
}

export function buildTrace({ source, target }) {
  const frames = []
  const dist = new Map([[`${source[0]},${source[1]}`, 0]])
  const key = (r, c) => `${r},${c}`
  const snapshot = () => [...dist.entries()].map(([k, d]) => [k.split(',').map(Number), d])
  const queue = [source]
  const tgt = key(target[0], target[1])

  frames.push({ phase: 'start', pythonLine: P('dist = {source'), activeLine: L('dist holds the source'), at: source, queue: [...queue], dir: null, target: null, dist: snapshot(), message: `Start at ${source[0]},${source[1]} with distance 0.` })
  frames.push({ phase: 'start', pythonLine: P('queue = deque'), activeLine: L('queue starts with'), at: source, queue: [...queue], dir: null, target: null, dist: snapshot(), message: 'The queue holds only the source.' })

  let head = 0
  while (head < queue.length) {
    const [r, c] = queue[head]
    head += 1
    frames.push({ phase: 'pop', pythonLine: P('r, c = queue.popleft()'), activeLine: L('take the front square'), at: [r, c], queue: queue.slice(head), dir: null, target: null, dist: snapshot(), message: `Take ${r},${c} (distance ${dist.get(key(r, c))}) from the front.` })
    for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      let nr = r + dr
      let nc = c + dc
      while (nr >= 1 && nr <= SIZE && nc >= 1 && nc <= SIZE) {
        const k = key(nr, nc)
        if (!dist.has(k)) {
          dist.set(k, dist.get(key(r, c)) + 1)
          queue.push([nr, nc])
          frames.push({ phase: 'visit', pythonLine: P('dist[(nr, nc)]'), activeLine: L('if the square is unvisited'), at: [nr, nc], queue: queue.slice(head), dir: [dr, dc], target: k === tgt ? [nr, nc] : null, dist: snapshot(), message: `${nr},${nc} is reached in ${dist.get(k)} move${dist.get(k) === 1 ? '' : 's'} along the diagonal from ${r},${c}.` })
        }
        nr += dr
        nc += dc
      }
    }
  }
  const answer = dist.has(tgt) ? dist.get(tgt) : -1
  frames.push({ phase: 'done', pythonLine: P('return dist.get'), activeLine: L('return the distance of the target'), at: target, queue: [], dir: null, target: target, dist: snapshot(), message: answer === -1 ? 'The target was never reached: the colours differ.' : `Fewest bishop moves: ${answer}.` })
  return { input: { source, target }, result: answer, frames }
}
