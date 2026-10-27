import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read each tree in order.' },
    { id: 'walk', label: 'In-order walk', description: 'Visit left, then node, then right, appending each value.' },
    { id: 'merge', label: 'Merge', description: 'Take the smaller front value from the two sorted lists.' },
    { id: 'done', label: 'Complete', description: 'Report the merged sorted list.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with root1 and root2 (level-order arrays)',
  url: 'https://leetcode.com/problems/all-elements-in-two-binary-search-trees/',
  complexity: 'O(n + m) time and O(n + m) space. The visualization caps each tree at 10 nodes.',
  examples: [
    { label: 'Example 1', input: '{"root1":[2,1,4],"root2":[1,0,3]}' },
    { label: 'Example 2', input: '{"root1":[1,null,8],"root2":[8,1]}' },
  ],
}

export default function AllElementsTwoTrees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = which => (step.phase === 'walk' && step.which === which && step.node !== null ? { [step.node]: 'active' } : {})
    return <>
      <BinaryTreeLane title="Tree 1" root={run.root1} roles={roles(1)} />
      <BinaryTreeLane title="Tree 2" root={run.root2} roles={roles(2)} />
      <IndexedSequence label="Merged" length={step.merged.length} valueAt={i => step.merged[i]} active={step.merged.length - 1} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each in-order walk is sorted, so merging two sorted lists with one pointer each produces the answer.</p>
  </>} />
}
