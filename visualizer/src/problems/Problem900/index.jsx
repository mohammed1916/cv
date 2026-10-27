import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Create', description: 'Store the encoding with pointer i = 0.' },
    { id: 'next', label: 'Call next', description: 'Begin skipping n elements.' },
    { id: 'skip', label: 'Skip run', description: 'Consume an entire run whose count is less than n.' },
    { id: 'take', label: 'Take from run', description: 'Shrink the current run and return its value.' },
    { id: 'exhaust', label: 'Exhausted', description: 'No runs left: return -1.' },
    { id: 'done', label: 'Complete', description: 'All calls processed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Operations (LeetCode JSON: names, args)',
  url: 'https://leetcode.com/problems/rle-iterator/',
  complexity: 'Amortised O(1) per call: the pointer only moves forward over each run once. O(len(encoding)) space.',
  examples: [
    { label: 'Official', input: '[["RLEIterator","next","next","next","next"],[[[3,8,0,9,2,5]],[2],[1],[1],[2]]]' },
    { label: 'Single run', input: '[["RLEIterator","next","next","next"],[[[5,1]],[2],[2],[2]]]' },
    { label: 'Zero counts', input: '[["RLEIterator","next","next"],[[[0,3,2,4,0,7,1,6]],[2],[1]]]' },
  ],
}

export default function RLEIterator() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <IndexedSequence label="Encoding (even index = count, odd index = value)" length={step.enc.length} valueAt={i => step.enc[i]} active={step.i < step.enc.length ? step.i : -1}
        roleAt={i => (i < step.i ? 'consumed' : '')} />
      <OperationLog title="next() calls" ops={step.log} current={step.log.length - 1} />
      <output aria-label="Remaining">Pointer i = {step.i}{step.n === null ? '' : `, n remaining to skip = ${step.n}`}</output>
    </>}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p><strong>Lazy consumption:</strong> never expand the runs. A run whose count is less than n is skipped whole; otherwise only the remaining n copies are removed from the current run, so the pointer never moves backward.</p>
    </>} />
}
