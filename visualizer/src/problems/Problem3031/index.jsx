import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Z-array', description: 'Set up the Z-array and the window [l, r).' },
    { id: 'z', label: 'Z step', description: 'Extend the match at this position.' },
    { id: 'miss', label: 'Miss', description: 'The Z value at this second is too short.' },
    { id: 'match', label: 'Match', description: 'The Z value covers the remaining letters.' },
    { id: 'free', label: 'Free', description: 'Every original letter has been removed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with word (lowercase, 1 to 40 letters in this trace) and k',
  url: 'https://leetcode.com/problems/minimum-time-to-revert-word-to-initial-state-ii/',
  complexity: 'O(n) time for the Z-array and O(n / k) checks, each a constant-time lookup. The trace caps the word at 40 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"abcab","k":2}' },
    { label: 'Example 2', input: '{"word":"aabaa","k":4}' },
    { label: 'Example 3', input: '{"word":"abcabc","k":3}' },
  ],
}

export default function RevertWordII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="z (match length from each index)" length={run.input.word.length} valueAt={i => step.z[i]} active={step.i ?? (step.t ? step.t * run.input.k : -1)}
      roleAt={i => (i === step.l && step.r > step.l ? 'l' : i === step.r - 1 && step.r > step.l ? 'r' : i > step.l && i < step.r - 1 ? 'window' : i === step.i ? 'current' : '')} />
    <p>{`Z-window: l = ${step.l}, r = ${step.r} (the match covers [l, r))`}</p>
    <output aria-label="Second being tested">{step.t ? `t = ${step.t}, looking at z[${step.t * run.input.k}]` : `building z up to index ${step.i ?? 0}`}</output>
  </>} renderReasoning={() => <>
    <p>The Z-array records, for each position, how far the word matches its own beginning. After t seconds, the rest of the word equals the start exactly when the Z value at position t times k covers the rest.</p>
    <p>Building the Z-array once means each second is a single lookup instead of a string comparison.</p>
  </>} />
}
