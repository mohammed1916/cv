import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Whole text', description: 'Begin with the full text as the unmatched part.' },
    { id: 'pair', label: 'Matched chunks', description: 'The shortest prefix and suffix match, so both become chunks.' },
    { id: 'middle', label: 'Middle chunk', description: 'No prefix matches a suffix, so the rest is one chunk.' },
    { id: 'done', label: 'Complete', description: 'Report the chunk count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with lowercase text (JSON)',
  url: 'https://leetcode.com/problems/longest-chunked-palindrome-decomposition/',
  complexity: 'O(n^3) time in this straightforward form. The visualization caps input at 40 letters.',
  examples: [
    { label: 'Example 1', input: '{"text":"ghiabcdefhelloadamhelloabcdefghi"}' },
    { label: 'Single letter', input: '{"text":"merchant"}' },
  ],
}

export default function ChunkedPalindrome() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Text" length={run.input.text.length} valueAt={i => run.input.text[i]} active={step.left}
      roleAt={i => (i < step.left || i >= step.right ? 'chunked' : 'open')} />
    <output aria-label="Chunk count">{`Chunks so far: ${step.count}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Taking the shortest matching prefix and suffix first never hurts, because it leaves the longest remaining middle for further splits.</p>
  </>} />
}
