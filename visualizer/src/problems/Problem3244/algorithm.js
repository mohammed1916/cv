const PY = [
  "def shortestDistanceAfterQueries(n, queries):",
  "    dist = list(range(n))",
  "    incoming = [[] for _ in range(n)]",
  "    answer = []",
  "    for u, v in queries:",
  "        incoming[v].append(u)",
  "        for x in range(v, n):",
  "            best = dist[x - 1] + 1",
  "            for p in incoming[x]:",
  "                best = min(best, dist[p] + 1)",
  "            dist[x] = best",
  "        answer.append(dist[n - 1])",
  "    return answer",
]

export const python = PY.join("\n")
const at = text => PY.findIndex(line => line.includes(text)) + 1

export const code = `function shortestDistanceAfterQueries(n, queries) {
  const dist = Array.from({ length: n }, (_, i) => i)
  const incoming = Array.from({ length: n }, () => [])
  const answer = []
  for (const [u, v] of queries) {
    incoming[v].push(u)
    for (let x = v; x < n; x++) {
      let best = dist[x - 1] + 1
      for (const p of incoming[x]) best = Math.min(best, dist[p] + 1)
      dist[x] = best
    }
    answer.push(dist[n - 1])
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const MAX_NODES = 12
const MAX_QUERIES = 12

function readJson(text) {
  if (typeof text !== "string") return text
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`Input must be JSON such as {"n": 4, "queries": [[0,3],[0,2]]}: ${error.message}`)
  }
}

export function parseInput(text) {
  const data = readJson(text)
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be an object with keys "n" and "queries".')
  const { n, queries } = data
  if (!Number.isInteger(n) || n < 3) throw new Error('Key "n" must be an integer of at least 3.')
  if (n > MAX_NODES) throw new Error(`The visualization accepts at most ${MAX_NODES} nodes.`)
  if (!Array.isArray(queries) || queries.length < 1) throw new Error('Key "queries" must be a non-empty array of [u, v] pairs.')
  if (queries.length > MAX_QUERIES) throw new Error(`The visualization accepts at most ${MAX_QUERIES} queries.`)
  queries.forEach((query, index) => {
    if (!Array.isArray(query) || query.length !== 2) throw new Error(`Query ${index} must be a pair [u, v].`)
    const [u, v] = query
    if (![u, v].every(value => Number.isInteger(value) && value >= 0 && value < n)) throw new Error(`Query ${index} must use nodes from 0 to ${n - 1}.`)
    if (!(u < v)) throw new Error(`Query ${index} must satisfy u < v so every road points forward.`)
  })
  return { n, queries }
}

export function buildTrace(input) {
  const { n, queries } = input
  const frames = []
  const dist = Array.from({ length: n }, (_, index) => index)
  const incoming = Array.from({ length: n }, () => [])
  const added = []
  const answer = []
  const add = (phase, activeLine, pythonText, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: at(pythonText), message, n, edges: [...added], dist: [...dist],
    answer: [...answer], ...extra,
  })
  add("setup", 2, "dist = list(range(n))", "Start with the base chain 0 to 1 to ... to n-1, so dist[i] = i.", { x: -1, from: -1 })
  queries.forEach(([u, v], queryIndex) => {
    add("query", 5, "for u, v in queries", `Query ${queryIndex + 1}: add road ${u} to ${v}.`, { x: -1, from: -1 })
    incoming[v].push(u)
    added.push([u, v])
    add("edge", 6, "incoming[v].append(u)", `Node ${v} now has an incoming road from ${u}.`, { x: v, from: u })
    for (let x = v; x < n; x += 1) {
      let best = dist[x - 1] + 1
      add("chain", 8, "best = dist[x - 1] + 1", `Node ${x}: the chain from ${x - 1} gives ${best}.`, { x, from: x - 1 })
      incoming[x].forEach(p => { best = Math.min(best, dist[p] + 1) })
      dist[x] = best
      add("store", 10, "dist[x] = best", `Node ${x} gets distance ${best}.`, { x, from: -1 })
    }
    answer.push(dist[n - 1])
    add("record", 12, "answer.append(dist[n - 1])", `After query ${queryIndex + 1} the shortest distance is ${dist[n - 1]}.`, { x: n - 1, from: -1 })
  })
  add("done", 14, "return answer", `Return [${answer.join(", ")}].`, { x: -1, from: -1 })
  return { input: { n, queries }, result: answer, frames }
}
