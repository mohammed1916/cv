import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin at the root with an empty path.' },
    { id: 'visit', label: 'Extend path', description: 'Add this node’s letter to the path.' },
    { id: 'leaf', label: 'Leaf', description: 'Read the path from the leaf up and compare.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree of letter values 0-25 (JSON level order)',
  url: 'https://leetcode.com/problems/smallest-string-starting-from-leaf/',
  complexity: 'O(n * h) time for string building. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Own case 1', input: '[1,2,3,4,5,4,5]' },
    { label: 'Prefix', input: '[1,0,null,1]' },
    { label: 'Single node', input: '[0]' },
    { label: 'Equal letters', input: '[2,2,2,2,2,2,2]' },
    { label: 'Largest letter at the limit', input: '[25,0,25,0,25,25,0,0,0,25,25,0,25,0,0]' },
    { label: 'Long run: 15 nodes', input: '[7,3,7,2,25,24,5,5,16,0,4,6,25,0,18]' },
  ],
}

export default function SmallestFromLeaf() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree (letters)" root={run.root} roles={roles} />
      <output aria-label="Path">{`Path so far: ${step.path || '(empty)'}${step.best ? `, best: ${step.best}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A string is read from a leaf up to the root, so the path is built from the root down and reversed at each leaf.</p>
    <p>Lexicographic order compares letters left to right, so a path that is a prefix of another sorts first.</p>
  </>} />
}
