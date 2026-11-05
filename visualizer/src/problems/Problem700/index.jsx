import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin at the root.' },
    { id: 'visit', label: 'Compare and move', description: 'Equal means found; smaller goes left; larger goes right.' },
    { id: 'done', label: 'Result', description: 'Return the subtree at the match, or null.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'BST and value (JSON object with root and val)',
  url: 'https://leetcode.com/problems/search-in-a-binary-search-tree/',
  complexity: 'O(h) time for height h, and O(1) extra space for the iterative walk.',
  examples: [
    { label: 'Found', input: '{"root":[8,3,10,1,6,null,14],"val":6}' },
    { label: 'Left side', input: '{"root":[8,3,10,1,6,null,14],"val":1}' },
    { label: 'Missing', input: '{"root":[8,3,10,1,6,null,14],"val":7}' },
  ],
}

export default function SearchBst() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null && step.node !== undefined) roles[step.node] = step.found !== null ? 'found' : 'current'
    return <>
      <BinaryTreeLane title="Binary search tree" root={run.tree} roles={roles}
        note={step.phase === 'done' ? (step.result ? `subtree ${step.result.join(', ')}` : 'not present') : `looking for ${step.val}`} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why one path:</strong> each comparison discards one whole side of the tree, so only one root-to-leaf path needs checking.</p>
  </>} />
}
