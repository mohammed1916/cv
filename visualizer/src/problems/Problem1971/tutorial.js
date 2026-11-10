// Authored teaching for BFS path existence. Each scene names the real vertex IDs and edges that cause the operation.
const reasons = {
  init: ['Start the search at the source', 'A search needs a first vertex. Mark the source visited before anything else so no edge can queue it again, then place it at the front of the queue to be expanded first.'],
  dequeue: ['Expand the oldest discovered vertex', 'The queue keeps vertices in discovery order, so its front is the closest unexpanded vertex. Its incident edges are the only ways the search can move on from here.'],
  found: ['The destination is dequeued', 'A vertex enters the queue only through a chain of discovered edges from the source. Reaching the destination means that chain connects the two vertices.'],
  enqueue: ['Discover a neighbour for the first time', 'An unvisited neighbour is reached for the first time through this vertex. Mark it before enqueueing so it cannot be added again later.'],
  skip: ['Ignore a neighbour that is already known', 'A visited neighbour was reached earlier, so the search already covers it. Queuing it again would not change which vertices are reachable.'],
  'not-found': ['The queue is empty without the destination', 'Every vertex reachable from the source has been dequeued, and the destination was never among them. No path exists.'],
};

// Real incident edges of u, as stored in the input. Vertex IDs are never renumbered.
export function incidentEdges(edges, u) {
  const seen = new Set(), out = []
  for (const [a, b] of edges) {
    if (a !== u && b !== u) continue
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`
    if (!seen.has(key)) { seen.add(key); out.push([a, b]) }
  }
  return out
}

export function bfsTutorial({ run, step }) {
  const [title, reason] = reasons[step.kind] ?? reasons.dequeue
  const { edges, destination, source } = run.input
  const u = step.current, v = step.neighbour
  const incident = u === null || u === undefined ? [] : incidentEdges(edges, u)
  const neighbours = [...new Set(incident.map(([a, b]) => (a === u ? b : a)))]
  const focus = {
    kind: step.kind,
    current: u ?? null,
    neighbour: v ?? null,
    destination,
    // Causal vertices: the operation's vertex and, for expansion, its direct neighbours only.
    nodes: step.kind === 'init' ? [source] : step.kind === 'dequeue' ? [u, ...neighbours]
      : step.kind === 'enqueue' || step.kind === 'skip' ? [u, v]
      : step.kind === 'found' ? [u] : [],
    edges: step.kind === 'dequeue' ? incident
      : step.kind === 'enqueue' || step.kind === 'skip' ? [edges.find(([a, b]) => (a === u && b === v) || (a === v && b === u)) ?? [u, v]]
      : [],
  }
  const variables = {
    init: { queue: source, destination },
    dequeue: { u, destination },
    found: { u, destination },
    enqueue: { u, v, status: 'new, marked visited' },
    skip: { u, v, status: 'already visited' },
    'not-found': { destination, reached: step.visited.length },
  }[step.kind] ?? {}
  return { title, reason, action: step.message, variables, focus }
}
