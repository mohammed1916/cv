export const code = `function leadsToDestination(n, edges, source, destination) {
  const outgoing = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) outgoing[u].push(v)
  const mark = new Array(n).fill(0)
  function visit(node) {
    if (mark[node] === 1) return false
    if (mark[node] === 2) return true
    mark[node] = 1
    let ok
    if (outgoing[node].length === 0) {
      ok = node === destination
    } else if (node === destination) {
      ok = false
    } else {
      ok = true
      for (const next of outgoing[node]) {
        if (!visit(next)) {
          ok = false
          break
        }
      }
    }
    if (ok) mark[node] = 2
    return ok
  }
  return visit(source)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def leads_to_destination(n, edges, source, destination):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
    state = [0] * n

    def visit(node):
        if state[node] == 1:
            return False
        if state[node] == 2:
            return True
        state[node] = 1
        if not graph[node]:
            ok = node == destination
        elif node == destination:
            ok = False
        else:
            ok = all(visit(nxt) for nxt in graph[node])
        if ok:
            state[node] = 2
        return ok

    return visit(source)


if __name__ == "__main__":
    print(leads_to_destination(4, [[0, 1], [0, 2], [1, 3], [2, 3]], 0, 3))
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

const MAX_NODES = 8
const MAX_EDGES = 12

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges, source and destination.')
  const { n, edges, source, destination } = input
  if (!Number.isInteger(n) || n < 1 || n > MAX_NODES) throw new Error(`Use 1 to ${MAX_NODES} nodes numbered from 0.`)
  if (!Array.isArray(edges) || edges.length > MAX_EDGES) throw new Error(`Use at most ${MAX_EDGES} directed edges.`)
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error('Each edge is [from, to] with node numbers in range.')
  }
  if (!Number.isInteger(source) || source < 0 || source >= n) throw new Error('source is a node number in range.')
  if (!Number.isInteger(destination) || destination < 0 || destination >= n) throw new Error('destination is a node number in range.')
  return { n, edges, source, destination }
}

export function buildTrace({ n, edges, source, destination }) {
  const outgoing = Array.from({ length: n }, () => [])
  edges.forEach(([u, v]) => outgoing[u].push(v))
  const mark = new Array(n).fill(0)
  const path = []
  const frames = []
  const add = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message,
    mark: mark.slice(), path: path.slice(), source, destination, outgoing: outgoing.map(list => list.slice()),
    current: -1, edge: null, verdict: null, ...extra,
  })
  function visit(node) {
    if (mark[node] === 1) {
      add('cycle', 'if (mark[node] === 1)', 'if state[node] == 1', `Node ${node} is already on the path: a cycle can repeat forever.`, { current: node, verdict: false })
      return false
    }
    if (mark[node] === 2) {
      add('known', 'if (mark[node] === 2)', 'if state[node] == 2', `Node ${node} was already proven to reach only the destination.`, { current: node })
      return true
    }
    mark[node] = 1
    path.push(node)
    add('enter', 'mark[node] = 1', 'state[node] = 1', `Enter node ${node}.`, { current: node })
    let ok
    if (outgoing[node].length === 0) {
      ok = node === destination
      add('sink', 'if (outgoing[node].length === 0)', 'if not graph[node]', ok ? `Node ${node} is the destination and has no way out.` : `Node ${node} is a dead end, not the destination.`, { current: node, verdict: ok })
    } else if (node === destination) {
      ok = false
      add('continue', 'else if (node === destination)', 'elif node == destination', `Destination ${node} can keep moving, so some path does not stop here.`, { current: node, verdict: false })
    } else {
      ok = true
      for (const next of outgoing[node]) {
        add('edge', 'for (const next of outgoing[node])', 'for nxt in graph[node]', `Follow the edge ${node} → ${next}.`, { current: node, edge: [node, next] })
        if (!visit(next)) { ok = false; break }
      }
    }
    if (ok) {
      mark[node] = 2
      add('settle', 'if (ok) mark[node] = 2', 'state[node] = 2', `Node ${node} reaches only the destination.`, { current: node, verdict: true })
    }
    path.pop()
    return ok
  }
  const result = visit(source)
  add('done', 'return visit(source)', 'return visit(source)', result ? 'Every path from the source ends at the destination.' : 'Some path loops, dead-ends, or passes through the destination.', { verdict: result })
  return { input: { n, edges, source, destination }, result, frames }
}
