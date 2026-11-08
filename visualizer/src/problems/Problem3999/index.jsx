import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RotationView from './RotationView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3999',
  phases: [
    { id: 'start', label: 'Setup', description: 'Start with no groups.' },
    { id: 'split', label: 'Split', description: 'Separate even-index and odd-index letters.' },
    { id: 'rotate', label: 'Rotate', description: 'Find the smallest rotation of each part.' },
    { id: 'new', label: 'New group', description: 'The canonical key has not been seen before.' },
    { id: 'join', label: 'Join', description: 'The canonical key matches an earlier group.' },
    { id: 'done', label: 'Result', description: 'Report the number of groups.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of lowercase words (e.g. ["abcd","cdab","abdc"])',
  url: 'https://leetcode.com/problems/minimum-number-of-string-groups-through-transformations/',
  complexity: 'O(L) time per word with the two-pointer minimum rotation, so O(total length) overall. The visualization caps the list at 8 words of 8 letters.',
  examples: [
    { label: 'Two classes', input: '["abcd","cdab","abdc"]' },
    { label: 'Length one and two', input: '["a","z","ab","ba"]' },
    { label: "Single word", input: '["abc"]' },
    { label: "Equal words", input: '["ab","ab","ab"]' },
    { label: "Longest words", input: '["abcdefgh","hgfedcba","abcdefgh"]' },
    { label: "Long run: 8 words", input: '["d","dacc","dabddad","db","dbcda","dbbddbad","dca","dcddad"]' },
  ],
}

export default function MinimumNumberOfStringGroups() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <RotationView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Two words are linked exactly when their even letters are rotations of each other and their odd letters are rotations of each other, so one canonical key per word counts the groups.</p>
    </>} />
}
