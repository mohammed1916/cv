import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'Start with no values remembered.' },
    { id: 'scan', label: 'New value', description: 'This value has not been seen, so remember it.' },
    { id: 'repeat', label: 'Repeated value', description: 'This value was seen before, so it is a sneaky number.' },
    { id: 'sort', label: 'Sort', description: 'Put the two duplicates in ascending order.' },
    { id: 'done', label: 'Complete', description: 'Report the duplicates.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List as JSON: {"nums": [...]}',
  url: 'https://leetcode.com/problems/the-two-sneaky-numbers-of-digitville/',
  complexity: 'O(n) time and O(n) space for the set. The visualization caps the list at 30 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[0,1,1,0]}' },
    { label: 'Example 2', input: '{"nums":[0,3,2,1,3,2]}' },
  ],
}

export default function SneakyNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (step.duplicates.includes(run.input.nums[i]) ? 'repeat' : '')} />
    <output aria-label="Duplicates found">{`Duplicates found: ${step.duplicates.length ? step.duplicates.join(', ') : 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each value in the list is either new or a repeat. Only the two repeated values are reported, and remembering the values seen so far is enough to tell them apart.</p>
    <p>The statement guarantees the list holds 0 to n-1 with exactly two values appearing twice, so a set finds them in one pass.</p>
  </>} />
}
