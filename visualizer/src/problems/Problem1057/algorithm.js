const CODE_TEXT = `campus bikes greedy
  list every worker and bike pair with its Manhattan distance
  sort the pairs by distance, then worker index, then bike index
  mark every worker unassigned and every bike free
  for each pair in sorted order
    if the worker is unassigned and the bike is free then assign them
  return each worker's bike index`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def assign_bikes(workers, bikes):
    pairs = []
    for w, (wx, wy) in enumerate(workers):
        for b, (bx, by) in enumerate(bikes):
            dist = abs(wx - bx) + abs(wy - by)
            pairs.append((dist, w, b))
    pairs.sort()
    answer = [-1] * len(workers)
    bike_used = [False] * len(bikes)
    for dist, w, b in pairs:
        if answer[w] == -1 and not bike_used[b]:
            answer[w] = b
            bike_used[b] = True
    return answer


if __name__ == "__main__":
    print(assign_bikes([[0, 0], [2, 1]], [[1, 2], [3, 3]]))
`

const PY_LINES = python.split('\n')
const L = text => {
  const index = code.findIndex(item => item.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY_LINES.findIndex(item => item.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const MAX_WORKERS = 6
const MAX_BIKES = 8
const MAX_COORD = 20

const isPoint = p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_COORD)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with workers and bikes point lists.')
  const { workers, bikes } = input
  if (!Array.isArray(workers) || workers.length < 1 || workers.length > MAX_WORKERS) throw new Error(`Use 1 to ${MAX_WORKERS} workers.`)
  if (!Array.isArray(bikes) || bikes.length > MAX_BIKES) throw new Error(`Use at most ${MAX_BIKES} bikes.`)
  if (bikes.length < workers.length) throw new Error('There must be at least as many bikes as workers.')
  if (!workers.every(isPoint) || !bikes.every(isPoint)) throw new Error(`Each point is [x, y] with integers from 0 to ${MAX_COORD}.`)
  return { workers, bikes }
}

export function buildTrace({ workers, bikes }) {
  const frames = []
  const pairs = []
  workers.forEach((w, wi) => bikes.forEach((b, bi) => pairs.push({ w: wi, b: bi, d: Math.abs(w[0] - b[0]) + Math.abs(w[1] - b[1]) })))
  const answer = new Array(workers.length).fill(-1)
  const bikeUsed = new Array(bikes.length).fill(false)
  const state = (extra = {}) => ({ workers, bikes, answer: answer.slice(), bikeUsed: bikeUsed.slice(), sorted: [], cursor: -1, status: [], ...extra })
  const add = (phase, line, py, message, extra) => frames.push({ phase, activeLine: L(line), pythonLine: P(py), message, ...state(extra) })
  add('list', 'list every worker', 'pairs.append', `Listed ${pairs.length} worker-bike pairs with Manhattan distances.`, { sorted: pairs.slice(), status: pairs.map(() => 'pending') })
  const sorted = pairs.slice().sort((a, b) => a.d - b.d || a.w - b.w || a.b - b.b)
  const status = sorted.map(() => 'pending')
  add('sort', 'sort the pairs by distance', 'pairs.sort()', 'Sorted by distance, then worker index, then bike index.', { sorted: sorted.slice(), status: status.slice() })
  add('start', 'mark every worker unassigned', 'bike_used = [False]', 'Every worker is unassigned and every bike is free.', { sorted: sorted.slice(), status: status.slice() })
  sorted.forEach((pair, index) => {
    const free = answer[pair.w] === -1 && !bikeUsed[pair.b]
    add('consider', 'for each pair in sorted order', 'for dist, w, b in pairs', `Pair worker ${pair.w} with bike ${pair.b}, distance ${pair.d}.`, { sorted: sorted.slice(), cursor: index, status: status.slice() })
    if (free) {
      answer[pair.w] = pair.b
      bikeUsed[pair.b] = true
      status[index] = 'assigned'
      add('assign', 'then assign them', 'answer[w] = b', `Worker ${pair.w} takes bike ${pair.b}.`, { sorted: sorted.slice(), cursor: index, status: status.slice() })
    } else {
      status[index] = 'skipped'
      add('skip', 'if the worker is unassigned', 'if answer[w] == -1', `Worker ${pair.w} or bike ${pair.b} is already taken; skip this pair.`, { sorted: sorted.slice(), cursor: index, status: status.slice() })
    }
  })
  add('done', 'return each worker', 'return answer', `Worker bikes: ${answer.join(', ')}.`, { sorted: sorted.slice(), cursor: -1, status: status.slice() })
  return { input: { workers, bikes }, result: answer, frames }
}
