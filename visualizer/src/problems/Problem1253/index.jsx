import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Quotas', description: 'Set how many ones each row still needs.' },
    { id: 'column', label: 'Column', description: 'Place the ones of one column.' },
    { id: 'done', label: 'Check', description: 'Confirm both rows used exactly their quota.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with upper, lower and colsum (entries 0, 1 or 2)',
  url: 'https://leetcode.com/problems/reconstruct-a-2-row-binary-matrix/',
  complexity: 'O(n) time and O(n) space for n columns. The visualization caps n at 20.',
  examples: [
    { label: 'Example 1', input: '{"upper":2,"lower":1,"colsum":[1,1,1]}' },
    { label: 'Example 2', input: '{"upper":2,"lower":3,"colsum":[2,1,1,1]}' },
    { label: 'Single empty column', input: '{"upper":0,"lower":0,"colsum":[0]}' },
    { label: 'No solution', input: '{"upper":1,"lower":0,"colsum":[2]}' },
    { label: 'Ones split evenly', input: '{"upper":2,"lower":2,"colsum":[1,1,1,1]}' },
    { label: 'Largest totals', input: '{"upper":20,"lower":20,"colsum":[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]}' },
    { label: 'Long run: 20 columns', input: '{"upper":9,"lower":10,"colsum":[1,2,0,1,1,2,2,1,1,0,2,1,2,1,0,0,0,1,1,0]}' },
  ],
}

export default function ReconstructTwoRowMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Column sums" length={run.input.colsum.length} valueAt={index => run.input.colsum[index]} active={step.index} roleAt={index => step.placed[index]} />
    <output aria-label="Remaining ones">{`Ones still needed: top ${step.up}, bottom ${step.low}`}</output>
  </>} renderReasoning={() => <>
    <p>Columns with sum 2 and sum 0 are forced. Each column with sum 1 can go to either row.</p>
    <p>Filling the top row first with single columns keeps the bottom row's quota as the only remaining requirement.</p>
  </>} />
}
