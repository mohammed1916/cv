export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with edges and signalSpeed.')
  const { edges, signalSpeed } = input
  if (!Array.isArray(edges) || edges.length < 1 || edges.length > 8) throw new Error('edges has 1 to 8 entries in this trace.')
  if (!Number.isInteger(signalSpeed) || signalSpeed < 1 || signalSpeed > 10) throw new Error('signalSpeed is an integer from 1 to 10.')
  const n = edges.length + 1
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3 || !Number.isInteger(e[0]) || !Number.isInteger(e[1]) || e[0] < 0 || e[1] < 0 || e[0] >= n || e[1] >= n || e[0] === e[1]) throw new Error('Each edge is [a, b, weight] inside the tree.')
    if (!Number.isInteger(e[2]) || e[2] < 1 || e[2] > 20) throw new Error('Each weight is an integer from 1 to 20.')
  }
  return { edges, signalSpeed }
}

export function buildTrace({ edges, signalSpeed }) {
  const frames = []
  const n = edges.length + 1
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b, w] of edges) { adj[a].push([b, w]); adj[b].push([a, w]) }
  const answer = Array(n).fill(0)
  frames.push({ pythonLine: 6, phase: 'start', activeLine: L('answer = list of zeros'), server: null, branch: null, seen: null, answer: [...answer], message: `${n} servers; signal speed ${signalSpeed}.` })
  for (let c = 0; c < n; c++) {
    let total = 0
    let seen = 0
    frames.push({ pythonLine: 8, phase: 'server', activeLine: L('total = 0; seen = 0'), server: c, branch: null, seen, answer: [...answer], message: `Count pairs for server ${c}.` })
    for (const [nxt, w] of adj[c]) {
      const stack = [[nxt, c, w]]
      let branch = 0
      while (stack.length) {
        const [node, parent, dist] = stack.pop()
        if (dist % signalSpeed === 0) branch += 1
        for (const [child, cw] of adj[node]) if (child !== parent) stack.push([child, node, dist + cw])
      }
      total += seen * branch
      frames.push({ pythonLine: 20, phase: 'branch', activeLine: L('total = total plus seen times that branch count'), server: c, branch, seen, answer: [...answer], message: `This branch has ${branch} reachable server${branch === 1 ? '' : 's'}; ${seen * branch} pairs with earlier branches.` })
      seen += branch
    }
    answer[c] = total
    frames.push({ pythonLine: 22, phase: 'store', activeLine: L('answer[c] = total'), server: c, branch: null, seen, answer: [...answer], message: `Server ${c} has ${total} pairs.` })
  }
  frames.push({ pythonLine: 23, phase: 'done', activeLine: L('return answer'), server: null, branch: null, seen: null, answer: [...answer], message: 'Every server has its count.' })
  return { input: { edges, signalSpeed }, result: answer, frames }
}

export const code = `count connectable server pairs for each server in a weighted tree
  build the adjacency list from the edges
  answer = list of zeros, one per server
  for each server c
    total = 0; seen = 0
    for each neighbor branch of c
      count the servers reached through it whose path weight divides signalSpeed
      total = total plus seen times that branch count
      seen = seen plus that branch count
    answer[c] = total
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_pairs(n, edges, signal_speed):
    adj = [[] for _ in range(n)]
    for a, b, w in edges:
        adj[a].append((b, w))
        adj[b].append((a, w))
    answer = [0] * n
    for c in range(n):
        total = 0
        seen = 0
        for nxt, w in adj[c]:
            stack = [(nxt, c, w)]
            branch = 0
            while stack:
                node, parent, dist = stack.pop()
                if dist % signal_speed == 0:
                    branch += 1
                for child, cw in adj[node]:
                    if child != parent:
                        stack.append((child, node, dist + cw))
            total += seen * branch
            seen += branch
        answer[c] = total
    return answer
`
