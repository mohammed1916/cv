export const SNIPPETS_REGISTRY = {
  'minimum-window-substring': [
    { id: 'init', label: 'Init', lines: [4, 5, 6, 7, 8, 9] },
    { id: 'loop', label: 'Expand', lines: [10, 11, 12, 13, 14] },
    { id: 'update', label: 'Shrink/Update', lines: [15, 16, 17, 18, 19] },
    { id: 'return', label: 'Return', lines: [20] },
  ],
  'max-depth-binary-tree': [
    { id: 'init', label: 'Init', lines: [3] },
    { id: 'loop', label: 'DFS Calls', lines: [4, 5] },
    { id: 'update', label: 'Depth Update', lines: [6] },
    { id: 'return', label: 'Return', lines: [6] },
  ],
  'course-schedule': [
    { id: 'init', label: 'Init Graph', lines: [3, 4, 6, 7, 8, 10, 11] },
    { id: 'queue', label: 'Queue Loop', lines: [13, 14, 15] },
    { id: 'neighbors', label: 'Neighbor Updates', lines: [16, 17, 18, 19] },
    { id: 'result', label: 'Result Check', lines: [21] },
  ],
  'house-robber': [
    { id: 'init', label: 'Initialize', lines: [3, 4, 5] },
    { id: 'iterate', label: 'Evaluate House', lines: [6, 7, 8, 9] },
    { id: 'shift', label: 'Shift State', lines: [10, 11] },
    { id: 'return', label: 'Return', lines: [12] },
  ],
}

export function getSnippets(problemSlug) {
  return SNIPPETS_REGISTRY[problemSlug] || []
}

/**
 * Maps phase names to snippet IDs for each problem.
 * Used by visualizers to associate execution phases with code snippets.
 */
export const PHASE_TO_SNIPPET_MAP = {
  'minimum-window-substring': (phase) => {
    if (phase === 'init') return 'init'
    if (phase === 'expand') return 'loop'
    if (phase === 'best' || phase === 'shrink') return 'update'
    if (phase === 'done') return 'return'
    return 'loop'
  },
  'max-depth-binary-tree': (phase) => {
    if (phase === 'done') return 'return'
    if (phase === 'call' || phase === 'right') return 'loop'
    if (phase === 'return') return 'update'
    return 'init'
  },
  'course-schedule': (phase) => {
    if (!phase) return 'init'
    if (phase.startsWith('build') || phase.startsWith('init')) return 'init'
    if (phase === 'while_check' || phase === 'pop_node' || phase === 'inc_visited' || phase === 'no_neighbors') return 'queue'
    if (phase === 'visit_neighbor' || phase === 'dec_indegree' || phase === 'check_neighbor_indegree' || phase === 'enqueue_neighbor') return 'neighbors'
    if (phase === 'done') return 'result'
    return 'queue'
  },
  'house-robber': (phase) => {
    if (phase === 'init') return 'init'
    if (phase === 'calc') return 'iterate'
    if (phase === 'advance') return 'shift'
    if (phase === 'done') return 'return'
    return 'iterate'
  },
}

export function getSnippetIdForPhase(problemSlug, phase) {
  const mapper = PHASE_TO_SNIPPET_MAP[problemSlug]
  return mapper ? mapper(phase) : 'init'
}
