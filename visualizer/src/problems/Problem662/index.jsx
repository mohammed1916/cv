import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Root gets position 1.' },
    { id: 'level', label: 'Measure level', description: 'Width is last position minus first position, plus one.' },
    { id: 'done', label: 'Complete', description: 'Return the widest level.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/maximum-width-of-binary-tree/',
  complexity: 'O(n) time and O(w) extra space for the current level. Positions can reach 2^depth, so the solver uses arbitrary-precision or offset arithmetic in languages with fixed-width integers.',
  examples: [
    { label: 'Gap', input: '[1,3,2,5,3,null,9]' },
    { label: 'Sparse', input: '[1,3,2,5,null,null,9,6,null,7]' },
    { label: 'Single', input: '[1]' },
  ],
}

export default function MaxWidthTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    return <>
      <BinaryTreeLane title="Tree" root={run.root} />
      <output aria-label="Width">{step.width ? `Level ${step.depth} width ${step.width}` : 'Measuring…'} · widest so far {step.best}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why positions:</strong> missing nodes still occupy positions, so a level with a gap in the middle is correctly counted as wide.</p>
  </>} />
}
