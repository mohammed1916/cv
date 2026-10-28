import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Find the sum of 1 to n.' },
    { id: 'check', label: 'Check x', description: 'Compare the sum from 1 to x with the sum from x to n.' },
    { id: 'done', label: 'Complete', description: 'Report the pivot, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n from 1 to 1000, for example {"n":8}',
  url: 'https://leetcode.com/problems/find-the-pivot-integer/',
  complexity: 'O(n) time for this scan. The visualization caps n at 1000.',
  examples: [
    { label: 'Example 1', input: '{"n":8}' },
    { label: 'No pivot', input: '{"n":4}' },
  ],
}

export default function PivotInteger() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers 1 to n" length={run.input.n} valueAt={index => index + 1} roleAt={index => (index + 1 === step.x ? 'pivot' : index + 1 < step.x ? 'left' : '')} active={Math.max(step.x - 1, -1)} indexOffset={1} />
    <output aria-label="Sums">{`Left sum: ${step.left}. Right sum: ${step.right}.`}</output>
  </>} renderReasoning={() => <>
    <p>The sum from 1 to x grows as x grows, and the sum from x to n shrinks, so there is at most one x where they are equal.</p>
    <p>Keeping the left sum as a running total gives the right sum from the overall total, so each check is constant time.</p>
  </>} />
}
