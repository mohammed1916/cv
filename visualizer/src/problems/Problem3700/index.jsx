import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Length 2', description: 'Count the length-2 arrays by their last value and last step direction.' },
    { id: 'extend', label: 'Extend', description: 'Apply one step of the recurrence to every last value.' },
    { id: 'done', label: 'Complete', description: 'Add every up and down count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, l and r (JSON), for example {"n":3,"l":1,"r":3}',
  url: 'https://leetcode.com/problems/number-of-zigzag-arrays-ii/',
  complexity: 'O(m^3 log n) time for m = r - l + 1 values, using matrix exponentiation. The visualization runs the step recurrence and caps n and r at 12.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"l":4,"r":5}' },
    { label: 'Example 2', input: '{"n":3,"l":1,"r":3}' },
  ],
}

export default function ZigZagArraysII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label={`Ways ending at each value (up / down), length ${step.length}`} length={step.values.length}
      valueAt={index => `${step.up[index]} / ${step.down[index]}`} active={-1}
      indexOffset={step.values[0]} />
    <output aria-label="Total">{step.total === null ? `Arrays of length ${step.length} counted` : `Zigzag arrays: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>The recurrence is linear, so applying it n minus 2 times is a matrix power. The matrix has one row per value and direction.</p>
    <p>Matrix exponentiation makes very large n fast. The visualization steps through the same recurrence for small n.</p>
  </>} />
}
