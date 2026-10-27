// Pure model for weighted-graph stories (shortest paths and minimum spanning trees).
// A solver builds `ops` while it works; `describeWeightedOps` turns them into plain sentences and
// `wgraphState` packages everything WeightedGraphView needs. No React and no DOM in here.

/** Largest graph the view draws; bigger inputs keep only their table. */
export const WGRAPH_VIEW_LIMIT = 14

export const showDistance = d => (d === Infinity || d === undefined || d === null ? '∞' : String(d))

/** Evenly spaced node positions on a circle inside a width x height box. */
export function layoutCircle(count, width = 320, height = 240, pad = 28) {
  if (count === 1) return [{ x: width / 2, y: height / 2 }]
  const rx = width / 2 - pad, ry = height / 2 - pad
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / count
    return { x: width / 2 + rx * Math.cos(angle), y: height / 2 + ry * Math.sin(angle) }
  })
}

/** Plain-language sentence for each operation recorded since the previous step. */
export function describeWeightedOps(ops = [], label = String) {
  return ops.map(op => {
    switch (op.type) {
      case 'pop':
        return `Pop ${label(op.node)} with distance ${showDistance(op.dist)} from the priority queue: it is the smallest value waiting, so ${label(op.node)} is now final.`
      case 'stale':
        return `Pop ${label(op.node)} with ${showDistance(op.dist)}, but a shorter distance ${showDistance(op.best)} is already known, so this queue entry is stale and is skipped.`
      case 'relax': {
        const sum = `${showDistance(op.base)} + ${op.w} = ${showDistance(op.candidate)}`
        const edge = `edge ${label(op.u)} → ${label(op.v)} (weight ${op.w})`
        if (op.result === 'improved') return `Relax ${edge}: ${sum} beats the old distance of ${label(op.v)} (${showDistance(op.old)}), so dist[${label(op.v)}] goes ${showDistance(op.old)} → ${showDistance(op.candidate)}.`
        if (op.result === 'equal') return `Relax ${edge}: ${sum} equals the current distance of ${label(op.v)} (${showDistance(op.old)}), so the distance stays and another shortest route is counted.`
        return `Relax ${edge}: ${sum} is not better than the current distance of ${label(op.v)} (${showDistance(op.old)}), so nothing changes.`
      }
      case 'push':
        return `Push (${showDistance(op.dist)}, ${label(op.node)}) onto the priority queue.`
      case 'edge': {
        const edge = `${label(op.u)}-${label(op.v)} (weight ${op.w})`
        return op.decision === 'chosen'
          ? `Edge ${edge}: ${op.reason} Chosen for the tree.`
          : `Edge ${edge}: ${op.reason} Rejected.`
      }
      case 'attach':
        return `Attach ${label(op.node)} to the tree through the cheapest connection (cost ${op.cost}${op.via === undefined || op.via === null ? '' : `, from ${label(op.via)}`}).`
      case 'improve':
        return `Via ${label(op.via)}: connecting ${label(op.node)} now costs ${op.cost} (was ${showDistance(op.old)}).`
      default:
        return op.text ?? ''
    }
  }).filter(Boolean)
}

/** Edge tone from per-edge state: 'chosen' | 'rejected' | 'active' | 'tight' | '' (untouched). */
export const edgeTone = (states, index) => states?.[index] ?? ''

/** Rows of the distance table: the value, whether it changed this step, and the node's status. */
export function distanceRows(dist, before, settled, active) {
  return dist.map((value, node) => ({
    node,
    value,
    previous: before ? before[node] : value,
    changed: before ? before[node] !== value : false,
    status: settled?.[node] ? 'final' : value === Infinity ? 'unreached' : 'tentative',
    active: node === active,
  }))
}

/**
 * Package state for the view. `edges` are [u, v, w] with 0-based endpoints; `labels` name the nodes.
 * Returns {} when the graph is too large to draw. All arrays are copied so later mutation is harmless.
 */
export function wgraphState({ labels, edges, directed = false, dist, before, settled, active = -1, pq, pqLabel, edgeStates, ops = [], chosen, rejected, total, title }) {
  if (labels.length > WGRAPH_VIEW_LIMIT) return {}
  return {
    wgraph: {
      labels: labels.map(String),
      edges: edges.map(([u, v, w]) => [u, v, w]),
      directed,
      dist: dist ? [...dist] : null,
      before: before ? [...before] : null,
      settled: settled ? [...settled] : null,
      active,
      pq: pq ? pq.map(String) : null,
      pqLabel,
      edgeStates: edgeStates ? { ...edgeStates } : {},
      ops: ops.map(op => ({ ...op })),
      chosen: chosen ? chosen.map(String) : null,
      rejected: rejected ? rejected.map(String) : null,
      total,
      title,
    },
  }
}
