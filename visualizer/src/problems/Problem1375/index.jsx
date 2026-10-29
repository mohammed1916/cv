import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap, examples } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Scan steps', description: 'Flip one bit per step and track the highest flipped position.' },
    { id: 'done', label: 'Result', description: 'Report how many steps leave a prefix of ones.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Flips (JSON object with flips, e.g. {"flips":[3,2,4,1,5]})',
  url: 'https://leetcode.com/problems/number-of-times-binary-string-is-prefix-aligned/',
  complexity: 'O(n) time and O(n) space for the visualized bit string. The visualization caps n at 50.',
  examples,
}

export default function NumberOfTimesBinaryStringIsPrefixAligned() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="flips" length={run.input.flips.length} valueAt={i => run.input.flips[i]} active={step.i - 1}
        roleAt={i => (i < step.i ? 'flipped' : '')} />
      <IndexedSequence label="bits" length={run.input.flips.length} valueAt={i => step.bits[i]} active={-1}
        roleAt={i => (step.bits[i] === 1 ? 'one' : '')} />
      <p>Highest: {step.highest} · Aligned steps: {step.count}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
