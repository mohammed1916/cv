import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Sort the values to know the next smallest.' },
    { id: 'remove', label: 'Remove', description: 'The front is the smallest remaining value.' },
    { id: 'rotate', label: 'Rotate', description: 'The front moves to the back.' },
    { id: 'done', label: 'Result', description: 'The array is empty; report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 12 distinct integers)',
  url: 'https://leetcode.com/problems/make-array-empty/',
  complexity: 'The visualization caps nums at 12 values. The Python export simulates each operation, which is O(n^2) in the worst case.',
  examples: [
    { label: 'Rotate once', input: '{"nums":[5,1,4]}' },
    { label: 'Spread values', input: '{"nums":[2,6,9,7]}' },
    { label: 'Two values', input: '{"nums":[8,3]}' },
    { label: 'Single value', input: '{"nums":[4]}' },
    { label: 'Sorted ascending', input: '{"nums":[1,2,3,4,5]}' },
    { label: 'Negative and large values', input: '{"nums":[-1000000,1000000,0,-1]}' },
    { label: 'Long run: 12 distinct values', input: '{"nums":[7,68,60,26,53,96,8,19,38,69,61,90]}' },
  ],
}

export default function MakeArrayEmpty() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Front of the array" length={step.queue.length} valueAt={i => step.queue[i]} active={0}
      roleAt={i => (i === 0 && step.phase === 'rotate' ? 'moved' : '')} />
    <output aria-label="Operation count">{`operations so far: ${step.operations}, values left: ${step.queue.length} of ${run.input.nums.length}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the front of the array can be removed, so the algorithm rotates the front to the back until the smallest remaining value reaches the front.</p>
    <p>Each operation either removes a value or rotates the array, and the count of both is the answer.</p>
  </>} />
}
