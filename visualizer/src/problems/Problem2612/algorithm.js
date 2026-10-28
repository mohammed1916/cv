export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, p, banned and k.')
  const { n, p, banned, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('Use between 1 and 12 positions.')
  if (!Number.isInteger(p) || p < 0 || p >= n) throw new Error('p is a position from 0 to n-1.')
  if (!Number.isInteger(k) || k < 1 || k > n) throw new Error('k is a window length from 1 to n.')
  if (!Array.isArray(banned) || banned.some(v => !Number.isInteger(v) || v < 0 || v >= n) || new Set(banned).size !== banned.length) throw new Error('banned lists distinct positions from 0 to n-1.')
  if (banned.includes(p)) throw new Error('The starting position p cannot be banned.')
  return input
}

export function buildTrace({ n, p, banned, k }) {
  const blocked = new Set(banned)
  const dist = Array(n).fill(-1)
  dist[p] = 0
  const queue = [p]
  const frames = [{ phase: 'start', activeLine: L('set every answer to unset'), pos: p, dist: [...dist], message: `The single 1 starts at position ${p}.` }]
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head]
    frames.push({ phase: 'visit', activeLine: L('for each window of length k'), pos: i, dist: [...dist], message: `The 1 can be at position ${i} after ${dist[i]} operation(s).` })
    // A window [s, s+k-1] that holds i sends i to s + (s + k - 1) - i.
    const lo = Math.max(0, i - k + 1), hi = Math.min(i, n - k)
    for (let s = lo; s <= hi; s++) {
      const j = 2 * s + k - 1 - i
      if (blocked.has(j) || dist[j] !== -1) continue
      dist[j] = dist[i] + 1
      queue.push(j)
      frames.push({ phase: 'reach', activeLine: L('set its answer to one more'), pos: j, dist: [...dist], message: `Reversing the window at ${s} moves the 1 from ${i} to ${j}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the answers'), pos: null, dist: [...dist], message: 'Every position has its minimum operation count, or -1 when unreachable.' })
  return { input: { n, p, banned, k }, result: dist, frames }
}

export const code = `minimum reverse operations for every position:
  set every answer to unset and set the answer for p to zero
  set the queue to hold p
  while the queue is not empty
    take the next position i from the queue
    for each window of length k that holds i
      find where i lands after reversing that window
      if the landing spot is banned or already set then skip it
      otherwise set its answer to one more and add it to the queue
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_reverse_operations(n, p, banned, k):
    blocked = set(banned)
    dist = [-1] * n
    dist[p] = 0
    queue = [p]
    for i in queue:
        lo = max(0, i - k + 1)
        hi = min(i, n - k)
        for s in range(lo, hi + 1):
            j = 2 * s + k - 1 - i
            if j not in blocked and dist[j] == -1:
                dist[j] = dist[i] + 1
                queue.append(j)
    return dist
`
