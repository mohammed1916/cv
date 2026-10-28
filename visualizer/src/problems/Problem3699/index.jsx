import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Length 2', description: 'Count the length-2 arrays by their last value and last step direction.' },
    { id: 'extend', label: 'Extend', description: 'Add one element, alternating the direction of the step.' },
    { id: 'done', label: 'Complete', description: 'Add every up and down count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, l and r (JSON), for example {"n":3,"l":1,"r":3}',
  url: 'https://leetcode.com/problems/number-of-zigzag-arrays-i/',
  complexity: 'O(n * (r - l)) time and O(r - l) space with prefix sums. The visualization caps n and r at 12.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"l":4,"r":5}' },
    { label: 'Example 2', input: '{"n":3,"l":1,"r":3}' },
  ],
}

export default function ZigZagArraysI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label={`Ways ending at each value (up / down), length ${step.length}`} length={step.values.length}
      valueAt={index => `${step.up[index]} / ${step.down[index]}`} active={-1}
      indexOffset={step.values[0]} />
    <output aria-label="Total">{step.total === null ? `Arrays of length ${step.length} counted` : `Zigzag arrays: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A zigzag array alternates strict up and down steps and never repeats a value next to itself.</p>
    <p>Track the last value and whether the last step went up or down. A new up step needs the previous step to be down, which is a prefix sum over smaller values.</p>
  </>} />
}
