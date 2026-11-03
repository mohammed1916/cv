const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

const STEP = { U: [0, 1], D: [0, -1], L: [-1, 0], R: [1, 0] }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[UDLR]+$/.test(s)) throw new Error('s has 1 to 20 letters from U, D, L, R.')
  if (!Number.isInteger(k) || k < 1 || k > s.length) throw new Error('k is an integer from 1 to the length of s.')
  return { s, k }
}

export function buildTrace({ s, k }) {
  const prefix = [[0, 0]]
  for (const move of s) {
    const [x, y] = prefix[prefix.length - 1]
    const [dx, dy] = STEP[move]
    prefix.push([x + dx, y + dy])
  }
  const [endX, endY] = prefix[s.length]
  const seen = new Set()
  const frames = []
  for (let i = 0; i + k <= s.length; i++) {
    const [px, py] = prefix[i]
    const [cx, cy] = prefix[i + k]
    const point = [px + endX - cx, py + endY - cy]
    const key = point.join(',')
    const fresh = !seen.has(key)
    seen.add(key)
    frames.push({ pythonLine: PY('endpoints.add'), phase: 'scan', activeLine: L('remove the window'), at: i, window: [i, i + k - 1], point, fresh, distinct: seen.size,
      message: `Removing positions ${i + 1} to ${i + k} ends at (${point[0]}, ${point[1]}); ${fresh ? 'a new endpoint' : 'already counted'}.` })
  }
  frames.push({ pythonLine: PY('return len'), phase: 'done', activeLine: L('return the count'), at: -1, window: null, point: null, fresh: false, distinct: seen.size,
    message: `${seen.size} distinct final coordinate${seen.size === 1 ? '' : 's'}.` })
  return { input: { s, k }, result: seen.size, frames }
}

export const code = [
  'count distinct endpoints after removing one length k window',
  '  record the position after each prefix of moves',
  '  the endpoint is the prefix before the window plus the moves after it',
  '  for each window start, add that endpoint to a set',
  '  return the number of distinct endpoints',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def distinct_endpoints(s, k):
    moves = {'U': (0, 1), 'D': (0, -1), 'L': (-1, 0), 'R': (1, 0)}
    prefix = [(0, 0)]
    for move in s:
        dx, dy = moves[move]
        x, y = prefix[-1]
        prefix.append((x + dx, y + dy))
    end_x, end_y = prefix[-1]
    endpoints = set()
    for i in range(len(s) - k + 1):
        cut_x, cut_y = prefix[i + k]
        start_x, start_y = prefix[i]
        endpoints.add((start_x + end_x - cut_x, start_y + end_y - cut_y))
    return len(endpoints)
`
