import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count digits', description: 'Count how many times each digit appears.' },
    { id: 'scan', label: 'Check pair', description: 'Test the pair at this position against the digit counts.' },
    { id: 'found', label: 'Valid pair', description: 'Both digits meet their own count, so this pair is the answer.' },
    { id: 'none', label: 'No pair', description: 'No adjacent pair is valid.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digits (JSON object with s)',
  url: 'https://leetcode.com/problems/find-valid-pair-of-adjacent-digits-in-string/',
  complexity: 'O(n) time and O(1) extra space for ten digit counts. The visualization caps input at 40 digits.',
  examples: [
    { label: 'Example 1', input: '{"s":"2523533"}' },
    { label: 'Example 2', input: '{"s":"221"}' },
    { label: 'None', input: '{"s":"22"}' },
  ],
}

export default function FindValidPairOfAdjacentDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.start}
      roleAt={i => (step.start >= 0 && (i === step.start || i === step.start + 1) ? 'pair' : '')} />
    <output aria-label="Digit counts">{step.counts.map((c, d) => `${d}:${c}`).join('  ')}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A digit d is valid only when it appears exactly d times in the whole string, and the pair must be two different digits.</p>
  </>} />
}
