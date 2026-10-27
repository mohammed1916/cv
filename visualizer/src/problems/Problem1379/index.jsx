import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the search at the root with an empty path.' },
    { id: 'visit', label: 'Visit node', description: 'Check this node against the target, then try the left side before the right.' },
    { id: 'found', label: 'Found', description: 'The target is reached; its path is the same in the clone.' },
    { id: 'done', label: 'Clone node', description: 'Report the corresponding node in the cloned tree.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root (level-order array of distinct values 1 to 20) and target (a value in the tree) (JSON)',
  url: 'https://leetcode.com/problems/find-a-corresponding-node-of-a-binary-tree-in-a-clone-of-that-tree/',
  complexity: 'O(n) time and O(h) stack space. The visualization caps the tree at 15 entries.',
  examples: [
    { label: 'Example 1', input: '{"root":[7,4,3,null,null,6,19],"target":3}' },
    { label: 'Example 2', input: '{"root":[7],"target":7}' },
  ],
}

export default function FindCorrespondingNode() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.active !== null) roles[step.active] = step.phase === 'found' || step.phase === 'done' ? 'match' : 'active'
    return <>
      <BinaryTreeLane title="Original tree (the clone has the same shape)" root={run.display} roles={roles} />
      <output aria-label="Path so far">{`Path: ${step.path === '' ? 'root' : step.path}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The clone is identical in shape, so a node is located in the clone by the same sequence of left and right turns from the root.</p>
    <p>Searching the original yields that sequence, and the matching node in the clone is the answer.</p>
  </>} />
}
