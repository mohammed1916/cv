import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitWindowView from './DigitWindowView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no matching subarrays.' },
    { id: 'start-index', label: 'Start index', description: 'Begin a running sum at this index.' },
    { id: 'extend', label: 'Extend', description: 'Add the next value and read the sum digits.' },
    { id: 'hit', label: 'Match', description: 'The sum begins and ends with x.' },
    { id: 'done', label: 'Result', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and x (e.g. {"nums":[1,2,3,4],"x":3})',
  url: 'https://leetcode.com/problems/valid-subarrays-with-matching-sum-digits-i/',
  complexity: 'O(n^2) time for this direct scan, with O(1) extra space. The visual caps the array at 12 values.',
  examples: [
    { label: 'Small values', input: '{"nums":[1,2,3,4],"x":3}' },
    { label: 'Repeated digit', input: '{"nums":[5,5,10,1],"x":5}' },
    { label: "Single value", input: '{"nums":[7],"x":7}' },
    { label: "Equal values", input: '{"nums":[4,4,4,4],"x":4}' },
    { label: "Boundary values", input: '{"nums":[1000,1,1000,9],"x":9}' },
    { label: "Long run: 12 values", input: '{"nums":[775,282,427,586,589,287,130,852,599,595,634,758],"x":6}' },
  ],
}

export default function ValidSubarraysWithMatchingSumDigitsI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DigitWindowView run={run} step={step} />} renderReasoning={({ run, step }) => (
    <p>Each running sum is checked by its first and last decimal digit. {step.message} {run ? `Total: ${run.result}.` : ''}</p>
  )} />
}
