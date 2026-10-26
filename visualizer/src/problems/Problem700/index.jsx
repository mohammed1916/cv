import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin at the root.' },
    { id: 'step', label: 'Compare and descend', description: 'Go left or right by comparison.' },
    { id: 'found', label: 'Found', description: 'The node matches the value.' },
    { id: 'missing', label: 'Missing', description: 'The path ends without a match.' },
    { id: 'done', label: 'Complete', description: 'Return the subtree or null.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'BST and value (JSON object with root and val)',
  url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/',
  complexity: 'O(h) time and O(1) extra space for a tree of height h.',
  examples: [
    { label: 'Subtree', input: '{"root":[4,2,7,1,3],"val":2}' },
    { label: 'Missing', input: '{"root":[4,2,7,1,3],"val":5}' },
  ],
}

export default function SearchBST() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.path.forEach(id => { roles[id] = 'visited' })
    if (step.current !== null && step.current !== undefined) roles[step.current] = step.phase === 'found' ? 'match' : 'active'
    return <>
      <BinaryTreeLane title="BST" root={run.root} roles={roles} />
      <output aria-label="Search result">{step.phase === 'done' ? (step.result ? `Subtree: [${step.result.map(v => (v === null ? 'null' : v)).join(', ')}]` : 'null') : `Searching ${run.input.val}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Ordering:</strong> every value in the left subtree is smaller than the node and every value in the right subtree is larger, so one comparison per level is enough.</p>
  </>} />
}
