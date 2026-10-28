import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every basket is unused and no fruit is unplaced.' },
    { id: 'scan', label: 'Scan basket', description: 'Check whether this basket is free and large enough.' },
    { id: 'place', label: 'Place fruit', description: 'Use the first basket that fits.' },
    { id: 'unplaced', label: 'Unplaced', description: 'No basket fits, so count the fruit as unplaced.' },
    { id: 'done', label: 'Complete', description: 'Report the number of unplaced fruits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with fruits and baskets arrays (JSON)',
  url: 'https://leetcode.com/problems/fruits-into-baskets-ii/',
  complexity: 'O(n^2) time and O(n) space for n fruits. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"fruits":[4,2,5],"baskets":[3,5,4]}' },
    { label: 'Same size', input: '{"fruits":[1,1,1],"baskets":[1,1,1]}' },
  ],
}

export default function FruitBaskets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Fruits (quantity)" length={run.input.fruits.length} active={step.fruit}
      valueAt={index => run.input.fruits[index]} roleAt={index => (index < step.fruit ? 'done' : '')} />
    <IndexedSequence label="Baskets (capacity)" length={run.input.baskets.length} active={step.basket}
      valueAt={index => run.input.baskets[index]} roleAt={index => (step.used[index] ? 'used' : '')} />
    <output aria-label="Unplaced fruits">{`Unplaced so far: ${step.unplaced}`}</output>
  </>} renderReasoning={() => <>
    <p>Each fruit takes the leftmost basket that is unused and large enough, so a basket is never shared.</p>
    <p>Only fruits that find no basket are counted, and the count is the answer.</p>
  </>} />
}
