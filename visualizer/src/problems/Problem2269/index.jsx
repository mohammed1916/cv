import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digits', description: 'Read the digits of num and set the window length k.' },
    { id: 'window', label: 'Window', description: 'Read k consecutive digits as a number and test whether num is divisible by it.' },
    { id: 'done', label: 'Complete', description: 'Report how many windows divide num.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with num (1 to 1000000000) and k, for example {"num":240,"k":2}',
  url: 'https://leetcode.com/problems/find-the-k-beauty-of-a-number/',
  complexity: 'O(d * k) time for d digits, which is constant for a bounded number. The visualization caps num at 10 digits.',
  examples: [
    { label: 'Example 1', input: '{"num":240,"k":2}' },
    { label: 'Zero window', input: '{"num":100,"k":2}' },
  ],
}

export default function KBeautyOfNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of num" length={String(run.input.num).length} valueAt={index => String(run.input.num)[index]} active={step.left}
      roleAt={index => (step.right >= 0 && step.left <= index && index <= step.right ? 'window' : '')} />
    <output aria-label="Current window">{step.part === null ? `Divisor windows counted: ${step.beauty}` : `Window value ${step.part}: ${step.part === 0 ? 'zero, skipped' : step.divides ? 'divides num' : 'does not divide num'}. Beauty so far: ${step.beauty}`}</output>
  </>} renderReasoning={() => <>
    <p>Every k-digit substring of num is read as a number. It counts when it is nonzero and divides num exactly.</p>
    <p>Windows that start with zeros still read as their numeric value, so a window like 04 is the value 4.</p>
  </>} />
}
