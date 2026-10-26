import { LEARNING_CONCEPTS, CONCEPT_BY_ID } from './learningTaxonomy.js';

// Capabilities are attached only to verified example routes, not inferred from tags.
export const VISUALIZER_CAPABILITIES = [
  { id: 'queue-layers', title: 'Queue & traversal layers', description: 'Watch the frontier and the level currently being processed.', problems: ['B10', '102'], source: 'src/components/shared/TraversalTreePanel.jsx' },
  { id: 'call-tree', title: 'Recursive call tree', description: 'Follow nested calls and recursive search branches.', problems: ['301', '1096'], source: 'src/components/shared/RecursiveCallTree.jsx' },
  { id: 'staircase', title: 'Staircase recurrence', description: 'Connect each stair to earlier counts that reach it.', problems: ['70'], source: 'src/components/shared/StaircaseScene.jsx' },
  { id: 'dp-grid', title: 'DP table & active cell', description: 'Follow the LCS table as matching and skipping characters fill each cell.', problems: ['1143'], source: 'src/problems/Problem1143/LCSVisualizer.jsx' },
  { id: 'queen-rays', title: 'Queen attack rays', description: 'See row, column, and diagonal conflicts for the next candidate.', problems: ['51'], source: 'src/components/shared/GridRayOverlay.jsx' },
];

const TAG_ALIASES = { DP: 'Dynamic Programming', BFS: 'Breadth-First Search', DFS: 'Depth-First Search', 'Union-Find': 'Union Find', 'Heap (Priority Queue)': 'Heap', 'Priority Queue': 'Heap', 'Binary Indexed Tree': 'Fenwick Tree' };
const normalizeTag = tag => TAG_ALIASES[tag] || tag;
const unique = values => [...new Set(values)];

export function prerequisitePath(id) {
  const result = new Set();
  const visiting = new Set();
  function visit(key) {
    if (visiting.has(key)) throw new Error(`Prerequisite cycle at ${key}`);
    visiting.add(key);
    for (const parent of CONCEPT_BY_ID[key]?.requires || []) {
      if (!result.has(parent)) { visit(parent); result.add(parent); }
    }
    visiting.delete(key);
  }
  visit(id);
  return [...result];
}

export function buildLearningIndex(problems) {
  const byNumber = new Map(problems.filter(problem => problem.implemented).map(problem => [String(problem.number), problem]));
  const available = [...byNumber.values()];
  const byConcept = {};
  function build(id) {
    if (byConcept[id]) return byConcept[id];
    const concept = CONCEPT_BY_ID[id];
    const children = LEARNING_CONCEPTS.filter(item => item.parent === id);
    const childEntries = children.map(item => build(item.id));
    const curated = concept.picks.map(number => byNumber.get(number)).filter(Boolean);
    const tags = new Set(concept.tags.map(normalizeTag));
    const direct = unique([...curated, ...available.filter(problem => problem.tags?.some(tag => tags.has(normalizeTag(tag))))]);
    const recommended = curated.length ? curated : unique(childEntries.flatMap(entry => entry.recommended)).slice(0, 6);
    const members = unique([...recommended, ...direct, ...childEntries.flatMap(entry => entry.problems)]);
    const memberNumbers = new Set(members.map(problem => String(problem.number)));
    const childMembers = new Set(childEntries.flatMap(entry => entry.problems));
    const capabilities = VISUALIZER_CAPABILITIES.map(feature => ({ ...feature, problems: feature.problems.filter(number => memberNumbers.has(number)) })).filter(feature => feature.problems.length);
    return byConcept[id] = { children, recommended, direct, problems: members, capabilities, ungrouped: members.filter(problem => !childMembers.has(problem)) };
  }
  LEARNING_CONCEPTS.forEach(concept => build(concept.id));
  const membership = new Map(LEARNING_CONCEPTS.map(concept => [concept.id, new Set(byConcept[concept.id].problems)]));
  const byProblem = Object.fromEntries(available.map(problem => [problem.number, {
    concepts: LEARNING_CONCEPTS.filter(concept => membership.get(concept.id).has(problem)).map(concept => concept.id),
    directConcepts: LEARNING_CONCEPTS.filter(concept => byConcept[concept.id].direct.includes(problem)).map(concept => concept.id),
    capabilities: VISUALIZER_CAPABILITIES.filter(feature => feature.problems.includes(String(problem.number))).map(feature => feature.id),
  }]));
  return { byConcept, byProblem, byNumber };
}
