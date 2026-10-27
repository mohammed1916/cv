export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter an object with points and k.')
  const { points, k } = input
  if (!Array.isArray(points) || points.length < 2 || points.length > 12) throw new Error('Enter 2 to 12 points as [x, y] pairs.')
  for (const p of points) if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && Math.abs(v) <= 10)) throw new Error('Each point is [x, y] with integers from -10 to 10.')
  for (let i = 1; i < points.length; i++) if (points[i][0] <= points[i - 1][0]) throw new Error('x values must be strictly increasing.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  if (!points.some((p, i) => i > 0 && p[0] - points[i - 1][0] <= k)) throw new Error('At least one neighbouring pair must be within k.')
  return { points, k }
}

export function buildTrace({ points, k }) {
  let best = -Infinity
  const queue = []
  const frames = [{ phase: 'start', j: null, queue: [], best: null, activeLine: L('set best to negative infinity'), message: 'Keep indices i whose value y minus x is larger than every later candidate.' }]
  points.forEach(([xj, yj], j) => {
    while (queue.length && xj - points[queue[0]][0] > k) queue.shift()
    if (queue.length) {
      const i = queue[0]
      best = Math.max(best, points[i][1] - points[i][0] + yj + xj)
    }
    while (queue.length && points[queue[queue.length - 1]][1] - points[queue[queue.length - 1]][0] <= yj - xj) queue.pop()
    queue.push(j)
    frames.push({ phase: 'point', j, queue: queue.slice(), best, activeLine: L('add j to the back'), message: queue.length > 1 || best > -Infinity ? `Point ${j} pairs with the front of the queue; best so far ${best}.` : `Point ${j} has no partner within ${k} yet.` })
  })
  frames.push({ phase: 'done', j: null, queue: queue.slice(), best, activeLine: L('return best'), message: `Maximum value: ${best}.` })
  return { input: { points, k }, result: best, frames }
}

export const code = `maximum of y_i + y_j + |x_i - x_j| over pairs i before j with x_j - x_i at most k
  set best to negative infinity and queue to an empty deque
  for each point j from left to right
    remove from the front of queue every index i with x_j minus x_i more than k
    if queue is not empty then
      set best to the larger of best and (y_i - x_i) at the front, plus y_j plus x_j
    remove from the back of queue every index whose y minus x is at most y_j minus x_j
    add j to the back of queue
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def find_max_value_of_equation(points, k):
    best = float('-inf')
    dq = deque()
    for j, (xj, yj) in enumerate(points):
        while dq and xj - points[dq[0]][0] > k:
            dq.popleft()
        if dq:
            i = dq[0]
            best = max(best, points[i][1] - points[i][0] + yj + xj)
        while dq and points[dq[-1]][1] - points[dq[-1]][0] <= yj - xj:
            dq.pop()
        dq.append(j)
    return best
`
