import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ResidueTableView from './ResidueTableView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Only the empty subsequence exists.' },
    { id: 'element', label: 'Element', description: 'Fold one number into every size and remainder.' },
    { id: 'done', label: 'Result', description: 'Report the size-3 count for remainder 0.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and d, e.g. {"nums":[1,2,3,4,5],"d":3}',
  url: 'https://leetcode.com/problems/number-of-divisible-triplet-sums/',
  complexity: 'O(n d) time and O(d) extra space for the remainder table, since each number updates three sizes across d remainders. The visualization caps the list at 10 entries and d at 10.',
  examples: [
    { label: 'Counting five', input: '{"nums":[1,2,3,4,5],"d":3}' },
    { label: 'Equal values', input: '{"nums":[1,1,1,1],"d":3}' },
    { label: 'Three zeros', input: '{"nums":[0,0,0],"d":1}' },
    { label: 'Equal values', input: '{"nums":[3,3,3,3],"d":3}' },
    { label: 'Upper value and d', input: '{"nums":[20,20,20,20,20,20,20,20,20,20],"d":10}' },
    { label: 'Long run: 10 values', input: '{"nums":[19,5,5,13,16,17,18,17,19,10],"d":7}' },
  ],
}

export default function NumberOfDivisibleTripletSums() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <ResidueTableView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Subsequences are tracked by size and remainder, so equal values at different indices are counted separately, as the problem requires.</p>
    </>} />
}
