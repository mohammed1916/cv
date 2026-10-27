import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First', description: 'Start at the first combination.' },
    { id: 'emit', label: 'next()', description: 'Yield the combination at the current positions.' },
    { id: 'advance', label: 'Advance', description: 'Move the rightmost movable position, then reset the rest.' },
    { id: 'done', label: 'Complete', description: 'hasNext() is false; the sequence is finished.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with characters (sorted letters) and combination_length (JSON)',
  url: 'https://leetcode.com/problems/iterator-for-combination/',
  complexity: 'O(k) work per next() call, plus O(n choose k) total output. The visualization caps input at 6 characters.',
  examples: [
    { label: 'Example 1', input: '{"characters":"abc","combination_length":2}' },
    { label: 'Four letters', input: '{"characters":"abcd","combination_length":3}' },
  ],
}

export default function IteratorForCombination() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters" length={run.characters.length} valueAt={i => run.characters[i]}
      active={step.moved} roleAt={i => (step.positions.includes(i) ? 'picked' : '')} />
    <IndexedSequence label="Yielded so far" length={step.out.length} valueAt={i => step.out[i]} />
  </>} renderReasoning={() => <>
    <p>The iterator never stores every combination. Each next() call yields the current positions, then moves the rightmost position that still has room and resets the positions after it.</p>
    <p>hasNext() is true exactly while some position can still move, so the loop stops after the last combination.</p>
  </>} />
}
