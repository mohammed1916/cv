import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Subtract the prefix up to num1 - 1 from the prefix up to num2.' },
    { id: 'upper', label: 'Upper bound', description: 'Digit DP for every number up to num2.' },
    { id: 'lower', label: 'Lower bound', description: 'Digit DP for every number up to num1 - 1.' },
    { id: 'done', label: 'Complete', description: 'Report the difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with num1 and num2, for example {"num1":120,"num2":130}',
  url: 'https://leetcode.com/problems/total-waviness-of-numbers-in-range-ii/',
  complexity: 'O(d * 10 * 2 * 2 * 11) states for d digits. The visualization caps the bound at 10^6.',
  examples: [
    { label: 'Own case 1', input: '{"num1":121,"num2":131}' },
    { label: 'Own case 2', input: '{"num1":4849,"num2":4849}' },
    { label: "Single number", input: "{\"num1\":1,\"num2\":1}" },
    { label: "Small range", input: "{\"num1\":1,\"num2\":10}" },
    { label: "Top of the range", input: "{\"num1\":999999,\"num2\":1000000}" },
    { label: "Long run: 5000 numbers", input: "{\"num1\":640544,\"num2\":645543}" },
  ],
}

export default function TotalWavinessLarge() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {(() => { const ds = String(step.bound); return <IndexedSequence label="Digits of the current bound" length={ds.length}
      valueAt={i => ds[i]} active={-1} roleAt={() => 'bound digit'} /> })()}
    <output aria-label="Bound">{`Current bound: ${step.bound}. Range [${run.input.num1}, ${run.input.num2}]`}</output>
    <output aria-label="Value">{`Prefix waviness for this bound: ${step.value}`}</output>
  </>} renderReasoning={() => <>
    <p>Summing the waviness of every number up to a bound is a digit DP over position, the previous digit, the last step direction, whether the number is still tight to the bound, and whether it has started.</p>
    <p>A turn at the previous digit adds one for every completion that follows it, so each state carries both a count and a total.</p>
  </>} />
}
