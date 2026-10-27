import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'erase', label: 'Erasable stretch', description: 'Find stretches of s that can be removed completely.' },
    { id: 'best', label: 'Best suffix', description: 'Choose the smallest result for the suffix starting at i.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest reachable string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with lowercase s (JSON)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-string-after-adjacent-removals/',
  complexity: 'O(n^3) time for the erasable table and O(n^2) for the suffix choices. The visualization caps input at 10 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abc"}' },
    { label: 'Example 2', input: '{"s":"zb"}' },
  ],
}

export default function SmallestAfterRemovals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.i}
      roleAt={i => (step.j > 0 && i >= step.i && i < step.j ? 'erased' : '')} />
    <output aria-label="Best">{`Best string so far: ${step.best === '' ? '(empty)' : step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Removals only happen inside stretches that can be erased on their own, because a kept letter is never removed.</p>
    <p>Building the answer from the right lets each position choose between keeping its letter and erasing a whole erasable stretch.</p>
  </>} />
}
