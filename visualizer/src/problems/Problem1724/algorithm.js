// Offline answer: sort queries by limit, merge edges lighter than each limit, then compare roots.
export function existenceQueries(n, edges, queries) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
  const sortedEdges = [...edges].sort((a, b) => a[2] - b[2])
  const order = queries.map((_, i) => i).sort((a, b) => queries[a][2] - queries[b][2])
  const answers = new Array(queries.length)
  let k = 0
  for (const i of order) {
    const [p, q, limit] = queries[i]
    while (k < sortedEdges.length && sortedEdges[k][2] < limit) {
      const [a, b] = sortedEdges[k]
      parent[find(a)] = find(b)
      k += 1
    }
    answers[i] = find(p) === find(q)
  }
  return answers
}

// Reference check: breadth-first search using only edges lighter than the limit.
export function bruteForceQuery(n, edges, p, q, limit) {
  const seen = new Set([p])
  const queue = [p]
  while (queue.length) {
    const u = queue.shift()
    for (const [a, b, w] of edges) {
      if (w >= limit) continue
      const v = a === u ? b : b === u ? a : -1
      if (v >= 0 && !seen.has(v)) { seen.add(v); queue.push(v) }
    }
  }
  return seen.has(q)
}
