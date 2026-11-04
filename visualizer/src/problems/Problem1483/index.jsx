import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecurrenceGrid from '../../components/shared/RecurrenceGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the direct parent table.' },
    { id: 'lift', label: 'Lift', description: 'Each jump table doubles the previous one.' },
    { id: 'query', label: 'Query', description: 'Start a query at its node.' },
    { id: 'jump', label: 'Jump', description: 'Apply the jump for one set bit of k.' },
    { id: 'answer', label: 'Answer', description: 'The query has reached its ancestor.' },
    { id: 'done', label: 'Complete', description: 'Report all answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with parent array and queries [node, k] (JSON)',
  url: 'https://leetcode.com/problems/kth-ancestor-of-a-tree-node/',
  complexity: 'O(n log n) preprocessing and O(log k) per query. The visualization caps input at 12 nodes.',
  examples: [
    { label: 'Example', input: '{"parent":[-1,0,0,1,1,2,2],"queries":[[3,1],[5,2],[6,3]]}' },
  ],
}

export default function KthAncestor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecurrenceGrid label="Jump tables: up[j][node] is the node 2^j steps above" rowLabels={run.tables.map((_, j) => `2^${j}`)}
      columnLabels={run.input.parent.map((_, v) => `node ${v}`)} row={Math.max(0, step.jump)} column={Math.max(0, step.node)}
      valueAt={(r, c) => (run.tables[r][c] === -1 ? '—' : run.tables[r][c])}
      roleAt={(r, c) => (r === step.jump && c === step.node ? 'current' : r === step.jump ? 'window' : '')} />
    <output aria-label="Jump">{step.jump >= 0 ? `Jump table ${1 << step.jump} step(s)` : 'Parents only'}</output>
  </>} renderReasoning={() => <>
    <p>A jump of 2^j steps composed from two jumps of 2^(j-1) steps, so every table is cheap to build from the one before.</p>
    <p>Any k is a sum of distinct powers of two, so each query applies at most log k jumps.</p>
  </>} />
}
