import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Tally how often each value appears.' },
    { id: 'x', label: 'Choose x', description: 'Take the next smallest value as x.' },
    { id: 'check', label: 'Check y', description: 'This larger value has the same count as x.' },
    { id: 'found', label: 'Found', description: 'This larger value has a different count.' },
    { id: 'done', label: 'Complete', description: 'Report the pair.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums)',
  url: 'https://leetcode.com/problems/smallest-pair-with-different-frequencies/',
  complexity: 'O(n + d^2) time where d is the number of distinct values. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,1,2,2,3,4]}' },
    { label: 'No pair', input: '{"nums":[1,5]}' },
  ],
}

export default function SmallestPairDifferentFrequencies() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1}
      roleAt={i => (run.input.nums[i] === step.x ? 'x' : run.input.nums[i] === step.y ? 'y' : '')} />
    <output aria-label="Pair">{`x: ${step.x ?? '-'}, y: ${step.y ?? '-'}${step.result ? `, answer: [${step.result.join(', ')}]` : ''}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>x is taken in increasing order, so the first valid pair found has the smallest x. For that x, the first y with a different count is the smallest such y.</p>
  </>} />
}
