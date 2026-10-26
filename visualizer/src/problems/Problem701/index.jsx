import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin at the root.' },
    { id: 'step', label: 'Descend', description: 'Go left or right by comparison.' },
    { id: 'attach', label: 'Attach leaf', description: 'Place the new value in the empty slot.' },
    { id: 'done', label: 'Complete', description: 'Return the new tree.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'BST and value (JSON object with root and val)',
  url: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/',
  complexity: 'O(h) time and O(1) extra space for a tree of height h.',
  examples: [
    { label: 'Insert 5', input: '{"root":[4,2,7,1,3],"val":5}' },
    { label: 'Insert into empty', input: '{"root":[40,20,60,10,30,50,70],"val":25}' },
  ],
}

export default function InsertBST() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.current !== null && step.current !== undefined) roles[step.current] = step.phase === 'attach' ? 'match' : 'active'
    return <>
      <BinaryTreeLane title={step.phase === 'done' ? 'Tree after insertion' : 'Tree'} root={run.root} roles={roles} />
      <output aria-label="Level order">{step.result ? `[${step.result.map(v => (v === null ? 'null' : v)).join(', ')}]` : `Inserting ${run.input.val}`}</output>
    </>
  }} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Invariant:</strong> inserting along the comparison path keeps every value in the correct subtree, so the tree stays a BST.</p>
    <p>Inserting {run.input.val}.</p>
  </>} />
}
