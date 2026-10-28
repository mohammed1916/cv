import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Look for a block of exactly k equal letters.' },
    { id: 'scan', label: 'Check window', description: 'Check whether the window is uniform and bounded by different letters.' },
    { id: 'found', label: 'Found', description: 'This block has exactly k letters and different neighbors.' },
    { id: 'done', label: 'Complete', description: 'No window qualifies.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String and k (JSON object with s and k)',
  url: 'https://leetcode.com/problems/find-special-substring-of-length-k/',
  complexity: 'O(n * k) time and O(1) extra space. The visualization caps input at 40 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"aaabaaa","k":3}' },
    { label: 'No block', input: '{"s":"abc","k":2}' },
    { label: 'Too long', input: '{"s":"aaaab","k":2}' },
  ],
}

export default function FindSpecialSubstringOfLengthK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.start}
      roleAt={i => (step.start >= 0 && i >= step.start && i < step.start + step.k ? 'window' : '')} />
    <output aria-label="Window">{`Window length ${step.k}${step.start >= 0 ? ` at ${step.start}` : ''}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The window must be uniform and exactly bounded: the letter before and the letter after it must both differ from the window letter.</p>
  </>} />
}
