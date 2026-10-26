import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Ends', description: 'Begin at both ends.' },
    { id: 'match', label: 'Match', description: 'Equal ends move inward.' },
    { id: 'mismatch', label: 'Mismatch', description: 'Try deleting the left or the right character.' },
    { id: 'done', label: 'Complete', description: 'Report whether one deletion is enough.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'String s (JSON string of lowercase letters)',
  url: 'https://leetcode.com/problems/valid-palindrome-ii/',
  complexity: 'O(n) time and O(1) extra space; each side is checked at most once after the first mismatch.',
  examples: [
    { label: 'Delete one', input: '"aba"' },
    { label: 'Delete middle', input: '"abca"' },
    { label: 'Not possible', input: '"abc"' },
  ],
}

export default function ValidPalindromeII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters" length={run.input.length} active={step.left} valueAt={i => run.input[i]}
      roleAt={i => (i === step.left ? 'left' : i === step.right ? 'right' : '')} />
    <output aria-label="Decision">{step.phase === 'done' ? `Result: ${String(step.result)}` : `Pointers ${step.left} and ${step.right}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why only two checks:</strong> the first mismatch must lose one of its two characters, so only those two sub-ranges can work.</p>
  </>} />
}
