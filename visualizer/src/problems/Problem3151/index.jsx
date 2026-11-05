import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Scan', description: 'Check each adjacent pair from the left.' },
    { id: 'pair', label: 'Pair', description: 'These two values have different parity.' },
    { id: 'fail', label: 'Fail', description: 'These two values share a parity.' },
    { id: 'done', label: 'Result', description: 'Every adjacent pair alternates.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of 1 to 100 integers from 1 to 100',
  url: 'https://leetcode.com/problems/special-array-i/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '[7]' },
    { label: 'Example 2', input: '[2,5,8]' },
    { label: 'Example 3', input: '[3,8,5,10]' },
  ],
}

export default function SpecialArrayI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.at >= 0 ? step.at : -1}
      roleAt={i => (step.at >= 0 && i === step.at ? 'l' : step.at >= 0 && i === step.at + 1 ? 'r' : '')} />
    <output aria-label="Result so far">{step.phase === 'fail' ? 'a pair shares a parity' : step.phase === 'done' ? 'special' : 'checking'}</output>
  </>} renderReasoning={() => <>
    <p>An array is special when no two neighbors share a parity. The sum of two neighbors is even exactly when they share a parity.</p>
  </>} />
}
