import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap, examples } from './algorithm'

const definition = {
  phases: [
    { id: 'base', label: 'Base', description: 'Add up the current adjacent differences.' },
    { id: 'scan', label: 'Scan', description: 'Test each boundary as a reversal end and track pair bounds.' },
    { id: 'finish', label: 'Best gain', description: 'Compare the interior reversal with the end reversals.' },
    { id: 'done', label: 'Result', description: 'Report the maximum array value.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Array (JSON object with nums, e.g. {"nums":[2,3,1,5,4]})',
  url: 'https://leetcode.com/problems/reverse-subarray-to-maximize-array-value/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps arrays at 50 values.',
  examples,
}

export default function ReverseSubarrayToMaximizeArrayValue() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.i}
        roleAt={i => (step.i >= 0 && (i === step.i || i === step.i + 1) ? 'pair' : '')} />
      <dl>
        <dt>Base</dt><dd>{step.base}</dd>
        <dt>Best gain</dt><dd>{step.gain}</dd>
        <dt>maxMin</dt><dd>{step.maxMin ?? '-'}</dd>
        <dt>minMax</dt><dd>{step.minMax ?? '-'}</dd>
      </dl>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
