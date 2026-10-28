import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the running total at 0.' },
    { id: 'number', label: 'Number', description: 'Add the peaks and valleys of this number.' },
    { id: 'done', label: 'Complete', description: 'Report the total waviness.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with num1 and num2, for example {"num1":120,"num2":130}',
  url: 'https://leetcode.com/problems/total-waviness-of-numbers-in-range-i/',
  complexity: 'O((num2 - num1 + 1) * d) time for d digits. The visualization caps the range at 301 numbers.',
  examples: [
    { label: 'Example 1', input: '{"num1":120,"num2":130}' },
    { label: 'Example 2', input: '{"num1":198,"num2":202}' },
  ],
}

export default function TotalWavinessRange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Number">{`Range ${run.input.num1} to ${run.input.num2}. Current number: ${step.number}`}</output>
    <output aria-label="Total">{`Total waviness so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A digit is a peak when it is larger than both neighbours and a valley when it is smaller than both. The first and last digits have only one neighbour, so they never count.</p>
    <p>Numbers with fewer than three digits have no interior digit and contribute nothing.</p>
  </>} />
}
