import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PrefixBarsView from './PrefixBarsView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3353',
  phases: [
    { id: 'start', label: 'Start', description: 'Copy the values.' },
    { id: 'check', label: 'Check gap', description: 'Compare a neighbouring pair.' },
    { id: 'apply', label: 'Shift prefix', description: 'Add the gap to the prefix.' },
    { id: 'done', label: 'Result', description: 'Report the operation count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers)',
  url: 'https://leetcode.com/problems/minimum-total-operations/',
  complexity: 'O(n) time and O(n) space for the working copy used by the trace; O(1) extra space for the count alone. Reading used here: an operation adds a chosen integer to every value in one prefix, and the answer is the number of neighbouring pairs that differ, since one prefix shift can close exactly one such gap. The visualization caps nums at 10 values in -50 to 50.',
  examples: [
    { label: 'Mixed gaps', input: '{"nums":[4,4,7,2,2,9]}' },
    { label: 'Negative values', input: '{"nums":[3,-1,-1,6,5]}' },
    { label: 'Single value', input: '{"nums":[0]}' },
    { label: 'Equal neighbours', input: '{"nums":[3,3,3]}' },
    { label: 'Extreme values, longest list', input: '{"nums":[-50,50,-50,50,-50,50,-50,50,-50,50]}' },
    { label: 'Long run: 10 values', input: '{"nums":[-7,41,-21,7,43,3,-50,20,19,-16]}' },
  ],
}

export default function MinimumTotalOperations() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PrefixBarsView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>A prefix shift changes only the gap between its last index and the next value. Each unequal gap therefore needs one shift, and shifting by the gap closes it without disturbing the gaps before it.</p>
          <p>{step.phase === 'done' ? `All values end at the last value, using ${step.result} operation${step.result === 1 ? '' : 's'}.` : step.message}</p>
        </>
      )}
    />
  )
}
