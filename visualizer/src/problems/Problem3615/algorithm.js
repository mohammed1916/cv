export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n, edges and label.')
  const { n, edges, label } = input
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n must be an integer from 1 to 8 in this visualization.')
  if (!Array.isArray(edges) || edges.length > 28) throw new Error('edges must be an array of at most 28 pairs.')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || !Number.isInteger(e[1]) || e[0] < 0 || e[1] < 0 || e[0] >= n || e[1] >= n || e[0] === e[1]) throw new Error('Each edge is a pair of different nodes from 0 to n-1.')
  }
  if (typeof label !== 'string' || label.length !== n || !/^[a-z]+$/.test(label)) throw new Error('label must be lowercase letters, one per node.')
  return { n, edges, label }
}

export function buildTrace(input) {
  const { n, edges, label } = input
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const frames = []
  // A state (u, v, mask) means the outer ends of the palindrome are u and v and mask holds every node used.
  let level = new Map()
  for (let u = 0; u < n; u++) level.set(`${u},${u},${1 << u}`, [u, u, 1 << u, 1])
  for (let u = 0; u < n; u++) for (const v of adj[u]) {
    if (label[u] === label[v]) level.set(`${u},${v},${(1 << u) | (1 << v)}`, [u, v, (1 << u) | (1 << v), 2])
  }
  let best = level.size ? Math.max(...[...level.values()].map(s => s[3])) : 0
  frames.push({ phase: 'start', activeLine: L('start every node alone'), states: level.size, best, message: `Start with ${level.size} palindromes of length 1 or 2 with a common center.` })
  while (level.size) {
    const next = new Map()
    for (const [u, v, mask, len] of level.values()) {
      for (const a of adj[u]) {
        if (mask & (1 << a)) continue
        for (const b of adj[v]) {
          if (b === a || (mask & (1 << b)) || label[a] !== label[b]) continue
          const nm = mask | (1 << a) | (1 << b)
          const key = `${a},${b},${nm}`
          if (!next.has(key)) next.set(key, [a, b, nm, len + 2])
        }
      }
    }
    if (next.size === 0) break
    best = Math.max(best, ...[...next.values()].map(s => s[3]))
    level = next
    frames.push({ phase: 'grow', activeLine: L('add the two new ends'), states: level.size, best, message: `Growing outward: ${level.size} states, best length ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the best length'), states: 0, best, message: `Longest palindromic path: ${best}.` })
  return { input: { n, edges, label }, result: best, frames }
}

export const code = `longest palindromic path (n, edges, label):
  start every node alone, and every edge whose ends share a letter
  set best to the longest of these starting palindromes
  while some state can grow do
    for each state (u, v, used) with ends u and v do
      pick an unused neighbour a of u and an unused neighbour b of v, with different nodes and equal letters
      add the two new ends to the state, marking them used, and count length plus 2
    set best to the longest length reached
  return the best length`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_palindromic_path(n, edges, label):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    level = {}
    for u in range(n):
        level[(u, u, 1 << u)] = 1
    for a, b in edges:
        for u, v in ((a, b), (b, a)):
            if label[u] == label[v]:
                level[(u, v, (1 << u) | (1 << v))] = 2
    best = max(level.values(), default=0)
    while level:
        nxt = {}
        for (u, v, mask), length in level.items():
            for x in adj[u]:
                if mask >> x & 1:
                    continue
                for y in adj[v]:
                    if y == x or mask >> y & 1 or label[x] != label[y]:
                        continue
                    key = (x, y, mask | (1 << x) | (1 << y))
                    if key not in nxt:
                        nxt[key] = length + 2
        if not nxt:
            break
        best = max(best, max(nxt.values()))
        level = nxt
    return best
`
