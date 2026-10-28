import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the first piece with no letters seen.' },
    { id: 'letter', label: 'Add letter', description: 'Add this letter to the current piece.' },
    { id: 'cut', label: 'Cut', description: 'A repeated letter closes the current piece; a new one starts here.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum number of pieces.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (1 to 16 lowercase letters)',
  url: 'https://leetcode.com/problems/optimal-partition-of-string/',
  complexity: 'O(n) time with a set of at most 26 letters. The visualization caps input at 16 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abacaba"}' },
    { label: 'Example 2', input: '{"s":"ssssss"}' },
  ],
}

export default function OptimalPartition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters of s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index} roleAt={i => (i >= step.start && i <= step.index ? 'piece' : '')} />
    <output aria-label="Current piece letters">{`Pieces: ${step.pieces}. Letters in current piece: ${step.seen.join('') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>A piece with distinct letters can be extended until its next letter repeats. Cutting only at that moment makes each piece as long as possible.</p>
    <p>Longer greedy pieces leave the rest of the string with the fewest cuts needed, so the greedy count is optimal.</p>
  </>} />
}
