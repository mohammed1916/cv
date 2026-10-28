import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the least significant digits with no carry.' },
    { id: 'digit', label: 'Digit', description: 'Add the digits and carry in base -2.' },
    { id: 'done', label: 'Complete', description: 'Report the sum without leading zeros.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with arr1 and arr2, each a most-significant-first array of 0 and 1',
  url: 'https://leetcode.com/problems/adding-two-negabinary-numbers/',
  complexity: 'O(max(m, n)) time and space. The visualization caps each array at 30 digits.',
  examples: [
    { label: 'Example 1', input: '{"arr1":[1,1,1,1,1],"arr2":[1,0,1]}' },
    { label: 'Zero', input: '{"arr1":[0],"arr2":[0]}' },
  ],
}

export default function NegabinarySum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Answer digits, most significant first" length={step.written.length} valueAt={index => step.written[index]} active={step.written.length - 1} />
    <output aria-label="Carry">{`Carry: ${step.carry ?? 0}`}</output>
  </>} renderReasoning={() => <>
    <p>In base -2 a carry can be negative, so each step computes the total of the two digits and the carry, then splits it into a digit of 0 or 1 and a new carry.</p>
    <p>Digits are processed from the right until both arrays and the carry are used up. Leading zeros are removed at the end.</p>
  </>} />
}
