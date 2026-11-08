// Edge length limited paths: sort edges and queries by limit, join edges below the limit, then ask whether the ends are connected.
const JS_LINES = [
  { text: 'const parent = Array.from({ length: n }, (_, i) => i)', py: 'parent = list(range(n))' },
  { text: 'const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))', py: 'def find(x)' },
  { text: 'const edges = [...edgeList].sort((a, b) => a[2] - b[2])', py: 'edges = sorted(edgeList' },
  { text: 'const order = queries.map((_, j) => j).sort((a, b) => queries[a][2] - queries[b][2])', py: 'order = sorted(range' },
  { text: 'const answer = new Array(queries.length).fill(false)', py: 'answer = [False]' },
  { text: 'let e = 0', py: 'e = 0' },
  { text: 'for (const j of order) {', py: 'for j in order' },
  { text: 'const [p, q, limit] = queries[j]', py: 'p, q, limit' },
  { text: 'while (e < edges.length && edges[e][2] < limit) {', py: 'while e < len(edges)' },
  { text: 'parent[find(edges[e][0])] = find(edges[e][1]); e++', py: 'parent[a] = b' },
  { text: '}', py: null },
  { text: 'answer[j] = find(p) === find(q)', py: 'answer[j] = find(p)' },
  { text: '}', py: null },
  { text: 'return answer', py: 'return answer' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def distanceLimitedPathsExist(n, edgeList, queries):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    edges = sorted(edgeList, key=lambda e: e[2])
    order = sorted(range(len(queries)), key=lambda j: queries[j][2])
    answer = [False] * len(queries)
    e = 0
    for j in order:
        p, q, limit = queries[j]
        while e < len(edges) and edges[e][2] < limit:
            a, b = find(edges[e][0]), find(edges[e][1])
            parent[a] = b
            e += 1
        answer[j] = find(p) == find(q)
    return answer
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return answer')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'Every node is its own component.' },
  { id: 'join', label: 'Join edges', description: 'Add every edge whose distance is below the query limit, shortest first.' },
  { id: 'answer', label: 'Answer', description: 'The query is true when its two nodes share a component.' },
  { id: 'done', label: 'Result', description: 'One answer per query, in the original query order.' },
]

export const examples = [
  { label: 'Limit blocks the path', input: '{"n":4,"edgeList":[[0,1,3],[1,2,7],[2,3,2],[0,3,9]],"queries":[[0,2,8],[1,3,3],[0,3,10]]}' },
  { label: 'Direct edge', input: '{"n":2,"edgeList":[[0,1,5]],"queries":[[1,0,6],[0,1,5]]}' },
  { label: 'No edge fits the limit', input: '{"n":2,"edgeList":[[0,1,1]],"queries":[[0,1,0]]}' },
  { label: 'Limit equals the edge length', input: '{"n":2,"edgeList":[[0,1,4]],"queries":[[0,1,4]]}' },
  { label: 'Largest weight', input: '{"n":3,"edgeList":[[0,1,100],[1,2,100]],"queries":[[0,2,100],[0,2,199]]}' },
  { label: 'Long run: 20 edges', input: '{"n":12,"edgeList":[[10,2,39],[5,4,25],[9,4,40],[0,9,44],[4,1,24],[5,7,6],[0,6,15],[7,9,47],[2,0,3],[4,9,36],[6,3,6],[5,4,27],[2,1,33],[2,3,40],[2,3,48],[7,9,26],[9,4,26],[3,5,45],[3,4,16],[5,6,16]],"queries":[[1,11,25],[0,3,20],[5,11,49],[5,9,57],[2,4,24],[6,5,36]]}' },
]

export const complexity = 'O((E + Q) log(E + Q) + (E + Q) * alpha(n)) time for E edges and Q queries, with union-find.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.n) || !Array.isArray(input.edgeList) || !Array.isArray(input.queries)) throw new Error('Use an object with n, edgeList and queries.')
  const { n, edgeList, queries } = input
  if (n < 2 || n > 12) throw new Error('n is from 2 to 12 (visual cap).')
  if (edgeList.length < 1 || edgeList.length > 20) throw new Error('edgeList has 1 to 20 edges (visual cap).')
  for (const [u, v, d] of edgeList) {
    if (![u, v, d].every(Number.isInteger) || u < 0 || v < 0 || u >= n || v >= n || u === v || d < 1) throw new Error('Each edge is [u, v, distance] with valid nodes and distance at least 1.')
  }
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 3 || ![q[0], q[1], q[2]].every(Number.isInteger) || q[0] >= n || q[1] >= n || q[0] < 0 || q[1] < 0) throw new Error('Each query is [p, q, limit] with valid nodes.')
  }
  return { n, edgeList, queries }
}

export function buildTrace({ n, edgeList, queries }) {
  const frames = []
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const edges = [...edgeList].sort((a, b) => a[2] - b[2])
  const order = queries.map((_, j) => j).sort((a, b) => queries[a][2] - queries[b][2])
  const answer = new Array(queries.length).fill(false)
  const roots = () => parent.map((_, i) => find(i))
  const snap = extra => ({ roots: roots(), ...extra })
  frames.push({ phase: 'start', activeLine: 1, message: 'Each node starts alone.', snapshot: snap({}) })
  let e = 0
  for (const j of order) {
    const [p, q, limit] = queries[j]
    while (e < edges.length && edges[e][2] < limit) {
      const [u, v, d] = edges[e]
      parent[find(u)] = find(v)
      e++
      frames.push({ phase: 'join', activeLine: 9, query: j, message: `Edge ${u}-${v} (distance ${d}) joins the components.`, snapshot: snap({ edge: [u, v] }) })
    }
    answer[j] = find(p) === find(q)
    frames.push({ phase: 'answer', activeLine: 11, query: j, message: `Query ${j + 1} (${p}, ${q}, limit ${limit}): ${answer[j] ? 'connected' : 'not connected'}.`, snapshot: snap({ answerFor: j, verdict: answer[j] }) })
  }
  frames.push({ phase: 'done', activeLine: 13, result: answer, message: `Answers: ${answer.map(String).join(', ')}.`, snapshot: snap({ result: answer }) })
  return { input: { n, edgeList, queries }, result: answer, frames }
}
