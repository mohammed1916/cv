import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DifferByOneView from './DifferByOneView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '1554',
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty set of wildcard keys.' },
    { id: 'word', label: 'Word', description: 'Take the next word from the list.' },
    { id: 'mask', label: 'Mask', description: 'Replace one position with a star to form a key.' },
    { id: 'store', label: 'Store', description: 'Remember the key for later words.' },
    { id: 'hit', label: 'Match', description: 'A key was already stored, so two words differ only there.' },
    { id: 'done', label: 'Result', description: 'Report whether such a pair exists.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of distinct equal-length lowercase words (e.g. ["abc","adc","xyz"])',
  url: 'https://leetcode.com/problems/strings-differ-by-one-character/',
  complexity: 'O(n * m) expected time for n words of length m, using a hash set of wildcard keys. Each key has length m, so the set holds up to n * m keys of length m. The visualization caps the list at 12 words of up to 8 letters.',
  examples: [
    { label: 'Pair at position 2', input: '["abcd","abce","axyz"]' },
    { label: 'No single-letter pair', input: '["aaa","bbb","abc","cab"]' },
    { label: 'Pair found last', input: '["hello","world","hellp","pearl"]' },
  ],
}

export default function StringsDifferByOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DifferByOneView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Two words differ in exactly one position precisely when replacing that position with a wildcard gives the same key for both, so one set lookup per position finds the pair.</p>
  </>} />
}
