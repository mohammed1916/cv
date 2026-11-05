import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1317', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Integer n (JSON object)',
  url: 'https://leetcode.com/problems/convert-integer-to-the-sum-of-two-no-zero-integers/',
  complexity: 'O(n log n) time in the worst case, since the digits of each candidate are checked, and O(1) extra space.',
}

export default function NoZeroSplitVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <StackLane title="Candidate split" items={s.a === null ? ['not chosen yet'] : [`${s.a} + ${s.b} = ${s.n}`]} note={s.ok === false ? 'rejected: contains 0' : s.ok ? 'accepted' : undefined} />
      <p>Target sum: <strong>{run.input}</strong></p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Try splits in order:</strong> a zero digit is the only thing that can break the rule, so the first split with no zero digit in either part is valid.</p>
    <p>{step.message}</p>
  </>} />
}
