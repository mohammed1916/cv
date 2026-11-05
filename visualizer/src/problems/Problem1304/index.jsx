import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1304', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Count n (JSON object)',
  url: 'https://leetcode.com/problems/find-n-unique-integers-sum-up-to-zero/',
  complexity: 'O(n) time and O(n) space for the answer.',
}

export default function ZeroSumVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="Answer slots" length={run.input}
        valueAt={i => (i < s.answer.length ? s.answer[i] : '·')} active={s.answer.length - 1}
        roleAt={i => (i < s.answer.length ? '' : 'empty')} />
      <StackLane title="Running total" items={[String(s.sum)]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Pairs cancel:</strong> i and -i sum to zero, and using distinct positive i gives distinct values.</p>
    <p><strong>Odd count:</strong> a single 0 fills the leftover slot.</p>
    <p>{step.message}</p>
  </>} />
}
