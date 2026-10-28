import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the counters for factors of 2 and 5.' },
    { id: 'multiply', label: 'Multiply', description: 'Strip 2s and 5s from each number and keep the rest.' },
    { id: 'done', label: 'Complete', description: 'Write the abbreviation with the trimmed zeros.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with left and right, 1 <= left <= right <= 1000, for example {"left":371,"right":375}',
  url: 'https://leetcode.com/problems/abbreviating-the-product-of-a-range/',
  complexity: 'O(right - left) time. The visualization caps right at 1000.',
  examples: [
    { label: 'Example 1', input: '{"left":1,"right":4}' },
    { label: 'Example 2', input: '{"left":2,"right":11}' },
  ],
}

export default function AbbreviateProduct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Range being multiplied" length={run.input.right - run.input.left + 1} valueAt={index => run.input.left + index} active={step.index} indexOffset={run.input.left} />
    <output aria-label="Trailing zeros">{`Trailing zeros removed so far: ${step.zeros}`}</output>
  </>} renderReasoning={() => <>
    <p>Each trailing zero comes from one factor of 2 paired with one factor of 5, so counting both and removing the smaller count gives the zeros to report.</p>
    <p>The first digits come from summing base-10 logarithms, and the last digits come from multiplying modulo a power of ten.</p>
  </>} />
}
