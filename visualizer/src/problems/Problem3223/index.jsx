import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count how often each character appears.' },
    { id: 'odd', label: 'Odd count', description: 'An odd count leaves one character.' },
    { id: 'even', label: 'Even count', description: 'An even count leaves two characters.' },
    { id: 'done', label: 'Complete', description: 'Report the total length left.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase string as a JSON string',
  url: 'https://leetcode.com/problems/minimum-length-of-string-after-operations/',
  complexity: 'O(n) time and O(26) space.',
  examples: [
    { label: 'Example 1', input: '"abaacbcbb"' },
    { label: 'Example 2', input: '"aa"' },
  ],
}

export default function MinimumLengthAfterOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String" length={run.input.length} valueAt={i => run.input[i]} roleAt={i => (run.input[i] === step.letter ? 'counted' : '')} />
    <output aria-label="Length so far">{`Length so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>An operation keeps the chosen character and removes its nearest neighbours of the same letter on each side, so it removes two copies at a time.</p>
    <p>Repeating it leaves one copy of an odd-count letter and two copies of an even-count letter, which is the smallest reachable.</p>
  </>} />
}
