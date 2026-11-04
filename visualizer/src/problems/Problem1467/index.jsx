import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Set up the total and the target size of each box.' },
    { id: 'color', label: 'Colour', description: 'Split one colour between the two boxes in every way.' },
    { id: 'done', label: 'Probability', description: 'Divide the favourable splits by all splits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of colour counts, for example [2,1,1]',
  url: 'https://leetcode.com/problems/probability-of-a-two-boxes-having-the-same-number-of-distinct-balls/',
  complexity: 'O(colours * T^2 * k^2) time for the state table. The visualization caps the total at 16 balls.',
  examples: [
    { label: 'Example 2', input: '[2,1,1]' },
    { label: 'Four colours', input: '[1,2,1,2]' },
  ],
}

export default function TwoBoxesSameDistinct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Balls per colour" length={run.input.length} valueAt={index => run.input[index]}
      active={step.color} roleAt={index => (index < step.color ? 'done' : '')} />
    {step.rows && <RecordStateTable label="Split states after this colour (box 1 balls, colours in box 1, colours in box 2)"
      columns={['box 1 balls', 'colours in box 1', 'colours in box 2', 'ways']}
      rows={step.rows.map(({ state, w }) => {
        const [size, d1, d2] = state.split(',').map(Number)
        return { 'box 1 balls': size, 'colours in box 1': d1, 'colours in box 2': d2, ways: w }
      })} />}
    <output aria-label="Split states">{`Split states tracked: ${step.states}`}</output>
  </>} renderReasoning={() => <>
    <p>Balls of one colour are distinct objects, so a colour with c balls can send k of them to box one in C(c, k) ways.</p>
    <p>Each box is described only by its ball count and how many colours it holds, so the DP stays small and the final probability is the favourable count over C(T, T/2).</p>
  </>} />
}
