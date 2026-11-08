import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty stack of indices.' },
    { id: 'pop', label: 'Pop', description: 'Pop an earlier index whose value is at most the current value.' },
    { id: 'record', label: 'Record steps', description: 'Set the step count for the current index.' },
    { id: 'done', label: 'Complete', description: 'Report the largest step count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: 1 to 30 integers from 1 to 100, e.g. {"nums":[5,3,4,4,7]}',
  url: 'https://leetcode.com/problems/steps-to-make-array-non-decreasing/',
  complexity: 'O(n) time and O(n) space with a monotonic stack. The visualization caps the input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[5,3,4,4,7,3,6,11,8,5,11]}' },
    { label: 'Example 2', input: '{"nums":[4,5,7,7,13]}' },
    { label: 'Single value', input: '{"nums":[9]}' },
    { label: 'Equal values', input: '{"nums":[4,4,4,4]}' },
    { label: 'Thirty values, extremes', input: '{"nums":[100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1]}' },
    { label: 'Long run: 30 values', input: '{"nums":[12,14,55,12,92,10,3,43,54,12,96,49,70,7,35,90,77,54,39,87,81,40,62,73,47,34,27,21,100,74]}' },
  ],
}

export default function StepsToMakeNonDecreasing() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const roleOf = index => (step.steps[index] > 0 ? `removed at step ${step.steps[index]}` : '')
    return <>
      <IndexedSequence label="Array values" length={nums.length} valueAt={i => nums[i]} active={step.index} roleAt={roleOf} />
      <output aria-label="Stack of indices">{`Stack (indices): ${step.stack.join(', ') || '(empty)'}`}</output>
      <output aria-label="Answer so far">{`Largest step count so far: ${step.answer}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>An element is removed in the round after its nearest surviving larger-or-equal predecessor, so its step count is one more than the best of the elements it pops.</p>
    <p>A monotonic stack keeps the candidates for that predecessor, so each index is pushed and popped once.</p>
  </>} />
}
