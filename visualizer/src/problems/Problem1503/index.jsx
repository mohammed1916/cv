import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1503', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with length, left and right (JSON)',
  url: 'https://leetcode.com/problems/last-moment-before-all-ants-fall-out-of-a-plank/',
  complexity: 'O(n) time for the ants and O(1) extra space.',
}

export default function PlankAntsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const n = run.input.length
    const marks = Array.from({ length: n + 1 }, (_, i) => i)
    const valueAt = i => (run.input.left.includes(i) ? '←' : run.input.right.includes(i) ? '→' : '·')
    return <>
      <IndexedSequence label={`Plank positions 0 to ${n} (← walks left, → walks right)`} length={marks.length} valueAt={valueAt}
        active={s.current ?? -1} roleAt={i => (s.current === i ? (s.side === 'left' ? 'left ant' : 'right ant') : '')} />
      <StackLane title="Slowest time so far" items={[String(s.answer)]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Ants pass through:</strong> collisions only swap labels, so the time is decided by the ant that has the farthest to go in its direction.</p>
    <p>{step.message}</p>
  </>} />
}
