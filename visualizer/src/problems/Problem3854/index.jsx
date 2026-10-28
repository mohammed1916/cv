import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Two parity patterns are possible.' },
    { id: 'shape', label: 'Shape', description: 'Count the wrong-parity elements for this pattern and find its spread.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest operations, then the smallest spread.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-array-parity-alternating/',
  complexity: 'O(n^2) time in this teaching version (candidate low ends). The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[-2,-3,1,4]}' },
    { label: 'Example 2', input: '{"nums":[0,2,-2]}' },
    { label: 'Single', input: '{"nums":[7]}' },
  ],
}

export default function ParityAlternating() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1} />
    <output aria-label="Operations and spread">{`Shape: ${step.shape === null ? '-' : step.shape}, ops: ${step.ops ?? '-'}, spread: ${step.spread ?? '-'}, best: ${step.best ? `[${step.best.join(', ')}]` : '-'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each operation changes one element by 1, which flips its parity. So each wrong element costs exactly one operation, and the right ones cost nothing.</p>
  </>} />
}
