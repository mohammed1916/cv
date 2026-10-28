import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Minute 1', description: 'One cell is colored.' },
    { id: 'ring', label: 'Ring', description: 'Each minute adds a ring of cells around the colored diamond.' },
    { id: 'done', label: 'Complete', description: 'Report the total colored cells.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with minutes from 1 to 200, for example {"minutes":3}',
  url: 'https://leetcode.com/problems/count-total-number-of-colored-cells/',
  complexity: 'O(minutes) time for the visualization. The closed form 2n^2 - 2n + 1 runs in O(1).',
  examples: [
    { label: 'One minute', input: '{"minutes":1}' },
    { label: 'Three minutes', input: '{"minutes":3}' },
  ],
}

export default function ColoredCells() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Cells added each minute" length={run.input.minutes} valueAt={index => (index === 0 ? 1 : 4 * index)} active={(step.minute ?? 1) - 1} indexOffset={1} />
    <output aria-label="Colored cells">{`Colored after minute ${step.minute}: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Colored cells form a diamond. Minute t adds the cells at distance t minus 1 from the start, which is four times t minus 1 cells.</p>
    <p>Summing the rings gives 2n squared minus 2n plus 1, which is the closed form used in the Python solution.</p>
  </>} />
}
