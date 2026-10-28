import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Length limit', description: 'Each piece is at most word length minus friends plus one letters, or the whole word for one friend.' },
    { id: 'window', label: 'Window', description: 'Read the longest allowed piece from this start.' },
    { id: 'better', label: 'New best', description: 'This piece is larger than the best so far.' },
    { id: 'done', label: 'Complete', description: 'Report the largest piece.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Box (JSON object with word and numFriends)',
  url: 'https://leetcode.com/problems/find-the-lexicographically-largest-string-from-the-box-i/',
  complexity: 'O(n^2) time for comparing windows, O(n) space. The visualization caps input at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"dbca","numFriends":2}' },
    { label: 'Example 2', input: '{"word":"gggg","numFriends":4}' },
  ],
}

export default function LargestStringFromTheBox() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Word" length={run.input.word.length} valueAt={i => run.input.word[i]} active={step.start}
      roleAt={i => (step.start >= 0 && i >= step.start && i < step.start + step.longest ? 'window' : '')} />
    <output aria-label="Best so far">{`Window: ${step.piece || '(none)'}, best: ${step.best || '(empty)'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A piece longer than word length minus friends plus one would leave too few letters for the other friends. With one friend, the only piece is the whole word.</p>
  </>} />
}
