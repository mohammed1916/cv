import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'The root gets position 0.' },
    { id: 'level', label: 'Measure level', description: 'Width is the last position minus the first, plus one.' },
    { id: 'done', label: 'Complete', description: 'Return the widest level.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/maximum-width-of-binary-tree/',
  complexity: 'O(n) time and O(w) extra space for the widest level. Positions are shifted per level, so they never overflow.',
  examples: [
    { label: 'Gap', input: '[1,3,2,5,3,null,9]' },
    { label: 'Sparse', input: '[1,3,2,5,null,null,9,6,null,7]' },
    { label: 'Single', input: '[1]' },
  ],
}

export default function MaxWidthTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.level.forEach((item, index) => {
      roles[item.id] = index === 0 ? 'l' : index === step.level.length - 1 ? 'r' : 'level'
    })
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} note={step.width ? `level ${step.depth} width ${step.width}` : 'measuring'} />
      <RecordStateTable label="Positions on the current level" columns={['node', 'position']}
        rows={step.level.map(item => ({ node: item.value, position: item.pos }))} activeRow={-1} />
      <output aria-label="Widest so far">{`Widest so far: ${step.best}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why positions:</strong> missing nodes still occupy positions, so a level with a gap in the middle is correctly counted as wide.</p>
  </>} />
}
