export const phases = [
  { id: 'start', label: 'Distances', description: 'Breadth-first search from server 0 gives each server its hop distance d.' },
  { id: 'server', label: 'Server rounds', description: 'A server sends every patience seconds until its reply can return, which takes 2d seconds.' },
  { id: 'last', label: 'Last send', description: 'The last send happens at the largest multiple of patience before the reply arrives; its message is in transit until that arrival.' },
  { id: 'done', label: 'Result', description: 'The network is idle one second after the last message arrives.' },
]

export const code = `function networkBecomesIdle(edges, patience) {
  const n = patience.length
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }
  const dist = new Array(n).fill(-1)
  dist[0] = 0
  const queue = [0]
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head]
    for (const v of adj[u]) {
      if (dist[v] === -1) {
        dist[v] = dist[u] + 1
        queue.push(v)
      }
    }
  }
  let answer = 0
  for (let i = 1; i < n; i++) {
    const round = 2 * dist[i]
    const lastSend = Math.floor((round - 1) / patience[i]) * patience[i]
    answer = Math.max(answer, lastSend + round)
  }
  return answer + 1
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def network_becomes_idle(edges, patience):
    n = len(patience)
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    dist = [-1] * n
    dist[0] = 0
    queue = deque([0])
    while queue:
        u = queue.popleft()
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                queue.append(v)
    answer = 0
    for i in range(1, n):
        round_trip = 2 * dist[i]
        last_send = ((round_trip - 1) // patience[i]) * patience[i]
        answer = max(answer, last_send + round_trip)
    return answer + 1
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"edges":[[0,1],[1,2]],"patience":[0,2,1]}.') }
  const { edges, patience } = obj || {}
  if (!Array.isArray(patience) || patience.length < 2 || patience.length > 12) throw new Error('patience must have 2 to 12 entries here.')
  if (!patience.every((p, i) => (i === 0 ? p === 0 : Number.isInteger(p) && p >= 1 && p <= 10))) {
    throw new Error('patience[0] must be 0 and other values must be whole numbers from 1 to 10.')
  }
  if (!Array.isArray(edges) || edges.length < patience.length - 1) throw new Error('Give enough edges to connect every server.')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(v => Number.isInteger(v) && v >= 0 && v < patience.length) || e[0] === e[1]) {
      throw new Error('Each edge is [u, v] between two different servers.')
    }
  }
  const adj = patience.map(() => [])
  edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u) })
  const seen = new Set([0]), queue = [0]
  for (let h = 0; h < queue.length; h++) for (const v of adj[queue[h]]) if (!seen.has(v)) { seen.add(v); queue.push(v) }
  if (seen.size !== patience.length) throw new Error('Every server must be connected to server 0.')
  return { edges, patience }
}

export function buildTrace({ edges, patience }) {
  const frames = []
  const n = patience.length
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const dist = new Array(n).fill(-1)
  dist[0] = 0
  const queue = [0]
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head]
    for (const v of adj[u]) if (dist[v] === -1) { dist[v] = dist[u] + 1; queue.push(v) }
  }
  const info = []
  let answer = 0
  const add = (phase, c, p, message, i) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { n, dist: dist.slice(), patience, info: info.slice(), current: i, answer },
  })
  add('start', 'const dist = new Array', 'dist = [-1]', 'Hop distances from server 0 are known.', -1)
  for (let i = 1; i < n; i++) {
    const round = 2 * dist[i]
    const lastSend = Math.floor((round - 1) / patience[i]) * patience[i]
    const arrival = lastSend + round
    answer = Math.max(answer, arrival)
    info.push({ i, round, lastSend, arrival })
    add('server', 'const round = 2', 'round_trip = 2', `Server ${i}: round trip ${round}, sends every ${patience[i]} second(s).`, i)
    add('last', 'const lastSend', 'last_send = ', `Server ${i}: last send at ${lastSend}, last message arrives at ${arrival}.`, i)
  }
  add('done', 'return answer + 1', 'return answer + 1', `The network is idle from second ${answer + 1}.`, -1)
  return { input: { edges, patience }, result: answer + 1, frames }
}
