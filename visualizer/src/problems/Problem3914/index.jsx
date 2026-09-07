import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, valueAtStep, code } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-array-non-decreasing/',
  complexity: 'The solver uses O(n) time and O(1) extra space. This visualization stores O(n) events and cumulative offsets, not a full array copy per step.',
  examples: [{ label: 'Two drops', input: '[3,3,2,1]' }, { label: 'One suffix', input: '[5,1,2,3]' }, { label: 'Repeated valleys', input: '[5,1,5,1]' }, { label: 'Already sorted', input: '[1,2,2,4]' }],
}
export default function MinimumIncrementCost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Original array: adjacent drops" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => i === step.index - 1 ? 'left' : ''} />
    <IndexedSequence label="Constructed array after paid increments" length={run.input.length} active={step.index} valueAt={i => valueAtStep(run, step, i)}
      roleAt={i => step.phase === 'apply' && step.drop > 0 && i >= step.index ? 'shifted' : ''} />
    <output aria-label="Total increment cost">{step.phase === 'done' ? 'Minimum cost' : 'Cost so far'}: {step.total}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>Current boundary: {step.index ? `${step.index - 1} → ${step.index}` : 'none yet'}.</p>
    <p>Required increase at this boundary: {step.drop}.</p>
    {step.phase === 'apply' && step.drop > 0 && <p>One operation: add {step.drop} to indices {step.index} through {run.input.length - 1}.</p>}
    <p><strong>Lower bound:</strong> a subarray increment can reduce a drop only at the boundary where that subarray starts. Every original drop must be paid for.</p>
    <p><strong>Construction:</strong> incrementing suffixes pays exactly those drops, without making a later boundary worse. Thus the sum of positive adjacent drops is optimal.</p>
    <p>The objective is the sum of increment amounts, not the number of operations.</p>
  </>} />
}
