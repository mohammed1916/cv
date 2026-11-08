import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Tally how often each value appears.' },
    { id: 'scan', label: 'Scan', description: 'Check the next value in order.' },
    { id: 'found', label: 'Found', description: 'This value is even and appears exactly once.' },
    { id: 'done', label: 'Complete', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums)',
  url: 'https://leetcode.com/problems/first-unique-even-element/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,4,2,5,4,6]}' },
    { label: 'Example 2', input: '{"nums":[4,4]}' },
    { label: 'Single value', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[2,2,2,2]}' },
    { label: 'Extreme values 1 and 100', input: '{"nums":[100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1]}' },
    { label: 'Long run: 30 values', input: '{"nums":[87,89,49,81,33,28,97,45,55,69,25,61,53,72,23,9,72,43,90,79,97,2,62,15,48,50,89,29,16,11]}' },
  ],
}

export default function FirstUniqueEven() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} />
    <output aria-label="Answer">{step.result === null ? `Checking ${step.value ?? '-'}` : `Answer: ${step.result}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The counts are built first, so each check is a table lookup. The first value in array order that is even with count one is the answer.</p>
  </>} />
}
