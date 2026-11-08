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
    { label: "Single largest value", input: "[100]" },
    { label: "Equal values", input: "[1,1,1,1]" },
    { label: "Long run: 100 values", input: "[29, 6, 59, 48, 73, 26, 43, 16, 73, 66, 79, 76, 25, 94, 31, 20, 69, 50, 11, 100, 17, 98, 79, 92, 13, 22, 83, 16, 69, 26, 23, 84, 73, 2, 71, 96, 29, 66, 15, 56, 73, 58, 75, 52, 17, 50, 99, 64, 61, 14, 47, 84, 61, 50, 7, 68, 45, 78, 59, 24, 25, 66, 83, 12, 93, 38, 71, 32, 41, 6, 55, 76, 53, 30, 27, 68, 9, 58, 51, 40, 93, 70, 19, 28, 85, 66, 15, 72, 13, 6, 71, 56, 61, 34, 99, 76, 17, 94, 31, 16]" },
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
