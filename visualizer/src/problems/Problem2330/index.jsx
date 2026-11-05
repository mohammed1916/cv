import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2330',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase string (e.g. kitten)',
  url: 'https://leetcode.com/problems/valid-palindrome-iv/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the string at 20 letters.',
  examples: [
    { label: 'Two mismatches', input: 'kitten' },
    { label: 'Three mismatches', input: 'harbors' },
    { label: 'Odd length', input: 'abcdeba' },
  ],
}

export default function Problem2330Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <>
        <IndexedSequence label="letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.l}
          roleAt={i => (i === step.l ? 'l' : i === step.r ? 'r' : step.l >= 0 && (i < step.l || i > step.r) ? 'done' : step.match === false && (i === step.l || i === step.r) ? 'mismatch' : '')} />
        <output aria-label="Mismatches">{`mismatches ${step.mismatches} of ${Math.floor(run.input.s.length / 2)} pairs checked`}</output>
        <p role="status">{step.message}</p>
      </>}
      renderReasoning={() => <>
        <p>A palindrome matches each letter with its mirror. Walk l and r inward from both ends, comparing one pair at a time.</p>
        <p>Each mismatched pair needs one change, and one change can fix only one pair. Two changes are enough exactly when there are at most two mismatched pairs.</p>
        <p>The problem allows one or two changes rather than zero. A string that already matches can still be changed twice at the same mirror pair, so a palindrome with no mismatch is also accepted.</p>
      </>}
    />
  )
}
