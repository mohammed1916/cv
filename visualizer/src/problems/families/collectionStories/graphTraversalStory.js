// Helpers that build GraphTraversalView state objects (`graph` field of a story step) for BFS/DFS solvers.

const differsByOne = (a, b) => a.length === b.length && [...a].filter((ch, i) => ch !== b[i]).length === 1

/** Word-ladder graph: one node per word, an edge when two words differ in exactly one letter. */
export function wordLadderGraph(words, { at, queue, head, distance, prevQueue, notes = [] }) {
  const id = new Map(words.map((w, i) => [w, i]))
  const edges = []
  words.forEach((a, i) => words.forEach((b, j) => { if (j > i && differsByOne(a, b)) edges.push([i, j]) }))
  const ids = list => list.map(w => id.get(w))
  return {
    title: 'Word graph: an edge joins words that differ by one letter', n: words.length, edges, labels: words,
    current: at === null ? null : id.get(at), frontier: ids(queue.slice(head + 1)), prevFrontier: ids(prevQueue ?? []),
    visited: ids([...distance.keys()]), done: ids(queue.slice(0, head)),
    tags: Object.fromEntries([...distance].map(([w, d]) => [id.get(w), `ladder ${d}`])), notes,
  }
}
