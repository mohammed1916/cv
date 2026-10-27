import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a result of 0.' },
    { id: 'take', label: 'Even', description: 'OR an even number into the result.' },
    { id: 'skip', label: 'Odd', description: 'Skip an odd number.' },
    { id: 'done', label: 'Complete', description: 'Report the OR of the even numbers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integers from 1 to 100 (JSON object with nums)',
  url: 'https://leetcode.com/problems/bitwise-or-of-even-numbers-in-an-array/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the list at 12 numbers.',
  examples: [
    { label: 'Mixed', input: '{"nums":[1,2,4,5,6]}' },
    { label: 'All odd', input: '{"nums":[1,3,5]}' },
  ],
}

export default function BitwiseOrOfEvens() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers in nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]}
      active={step.index} roleAt={index => (index <= step.index ? (run.input.nums[index] % 2 === 0 ? 'even' : 'odd') : '')} />
    <output aria-label="Running OR">{`Running OR of evens: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the even numbers are OR-ed together. An empty set of even numbers gives 0, which is the starting value.</p>
    <p>OR keeps every bit that is set in any chosen number, so the running result only grows.</p>
  </>} />
}
