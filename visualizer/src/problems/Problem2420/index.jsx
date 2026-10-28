import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin every run length at 1.' },
    { id: 'left', label: 'Left runs', description: 'Extend non-increasing runs from the left.' },
    { id: 'right', label: 'Right runs', description: 'Extend non-decreasing runs from the right.' },
    { id: 'check', label: 'Check indices', description: 'Test both neighbourhoods of each candidate index.' },
    { id: 'done', label: 'Complete', description: 'Report every good index.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums (2 to 12 integers from 1 to 10) and k (1 to half the length)',
  url: 'https://leetcode.com/problems/find-all-good-indices/',
  complexity: 'O(n) time and O(n) space. The visualization caps nums at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1,1,1,3,4,1],"k":2}' },
    { label: 'Example 2', input: '{"nums":[2,1,1,2],"k":2}' },
  ],
}

export default function FindAllGoodIndices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => step.good.includes(index) ? 'good' : ''} />
    <output aria-label="Run lengths">{`Non-increasing run ending here: ${step.dec.join(', ')}`}</output>
    <output aria-label="Good so far">{`Good so far: ${step.good.length ? step.good.join(', ') : 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>An index is good when the k values before it form a non-increasing run and the k values after it form a non-decreasing run.</p>
    <p>Two linear passes record every run length, so each index is then a constant-time check.</p>
  </>} />
}
