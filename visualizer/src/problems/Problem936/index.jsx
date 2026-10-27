import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Begin with the full target.' },
    { id: 'check', label: 'Check window', description: 'Compare a window against the stamp, treating ? as a wildcard.' },
    { id: 'erase', label: 'Un-stamp', description: 'Replace a matched window with wildcards and record its index.' },
    { id: 'done', label: 'Complete', description: 'Reverse the recorded indices, or report impossible.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object {stamp, target} (JSON)',
  url: 'https://leetcode.com/problems/stamping-the-sequence/',
  complexity: 'O(n * (n - m + 1) * m) worst case time. The visualization caps the target at 30 characters.',
  examples: [
    { label: 'Example 1', input: '{"stamp":"abc","target":"ababc"}' },
    { label: 'Example 2', input: '{"stamp":"abca","target":"aabcaca"}' },
    { label: 'Impossible', input: '{"stamp":"ab","target":"ba"}' },
  ],
}

export default function StampingTheSequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Target being un-stamped" length={step.t.length} valueAt={i => step.t[i]} active={step.window ?? -1}
      roleAt={i => step.window !== null && i > step.window && i < step.window + run.input.stamp.length ? 'left' : step.t[i] === '?' ? 'match' : ''} />
    <IndexedSequence label="Stamp" length={run.input.stamp.length} valueAt={i => run.input.stamp[i]} />
    <output aria-label="Removal order">Removal order so far: [{step.res.join(', ')}]; wildcards {step.stars}/{run.input.target.length}</output>
  </>} renderReasoning={() => <>
    <p>The final stamp is fully visible, earlier stamps are partly covered. Undoing a stamp turns its letters into wildcards, which can then match any stamp letter in an earlier, overlapped stamp.</p>
    <p>Repeatedly removing any window that matches and still contains a real letter is safe, and the removal order reversed is a valid stamping order.</p>
  </>} />
}
