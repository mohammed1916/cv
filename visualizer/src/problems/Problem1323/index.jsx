import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1323', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with num made of 6 and 9 digits (JSON)',
  url: 'https://leetcode.com/problems/maximum-69-number/',
  complexity: 'O(d) time for the d digits, and O(d) extra space for the digit list.',
}

export default function SixToNineVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const digits = String(run.input.num).split('')
    return <IndexedSequence label="Digits of num" length={digits.length} valueAt={i => s.digits[i]} active={s.index}
      roleAt={i => (i === s.changedAt ? 'changed to 9' : '')} />
  }} renderReasoning={({ step }) => <>
    <p><strong>Leftmost 6 wins:</strong> the leftmost digit carries the largest place value, so changing the first 6 to 9 gives the biggest result.</p>
    <p>{step.message}</p>
  </>} />
}
