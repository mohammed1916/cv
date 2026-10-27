function checkTree(edges, name) {
  if (!Array.isArray(edges)) throw new Error(`${name} must be a list of edges.`)
  const n = edges.length + 1
  if (n > 7) throw new Error(`${name} may have at most 6 edges.`)
  const parentOf = Array.from({ length: n }, (_, i) => i)
  const find = x => (parentOf[x] === x ? x : (parentOf[x] = find(parentOf[x])))
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || e.some(v => !Number.isInteger(v) || v < 0 || v >= n)) throw new Error(`Each edge in ${name} joins two nodes from 0 to ${n - 1}.`)
    if (find(e[0]) === find(e[1])) throw new Error(`${name} must be a tree without cycles.`)
    parentOf[find(e[0])] = find(e[1])
  }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with edges1 and edges2.')
  const { edges1, edges2 } = input
  checkTree(edges1, 'edges1')
  checkTree(edges2, 'edges2')
  return { edges1, edges2 }
}

function diameterWithTrace(edges, label, frames, phase, activeLine) {
  const n = edges.length + 1
  const adjacency = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adjacency[a].push(b); adjacency[b].push(a) }
  const farthest = start => {
    const dist = Array(n).fill(-1)
    dist[start] = 0
    const stack = [start]
    let best = start
    while (stack.length) {
      const v = stack.pop()
      for (const w of adjacency[v]) {
        if (dist[w] === -1) {
          dist[w] = dist[v] + 1
          stack.push(w)
          if (dist[w] > dist[best]) best = w
        }
      }
    }
    return { node: best, dist: dist[best] }
  }
  const first = farthest(0)
  const second = farthest(first.node)
  frames.push({ phase, activeLine, label, value: second.dist, message: `${label}: the farthest pair is ${first.node} and ${second.node}, so the diameter is ${second.dist}.` })
  return second.dist
}

export function buildTrace({ edges1, edges2 }) {
  const frames = []
  frames.push({ phase: 'start', activeLine: L('find the diameter d1'), label: 'Start', value: null, message: 'Find each tree’s diameter with two searches for the farthest node.' })
  const d1 = diameterWithTrace(edges1, 'Tree 1', frames, 'first', L('find the diameter d1'))
  const d2 = diameterWithTrace(edges2, 'Tree 2', frames, 'second', L('find the diameter d2'))
  const radius1 = Math.ceil(d1 / 2), radius2 = Math.ceil(d2 / 2)
  frames.push({ phase: 'radius', activeLine: L('set radius'), label: `Radii ${radius1} and ${radius2}`, value: null, message: `Radii are ${radius1} and ${radius2}.` })
  const joined = radius1 + radius2 + 1
  frames.push({ phase: 'join', activeLine: L('set joined'), label: `Joined path ${joined}`, value: joined, message: `Joining centres with one edge gives a path of ${joined}.` })
  const result = Math.max(d1, d2, joined)
  frames.push({ phase: 'done', activeLine: L('return the largest'), label: `Minimum diameter ${result}`, value: result, message: `Minimum diameter: ${result}.` })
  return { input: { edges1, edges2 }, result, frames }
}

export const code = `minimum diameter after joining one node of each tree with an edge
  find the diameter d1 of the first tree by two searches for farthest nodes
  find the diameter d2 of the second tree the same way
  set radius1 to d1 rounded up over 2, and radius2 to d2 rounded up over 2
  set joined to radius1 plus radius2 plus 1
  return the largest of d1, d2 and joined`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_merged_diameter(edges1, edges2):
    def diameter(edges):
        n = len(edges) + 1
        adjacency = [[] for _ in range(n)]
        for a, b in edges:
            adjacency[a].append(b)
            adjacency[b].append(a)

        def farthest(start):
            dist = [-1] * n
            dist[start] = 0
            stack = [start]
            best = start
            while stack:
                v = stack.pop()
                for w in adjacency[v]:
                    if dist[w] == -1:
                        dist[w] = dist[v] + 1
                        stack.append(w)
                        if dist[w] > dist[best]:
                            best = w
            return best, dist[best]

        far, _ = farthest(0)
        _, d = farthest(far)
        return d

    d1 = diameter(edges1)
    d2 = diameter(edges2)
    joined = (d1 + 1) // 2 + (d2 + 1) // 2 + 1
    return max(d1, d2, joined)
`
