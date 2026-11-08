import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Small range from four to twelve', input: '{"num1":4,"num2":12}' },
    { label: 'Range near the top limit', input: '{"num1":99990,"num2":100000}' },
    { label: "Single number", input: "{\"num1\":1,\"num2\":1}" },
    { label: "Two numbers across a digit boundary", input: "{\"num1\":9,\"num2\":10}" },
    { label: "Top of the range", input: "{\"num1\":99999,\"num2\":100000}" },
    { label: "Long run: 301 numbers", input: "{\"num1\":7340,\"num2\":7640}" },
  ],
}

export default function TotalWavinessRange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {(() => { const ds = String(step.number); return <IndexedSequence label="Digits of the current number" length={ds.length}
      valueAt={i => ds[i]} active={-1} roleAt={i => { if (i === 0 || i === ds.length - 1) return 'end, never counted'; const d = +ds[i]; if (d > +ds[i - 1] && d > +ds[i + 1]) return 'peak'; if (d < +ds[i - 1] && d < +ds[i + 1]) return 'valley'; return 'plain' }} /> })()}
    <output aria-label="Number">{`Range ${run.input.num1} to ${run.input.num2}. Current number: ${step.number}`}</output>
    <output aria-label="Total">{`Total waviness so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A digit is a peak when it is larger than both neighbours and a valley when it is smaller than both. The first and last digits have only one neighbour, so they never count.</p>
    <p>Numbers with fewer than three digits have no interior digit and contribute nothing.</p>
  </>} />
}
