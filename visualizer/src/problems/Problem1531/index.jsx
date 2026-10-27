import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the first character with no current run.' },
    { id: 'visit', label: 'Decide', description: 'Consider deleting or keeping this character.' },
    { id: 'reuse', label: 'Memo hit', description: 'Reuse the answer for this character, run and deletion budget.' },
    { id: 'store', label: 'Store', description: 'Save the shorter of the two choices.' },
    { id: 'done', label: 'Complete', description: 'Report the shortest compressed length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (1 to 12 lowercase letters) and k',
  url: 'https://leetcode.com/problems/string-compression-ii/',
  complexity: 'O(n^2 * k) states with memoization, each with two choices. The visualization caps s at 12 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"aaabcccd","k":2}' },
    { label: 'Example 2', input: '{"s":"aabbaa","k":2}' },
  ],
}

export default function StringCompressionII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s } = run.input
    return <>
      <IndexedSequence label="Characters" length={s.length} valueAt={i => s[i]} active={step.i < s.length ? step.i : -1}
        roleAt={i => (step.i < s.length && i < step.i ? 'decided' : '')} />
      <dl aria-label="State">
        <dt>Current run</dt><dd>{step.letter ? `${step.letter} x${step.run}` : 'none'}</dd>
        <dt>Deletions left</dt><dd>{step.left ?? '-'}</dd>
        <dt>States computed</dt><dd>{step.states}</dd>
      </dl>
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each character is either deleted, using one of the budget, or kept. Keeping it either extends the current run or starts a new one.</p>
    <p>The cost of the rest depends only on the position, the current run letter and length, and the deletions left, so each such state is computed once.</p>
  </>} />
}
