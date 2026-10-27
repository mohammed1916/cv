import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The digits of s.' },
    { id: 'round', label: 'Round', description: 'Replace each neighbor pair with its sum mod 10.' },
    { id: 'done', label: 'Complete', description: 'Compare the last two digits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (digit string, 3 to 30 digits)',
  url: 'https://leetcode.com/problems/check-if-digits-are-equal-in-string-after-operations-i/',
  complexity: 'O(n^2) time for the rounds. The visualization caps s at 30 digits.',
  examples: [
    { label: 'Example 1', input: '{"s":"3902"}' },
    { label: 'Example 2', input: '{"s":"34789"}' },
  ],
}

export default function EqualDigitsAfterOps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label={`Digits after round ${step.round}`} length={step.row.length} valueAt={i => step.row[i]} active={-1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each round shortens the string by one digit, so the process ends with exactly two digits to compare.</p>
  </>} />
}
