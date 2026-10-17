// Learning catalog, version 1. Dependencies are pedagogical, not access gates.
// Keep explicit visual capabilities separate from tag-based topic membership.
export const LEARNING_TOPICS = [
  { id: 'arrays', title: 'Arrays & iteration', column: 0, row: 0, tags: ['Array'], requires: [], summary: 'Read indexed values and follow a loop one step at a time.', goal: 'Trace an index, a value, and the state changed by each iteration.', picks: ['B2', '1'] },
  { id: 'stack', title: 'Stack', column: 0, row: 1, tags: ['Stack'], requires: [], summary: 'The last item added is the first item removed.', goal: 'Predict push, pop, and the item on top.', picks: ['20', '155'] },
  { id: 'queue', title: 'Queue', column: 0, row: 2, tags: ['Queue'], requires: [], summary: 'Process waiting items in first-in, first-out order.', goal: 'Distinguish the next item to process from newly enqueued items.', picks: ['232', 'B10'] },
  { id: 'graphs', title: 'Graphs & neighbors', column: 0, row: 3, tags: ['Graph'], requires: [], summary: 'Represent connections with vertices and edges.', goal: 'List neighbors and explain why a visited set prevents repeated work.', picks: ['1971', '133'] },
  { id: 'recursion', title: 'Recursion', column: 1, row: 1, tags: ['Recursion'], requires: ['stack'], summary: 'Pause a call, solve a smaller case, and return to the caller.', goal: 'Identify the base case and distinguish descending from returning.', picks: ['104', '301'], related: ['bfs'] },
  { id: 'bfs', title: 'Breadth-first search', column: 1, row: 2, tags: ['Breadth-First Search'], requires: ['queue', 'graphs'], summary: 'Use a queue to explore a graph one layer at a time.', goal: 'Explain why BFS finds shortest paths in an unweighted graph.', picks: ['B10', '102', '1036'], related: ['recursion'], note: 'Recursion is helpful context for comparing traversals, but iterative BFS does not require it.' },
  { id: 'prefix', title: 'Prefix sums', column: 1, row: 0, tags: ['Prefix Sum'], requires: ['arrays'], summary: 'Remember cumulative work to answer range questions.', goal: 'Recover a range sum by subtracting two prefix values.', picks: ['B9', '303'] },
  { id: 'dfs', title: 'Depth-first search', column: 2, row: 2, tags: ['Depth-First Search'], requires: ['graphs', 'recursion'], summary: 'Explore one branch deeply before returning to another.', goal: 'Follow the recursive traversal and its visited state.', picks: ['104', '200'], note: 'This path teaches recursive DFS. Iterative DFS can use an explicit stack instead.' },
  { id: 'backtracking', title: 'Backtracking', column: 2, row: 1, tags: ['Backtracking'], requires: ['recursion'], summary: 'Choose, explore, undo, and try the next possibility.', goal: 'Track a partial solution and restore it correctly after each branch.', picks: ['78', '22', '51'] },
  { id: 'dp', title: 'Dynamic programming', column: 2, row: 0, tags: ['Dynamic Programming'], requires: ['arrays', 'recursion'], summary: 'Reuse answers to overlapping subproblems.', goal: 'Define a state, a recurrence, and an order for evaluating states.', picks: ['70', '198', '1143'], note: 'Recursion explains the recurrence; bottom-up DP can be implemented with loops.' },
  { id: 'constraints', title: 'Constraint pruning', column: 3, row: 1, tags: [], requires: ['backtracking'], summary: 'Reject a choice as soon as a constraint makes it impossible.', goal: 'Explain which queen attacks a candidate square before placing it.', picks: ['51', '37'], note: 'N-Queens is a backtracking example, not a dynamic programming example.' },
  { id: 'dp-table', title: '2D DP & transitions', column: 3, row: 0, tags: [], requires: ['dp'], summary: 'Read the earlier states that contribute to a table cell.', goal: 'Explain a cell using its dependencies, not just its final value.', picks: ['1143', '72'] },
];

export const VISUALIZER_CAPABILITIES = [
  { id: 'queue-layers', title: 'Queue & traversal layers', description: 'Watch the frontier and the level currently being processed.', topics: ['queue', 'bfs', 'graphs'], problems: ['B10', '102'], source: 'src/components/shared/TraversalTreePanel.jsx' },
  { id: 'call-tree', title: 'Recursive call tree', description: 'Follow nested calls and the branches explored by recursive search.', topics: ['recursion', 'backtracking'], problems: ['301', '1096'], source: 'src/components/shared/RecursiveCallTree.jsx' },
  { id: 'staircase', title: 'Staircase recurrence', description: 'Connect each stair to the earlier counts that reach it.', topics: ['dp', 'arrays'], problems: ['70'], source: 'src/components/shared/StaircaseScene.jsx' },
  { id: 'dp-grid', title: 'DP table & active cell', description: 'Follow the LCS table as matching and skipping characters fill each cell.', topics: ['dp', 'dp-table'], problems: ['1143'], source: 'src/problems/Problem1143/LCSVisualizer.jsx' },
  { id: 'queen-rays', title: 'Queen attack rays', description: 'See row, column, and diagonal conflicts for the next candidate position.', topics: ['backtracking', 'constraints'], problems: ['51'], source: 'src/components/shared/GridRayOverlay.jsx' },
];

export const TOPIC_BY_ID = Object.fromEntries(LEARNING_TOPICS.map(topic => [topic.id, topic]));

export function prerequisitePath(id) {
  const result = new Set();
  function visit(key) {
    for (const parent of TOPIC_BY_ID[key]?.requires || []) {
      if (result.has(parent)) continue;
      visit(parent);
      result.add(parent);
    }
  }
  visit(id);
  return [...result];
}

// Inverted indexes are built from lightweight route metadata, never visualizer imports.
export function buildLearningIndex(problems) {
  const available = problems.filter(problem => problem.implemented);
  const byNumber = new Map(available.map(problem => [String(problem.number), problem]));
  const byTopic = Object.fromEntries(LEARNING_TOPICS.map(topic => {
    const recommended = topic.picks.map(number => byNumber.get(number)).filter(Boolean);
    const recommendedNumbers = new Set(recommended.map(problem => String(problem.number)));
    const capabilities = VISUALIZER_CAPABILITIES.filter(item => item.topics.includes(topic.id) && item.problems.some(number => byNumber.has(number)));
    const featuredNumbers = new Set(capabilities.flatMap(item => item.problems));
    const tagged = available.filter(problem => !recommendedNumbers.has(String(problem.number)) && (featuredNumbers.has(String(problem.number)) || problem.tags?.some(tag => topic.tags.includes(tag))))
      .sort((a, b) => String(a.number).localeCompare(String(b.number), undefined, { numeric: true }));
    return [topic.id, { recommended, problems: [...recommended, ...tagged], capabilities }];
  }));
  const byProblem = Object.fromEntries(available.map(problem => [problem.number, {
    topics: LEARNING_TOPICS.filter(topic => byTopic[topic.id].problems.includes(problem)).map(topic => topic.id),
    capabilities: VISUALIZER_CAPABILITIES.filter(item => item.problems.includes(String(problem.number))).map(item => item.id),
  }]));
  return { byTopic, byProblem, byNumber };
}
