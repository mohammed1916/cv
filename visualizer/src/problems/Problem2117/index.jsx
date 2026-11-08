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
    { label: 'Narrow range', input: '{"left":4,"right":11}' },
    { label: 'Short range', input: '{"left":6,"right":9}' }, { label: "Single number", input: "{\"left\":1,\"right\":1}" }, { label: "Equal bounds", input: "{\"left\":5,\"right\":5}" }, { label: "Largest range", input: "{\"left\":1,\"right\":1000}" }, { label: "Long run: upper half", input: "{\"left\":500,\"right\":1000}" },
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
