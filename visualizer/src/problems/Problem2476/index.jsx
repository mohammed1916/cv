import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sorted values', description: 'An in-order walk lists the tree values in increasing order.' },
    { id: 'query', label: 'Query', description: 'Find the nearest value below and above the query.' },
    { id: 'done', label: 'Complete', description: 'Every query has its pair.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root (level order) and queries (JSON)',
  url: 'https://leetcode.com/problems/closest-nodes-queries-in-a-binary-search-tree/',
  complexity: 'O(n) time to read the tree and O(log n) per query with binary search. The visualization caps the tree at 31 entries.',
  examples: [
    { label: 'Own case 1', input: '{"root":[7,3,14,2,5,10,16,null,null,null,null,null,null,15],"queries":[3,6,17]}' },
    { label: 'Small', input: '{"root":[4,2,6,1,3],"queries":[0,3,7]}' },
    { label: 'Single node', input: '{"root":[5],"queries":[0,9]}' },
    { label: 'Query on a node', input: '{"root":[4,2,6,1,3],"queries":[3,4,6]}' },
    { label: 'Smallest and largest values', input: '{"root":[25,0,50],"queries":[0,50]}' },
    { label: 'Long run: 31 nodes', input: '{"root":[30,13,41,8,24,35,47,5,10,17,27,32,38,45,49,4,6,9,12,15,23,26,29,31,34,36,40,42,46,48,50],"queries":[23,12,19,18,16,44,36,37]}' },
  ],
}

export default function ClosestNodesQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <BinaryTreeLane title="Binary search tree" root={run.root} roles={step.roles} />
    <IndexedSequence label="In-order values" length={step.values.length} valueAt={i => step.values[i]}
      active={step.lowIndex >= 0 ? step.lowIndex : step.highIndex} roleAt={i => (i === step.highIndex ? 'high' : '')} />
    <output aria-label="Answer">{`Answer so far: ${step.answer.map(([lo, hi]) => `[${lo}, ${hi}]`).join(', ') || 'none yet'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Sorted values make both nearest neighbours of a query adjacent to its position, so the answer is the value just below and just above it.</p>
  </>} />
}
