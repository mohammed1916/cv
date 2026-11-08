import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count how often each value appears.' },
    { id: 'group', label: 'Add group cost', description: 'Add ceil(count / 3) operations for this value.' },
    { id: 'stuck', label: 'Stuck', description: 'A value that appears once can never be removed.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integers 1 to 10 as a JSON array',
  url: 'https://leetcode.com/problems/minimum-number-of-operations-to-make-array-empty/',
  complexity: 'O(n) time and O(n) space.',
  examples: [
    { label: 'Six values, repeated four', input: '[4,1,4,2,7,1]' },
    { label: 'Two equal values', input: '[5,5]' },
    { label: "Smallest pair", input: "[1,1]" },
    { label: "Equal values", input: "[5,5,5,5,5]" },
    { label: "Maximum values, length 20", input: "[10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1,10,1]" },
    { label: "Long run: 20 values", input: "[4,6,10,10,2,6,5,10,6,5,10,2,3,7,4,3,3,10,4,8]" },
  ],
}

export default function MinimumOperationsToEmptyArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} valueAt={i => run.input[i]} roleAt={i => (run.input[i] === step.value ? 'group' : '')} />
    <output aria-label="Operations so far">{`Operations so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation removes two or three equal values, so the values of one kind can be grouped independently.</p>
    <p>A count of c needs ceil(c / 3) operations: take as many triples as possible and finish with one pair or triple.</p>
  </>} />
}
