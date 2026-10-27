export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the key favorite.')
  const { favorite } = input
  if (!Array.isArray(favorite) || favorite.length < 2 || favorite.length > 8) throw new Error('favorite needs 2 to 8 entries.')
  const n = favorite.length
  favorite.forEach((f, i) => {
    if (!Number.isInteger(f) || f < 0 || f >= n || f === i) throw new Error(`favorite[${i}] must be another employee from 0 to n-1.`)
  })
  return { favorite }
}

export function buildTrace(input) {
  const { favorite } = input
  const n = favorite.length
  const indeg = Array(n).fill(0)
  for (const f of favorite) indeg[f]++
  const depth = Array(n).fill(1)
  const removed = Array(n).fill(false)
  const frames = []
  let current = -1
  let pairTotal = 0
  let longest = 0
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, current, removed: [...removed], depth: [...depth], pairTotal, longest, message,
  })

  snap('start', L('count how many'), 'Count how many employees name each person as their favorite.')
  const queue = []
  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i)
  snap('start', L('queue up the people'), `${queue.length} people nobody names are queued.`)
  while (queue.length) {
    const u = queue.shift()
    current = u
    removed[u] = true
    const f = favorite[u]
    depth[f] = Math.max(depth[f], depth[u] + 1)
    snap('peel', L('let its favorite f take'), `Person ${u} leaves; their favorite ${f} now has chain depth ${depth[f]}.`)
    indeg[f]--
    if (indeg[f] === 0) queue.push(f)
    snap('peel', L('reduce the count'), `Person ${f} is down to ${indeg[f]} remaining admirer(s).`)
  }
  current = -1
  const visited = Array(n).fill(false)
  for (let v = 0; v < n; v++) {
    if (removed[v] || visited[v]) continue
    const cycle = []
    let cur = v
    do {
      visited[cur] = true
      cycle.push(cur)
      cur = favorite[cur]
    } while (cur !== v)
    current = v
    snap('cycle', L('walk the favorite links'), `Cycle through [${cycle.join(', ')}] has ${cycle.length} people.`)
    if (cycle.length === 2) {
      pairTotal += depth[v] + depth[favorite[v]]
      snap('pair', L('if the cycle has two'), `Two-person cycle adds ${depth[v]} + ${depth[favorite[v]]} with their chains.`)
    } else {
      longest = Math.max(longest, cycle.length)
      snap('pair', L('otherwise keep the longest'), `Longest cycle so far: ${longest}.`)
    }
  }
  current = -1
  const result = Math.max(longest, pairTotal)
  snap('done', L('return the larger'), `Answer: ${result}.`)
  return { input, result, frames }
}

export const code = `count how many employees name each person as their favorite
depth of each person starts at one
queue up the people that nobody names
for each person u taken from the queue
  let its favorite f take the longer chain: depth of f becomes depth of u plus one if larger
  reduce the count for f, and queue f when its count reaches zero
for each person v left in a cycle, not yet visited
  walk the favorite links from v until returning to v, marking each person
  if the cycle has two people, add their two depths to the pair total
  otherwise keep the longest cycle length
return the larger of the longest cycle and the pair total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def max_invited(favorite):
    n = len(favorite)
    indeg = [0] * n
    for f in favorite:
        indeg[f] += 1
    depth = [1] * n
    removed = [False] * n
    queue = deque(i for i in range(n) if indeg[i] == 0)
    while queue:
        u = queue.popleft()
        removed[u] = True
        f = favorite[u]
        depth[f] = max(depth[f], depth[u] + 1)
        indeg[f] -= 1
        if indeg[f] == 0:
            queue.append(f)
    visited = [False] * n
    longest = 0
    pair_total = 0
    for v in range(n):
        if removed[v] or visited[v]:
            continue
        length = 0
        cur = v
        while True:
            visited[cur] = True
            length += 1
            cur = favorite[cur]
            if cur == v:
                break
        if length == 2:
            pair_total += depth[v] + depth[favorite[v]]
        else:
            longest = max(longest, length)
    return max(longest, pair_total)
`
