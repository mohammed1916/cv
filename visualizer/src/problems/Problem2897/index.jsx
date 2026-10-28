import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Bit counts', description: 'Count how many values have each bit set.' },
    { id: 'pack', label: 'Pack', description: 'Build one of the k target values from the bits still available.' },
    { id: 'done', label: 'Complete', description: 'Report the sum of squares.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (values 0 to 255) and k',
  url: 'https://leetcode.com/problems/apply-operations-on-array-to-maximize-sum-of-squares/',
  complexity: 'O(k * 8 + n * 8) time. The visualization caps the array at six values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,6,5,8],"k":2}' },
    { label: 'Example 2', input: '{"nums":[4,5,4,7],"k":3}' },
  ],
}

export default function MaximizeSumOfSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.nums.length} valueAt={index => run.nums[index]} active={-1} />
    <output aria-label="Bit counts">{`Bits still available (bit 0 first): ${step.counts.join(', ')}`}</output>
    <output aria-label="Total">{`Sum of squares so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>The operation only moves set bits between two positions: for each bit, the number of values with that bit set never changes.</p>
    <p>So the goal is to pack the bit counts into k numbers as large as possible. Each number takes every bit that still has copies left, which keeps the squares large.</p>
  </>} />
}
