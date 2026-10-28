import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a total of 0.' },
    { id: 'step', label: 'Step', description: 'Add or subtract the value depending on the index parity.' },
    { id: 'done', label: 'Complete', description: 'Report the alternating sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers from 1 to 100 (JSON)',
  url: 'https://leetcode.com/problems/compute-alternating-sum/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 100 entries.',
  examples: [
    { label: 'Example 1', input: '[1,3,5,7]' },
    { label: 'Example 2', input: '[100]' },
  ],
}

export default function ComputeAlternatingSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={index => run.input[index]} active={step.index}
      roleAt={index => (index % 2 === 0 ? 'added' : 'subtracted')} />
    <output aria-label="Total">{`Total so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Even indices are added and odd indices are subtracted, so one pass with the index parity gives the answer.</p>
  </>} />
}
