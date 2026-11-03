import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitSquareView from './DigitSquareView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with both totals at zero.' },
    { id: 'digit', label: 'Digits', description: 'Add each digit to the squares and the digit sum.' },
    { id: 'done', label: 'Result', description: 'Compare the difference with fifty.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Positive integer n (e.g. 9999)',
  url: 'https://leetcode.com/problems/check-good-integer/',
  complexity: 'O(d) time and O(1) space for d decimal digits.',
  examples: [
    { label: 'Large digits', input: '9999' },
    { label: 'Small digits', input: '123' },
  ],
}

export default function CheckGoodInteger() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DigitSquareView run={run} step={step} />} renderReasoning={({ run, step }) => (
    <p>{step.message} {run ? `Result: ${run.result ? 'good' : 'not good'}.` : ''}</p>
  )} />
}
