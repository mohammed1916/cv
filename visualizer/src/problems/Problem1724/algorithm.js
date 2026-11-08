// Edge length limited paths II: build a minimum spanning forest once; a query asks for the largest edge on the forest path.
const JS_LINES = [
  { text: 'const parent = Array.from({ length: n }, (_, i) => i)', py: 'self.parent = list(range(n))' },
  { text: 'const tree = Array.from({ length: n }, () => [])', py: 'self.tree = [[] for _' },
  { text: 'for (const [u, v, w] of [...edgeList].sort((a, b) => a[2] - b[2])) {', py: 'for u, v, w in sorted' },
  { text: 'if (find(u) !== find(v)) { parent[find(u)] = find(v); tree[u].push([v, w]); tree[v].push([u, w]) }', py: 'if self.find(u) != self.find(v)' },
  { text: '}', py: null },
  { text: 'query(p, q, limit) {', py: 'def query' },
  { text: 'const best = maxEdgeOnPath(tree, p, q)', py: 'best = self.max_edge_on_path' },
  { text: 'return best !== null && best < limit', py: 'return best is not None' },
  { text: '}', py: null },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `class DistanceLimitedPathsExist:
    def __init__(self, n, edgeList):
        self.parent = list(range(n))
        self.tree = [[] for _ in range(n)]
        for u, v, w in sorted(edgeList, key=lambda e: e[2]):
            if self.find(u) != self.find(v):
                self.parent[self.find(u)] = self.find(v)
                self.tree[u].append((v, w))
                self.tree[v].append((u, w))

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def query(self, p, q, limit):
        best = self.max_edge_on_path(p, q)
        return best is not None and best < limit

    def max_edge_on_path(self, p, q):
        best = {p: 0}
        stack = [p]
        while stack:
            x = stack.pop()
            for y, w in self.tree[x]:
                if y not in best:
                    best[y] = max(best[x], w)
                    stack.append(y)
        return best.get(q)
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return best')]))

export const phases = [
  { id: 'build', label: 'Build', description: 'Edges are added shortest first; an edge that joins two components stays in the forest.' },
  { id: 'query', label: 'Query', description: 'Walk the forest path from p to q, keeping the largest edge seen.' },
  { id: 'answer', label: 'Answer', description: 'True when the path exists and its largest edge is below the limit.' },
  { id: 'done', label: 'Result', description: 'One answer per query, in order.' },
]

export const examples = [
  { label: 'Path blocked by a long edge', input: '{"n":4,"edgeList":[[0,1,3],[1,2,7],[2,3,2],[0,3,9]],"queries":[[0,2,8],[1,3,3],[0,3,10]]}' },
  { label: 'Two components', input: '{"n":4,"edgeList":[[0,1,2],[2,3,4]],"queries":[[0,1,3],[0,3,9]]}' },
  { label: 'Limit equals the edge', input: '{"n":2,"edgeList":[[0,1,6]],"queries":[[0,1,6]]}' },
  { label: 'Unreachable target', input: '{"n":3,"edgeList":[[0,1,2]],"queries":[[0,2,9]]}' },
  { label: 'Parallel edges', input: '{"n":3,"edgeList":[[0,1,4],[0,1,2]],"queries":[[0,1,3]]}' },
  { label: 'Long run: 15 edges', input: '{"n":10,"edgeList":[[9,6,6],[4,3,14],[4,0,11],[6,0,8],[7,8,13],[0,7,11],[1,4,20],[8,9,18],[4,9,5],[0,6,8],[3,4,3],[7,0,9],[3,4,18],[1,0,17],[3,4,6]],"queries":[[6,5,14],[8,9,18],[4,8,25],[7,4,10],[7,8,19],[5,0,10],[2,0,3],[1,2,18]]}' },
]

export const complexity = 'O(E log E) to build the forest, then O(n) per query for the walk in this visual. A binary-lifting table would answer queries in O(log n).'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.n) || !Array.isArray(input.edgeList) || !Array.isArray(input.queries)) throw new Error('Use an object with n, edgeList and queries.')
  const { n, edgeList, queries } = input
  if (n < 2 || n > 10) throw new Error('n is from 2 to 10 (visual cap).')
  if (edgeList.length < 1 || edgeList.length > 15) throw new Error('edgeList has 1 to 15 edges (visual cap).')
  for (const [u, v, w] of edgeList) {
    if (![u, v, w].every(Number.isInteger) || u < 0 || v < 0 || u >= n || v >= n || u === v || w < 1) throw new Error('Each edge is [u, v, distance] with valid nodes and distance at least 1.')
  }
  for (const [p, q, limit] of queries) {
    if (![p, q, limit].every(Number.isInteger) || p < 0 || q < 0 || p >= n || q >= n || limit < 1) throw new Error('Each query is [p, q, limit] with valid nodes and limit at least 1.')
  }
  return { n, edgeList, queries }
}

export function buildTrace({ n, edgeList, queries }) {
  const frames = []
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const tree = Array.from({ length: n }, () => [])
  const forest = []
  const sorted = [...edgeList].sort((a, b) => a[2] - b[2])
  const snap = extra => ({ forest: forest.map(e => [...e]), ...extra })
  for (const [u, v, w] of sorted) {
    if (find(u) !== find(v)) {
      parent[find(u)] = find(v)
      tree[u].push([v, w]); tree[v].push([u, w])
      forest.push([u, v, w])
      frames.push({ phase: 'build', activeLine: 3, edge: [u, v, w], joined: true, message: `Edge ${u}-${v} (${w}) joins two components.`, snapshot: snap({}) })
    } else {
      frames.push({ phase: 'build', activeLine: 3, edge: [u, v, w], joined: false, message: `Edge ${u}-${v} (${w}) would close a cycle: skipped.`, snapshot: snap({}) })
    }
  }
  const answers = []
  queries.forEach(([p, q, limit], j) => {
    const best = new Map([[p, 0]])
    const stack = [p]
    while (stack.length) {
      const x = stack.pop()
      for (const [y, w] of tree[x]) if (!best.has(y)) { best.set(y, Math.max(best.get(x), w)); stack.push(y) }
    }
    const max = best.has(q) ? best.get(q) : null
    const ok = max !== null && max < limit
    answers.push(ok)
    frames.push({ phase: 'query', activeLine: 7, query: j, path: { p, q, max }, message: `Query ${j + 1}: largest edge between ${p} and ${q} is ${max === null ? 'none (not connected)' : max}.`, snapshot: snap({ answers: [...answers] }) })
    frames.push({ phase: 'answer', activeLine: 8, query: j, path: { p, q, max }, verdict: ok, message: `Limit ${limit}: ${ok ? 'true' : 'false'}.`, snapshot: snap({ answers: [...answers] }) })
  })
  frames.push({ phase: 'done', activeLine: 9, query: -1, result: answers, message: `Answers: ${answers.map(String).join(', ')}.`, snapshot: snap({ answers: [...answers] }) })
  return { input: { n, edgeList, queries }, result: answers, forest, frames }
}
