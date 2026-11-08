import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start the count at zero.' },
    { id: 'ok', label: 'Divisible', description: 'This number already divides evenly by three.' },
    { id: 'fix', label: 'One step', description: 'This number needs one step of plus or minus one.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of steps.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 1 to 40 integers from 1 to 50, for example [1,2,3,4]',
  url: 'https://leetcode.com/problems/find-minimum-operations-to-make-all-elements-divisible-by-three/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 40 numbers.',
  examples: [
    { label: 'Four numbers, mixed', input: '[11,14,21,6]' },
    { label: 'Three numbers, large', input: '[48,49,30]' },
    { label: 'Single element', input: '[5]' },
    { label: 'Equal values count separately', input: '[2,2,2,2]' },
    { label: 'Boundary values 1 and 50', input: '[1,50,50,1]' },
    { label: 'Zero steps when all divisible', input: '[12,27,48]' },
    { label: 'Long run: 40 numbers', input: '[42,1,11,26,45,14,10,23,25,12,18,18,19,42,30,32,33,35,48,36,49,5,7,14,44,38,34,7,9,46,26,35,46,26,1,13,44,26,35,46]' },
  ],
}

export default function DivisibleByThree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.length} valueAt={index => run.input[index]} active={step.index}
      roleAt={index => (run.input[index] % 3 === 0 ? 'divisible' : 'fix')} />
    <output aria-label="Steps">{`Steps so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Adding or subtracting one changes a number's remainder by one, so a number with remainder 1 or 2 needs exactly one step.</p>
    <p>Each number is independent, so the answer is the count of numbers that are not already divisible by three.</p>
  </>} />
}
