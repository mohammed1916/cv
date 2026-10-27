import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty window.' },
    { id: 'extend', label: 'Extend', description: 'Add letters on the right until the window covers word2.' },
    { id: 'count', label: 'Count', description: 'Every end from the window to the string end works for this start.' },
    { id: 'shrink', label: 'Shrink', description: 'Remove the left letter before the next start.' },
    { id: 'done', label: 'Complete', description: 'Report the number of qualifying substrings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with word1 and word2',
  url: 'https://leetcode.com/problems/count-substrings-that-can-be-rearranged-to-contain-a-string-ii/',
  complexity: 'O(n * 26) time with one sliding window. The visualization caps word1 at 16 letters and word2 at 5.',
  examples: [
    { label: 'Example 1', input: '{"word1":"bcca","word2":"abc"}' },
    { label: 'Example 2', input: '{"word1":"abcabc","word2":"abc"}' },
  ],
}

export default function RearrangeableSubstringsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="word1" length={run.input.word1.length} valueAt={i => run.input.word1[i]} active={Math.min(step.right, run.input.word1.length - 1)}
      roleAt={i => (i >= step.left && i < step.right ? 'window' : '')} />
    <output aria-label="Window">{`Window ${step.left} to ${step.right - 1}: counts ${step.have || 'none'}. Total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The window's right end never moves backward, so the whole scan takes one pass over word1.</p>
  </>} />
}
