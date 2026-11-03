import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = [
  'sort the edges by weight',
  'sort the queries by limit, remembering positions',
  'give every node its own component',
  'for each query in limit order',
  '  while the next edge is lighter than the limit',
  '    merge the two endpoints of that edge',
  '  answer is true when p and q share a root',
  'return the answers in original order',
].map((text, index) => ({ line: index + 1, text }))

const python = `def existence_queries(n, edges, queries):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    edges = sorted(edges, key=lambda e: e[2])
    order = sorted(range(len(queries)), key=lambda i: queries[i][2])
    answers = [False] * len(queries)
    k = 0
    for i in order:
        p, q, limit = queries[i]
        while k < len(edges) and edges[k][2] < limit:
            a, b, _ = edges[k]
            parent[find(a)] = find(b)
            k += 1
        answers[i] = find(p) == find(q)
    return answers
`

const PY = { sortEdges: 8, sortQueries: 9, start: 2, query: 12, merge: 16, answer: 18, done: 19 }

export function parse(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.n) || input.n < 2 || input.n > 8) throw new Error('n is an integer from 2 to 8.')
  const nodeOk = v => Number.isInteger(v) && v >= 0 && v < input.n
  if (!Array.isArray(input.edges) || input.edges.length > 10 || !input.edges.every(e => Array.isArray(e) && e.length === 3 && nodeOk(e[0]) && nodeOk(e[1]) && Number.isInteger(e[2]))) throw new Error('edges is at most 10 [a, b, weight] triples.')
  if (!Array.isArray(input.queries) || input.queries.length > 6 || !input.queries.every(q => Array.isArray(q) && q.length === 3 && nodeOk(q[0]) && nodeOk(q[1]) && Number.isInteger(q[2]))) throw new Error('queries is at most 6 [p, q, limit] triples.')
  return input
}

export function build({ n, edges, queries }) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  const sorted = [...edges].map((e, index) => ({ e, index })).sort((a, b) => a.e[2] - b.e[2])
  const order = queries.map((_, i) => i).sort((a, b) => queries[a][2] - queries[b][2])
  const answers = queries.map(() => null)
  const frames = []
  const roots = () => parent.map((_, i) => find(i))
  const push = (phase, line, pythonLine, message, extra = {}) => frames.push({ phase, activeLine: line, pythonLine, message, roots: roots(), answers: [...answers], focus: [], ...extra })
  push('sort', 1, PY.sortEdges, `Edges sorted by weight: ${sorted.map(s => s.e[2]).join(', ') || 'none'}.`)
  push('start', 3, PY.start, 'Each node starts as its own component.')
  let k = 0
  for (const i of order) {
    const [p, q, limit] = queries[i]
    push('query', 4, PY.query, `Query ${i} asks whether ${p} and ${q} connect below limit ${limit}.`, { focus: [p, q], current: i })
    while (k < sorted.length && sorted[k].e[2] < limit) {
      const [a, b, w] = sorted[k].e
      parent[find(a)] = find(b)
      push('merge', 6, PY.merge, `Edge ${a}-${b} (weight ${w}) is below ${limit} and joins their components.`, { focus: [a, b], current: i })
      k += 1
    }
    answers[i] = find(p) === find(q)
    push('answer', 7, PY.answer, `Query ${i} is ${answers[i]}.`, { focus: [p, q], current: i })
  }
  push('done', 8, PY.done, 'All queries answered in their original order.')
  return { input: { n, edges, queries }, result: answers, frames }
}

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order edges by weight.' },
    { id: 'start', label: 'Start', description: 'Every node is alone.' },
    { id: 'query', label: 'Query', description: 'Pick the next query by its limit.' },
    { id: 'merge', label: 'Merge', description: 'Join edges lighter than the limit.' },
    { id: 'answer', label: 'Answer', description: 'Compare the two roots.' },
    { id: 'done', label: 'Result', description: 'Return answers in input order.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with n, edges ([a, b, weight]) and queries ([p, q, limit])',
  url: 'https://leetcode.com/problems/checking-existence-of-edge-length-limited-paths-ii/',
  complexity: 'Visualization sorts once and merges in limit order. The class form answers online with a prebuilt structure; the sample is capped at 8 nodes.',
  examples: [
    { label: 'Example', input: '{"n":4,"edges":[[0,1,2],[1,2,4],[2,3,7]],"queries":[[0,3,5],[0,3,8],[3,1,3]]}' },
    { label: 'Split graph', input: '{"n":3,"edges":[[0,1,1]],"queries":[[0,2,5],[0,1,2]]}' },
  ],
}

export default function CheckingExistenceOfEdgeLengthLimitedPaths() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Component root" length={run.input.n} valueAt={i => step.roots[i]}
      roleAt={i => (step.focus.includes(i) ? 'focus' : '')} />
    <output aria-label="Query answers">{run.input.queries.map((_, i) =>
      `Q${i}: ${step.answers[i] === null ? 'pending' : step.answers[i] ? 'yes' : 'no'}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>Sorting edges and queries by weight and limit lets one union-find structure grow monotonically: each query only needs the edges below its own limit.</p>
    <p>Answering in limit order means the merges never need to be undone.</p>
  </>} />
}
