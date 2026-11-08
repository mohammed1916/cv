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
    { label: 'Own case 1', input: '{"root1":[3,2,5],"root2":[2,1,4]}' },
    { label: 'Own case 2', input: '{"root1":[2,null,9],"root2":[9,2]}' },
    { label: "Single node per tree", input: "{\"root1\":[7],\"root2\":[-3]}" },
    { label: "Equal values in both trees", input: "{\"root1\":[4,2,6],\"root2\":[4,1]}" },
    { label: "Extreme values -50 and 50", input: "{\"root1\":[-50,null,50],\"root2\":[0]}" },
    { label: "Long run: ten nodes per tree", input: "{\"root1\":[20,-5,36,-16,13,24,37,-36,null,12,null,22],\"root2\":[11,-16,36,-23,8,19,41,-26,null,-7,null,12]}" },
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
