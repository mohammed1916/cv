import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No good integer has been found yet.' },
    { id: 'scan', label: 'Scan window', description: 'Check whether the three digits in this window are equal.' },
    { id: 'found', label: 'New best', description: 'This window is all one digit and beats the best so far.' },
    { id: 'done', label: 'Complete', description: 'Report the largest good integer, or empty text.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digits (JSON object with num)',
  url: 'https://leetcode.com/problems/largest-3-same-digit-number-in-string/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 30 digits.',
  examples: [
    { label: 'Example 1', input: '{"num":"6777133339"}' },
    { label: 'Zeros', input: '{"num":"2300019"}' },
    { label: 'None', input: '{"num":"42352338"}' },
  ],
}

export default function LargestThreeSameDigitNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits" length={run.input.num.length} valueAt={i => run.input.num[i]} active={step.start}
      roleAt={i => (step.start >= 0 && i >= step.start && i < step.start + 3 ? 'window' : '')} />
    <output aria-label="Best so far">{`Window: ${step.piece || '(none)'}, best: ${step.best || '(empty)'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Digits compare the same way as numbers when the windows have equal length, so the largest window string is the largest good integer.</p>
  </>} />
}
