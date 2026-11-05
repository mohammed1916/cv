import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1306', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Array and start index (JSON object)',
  url: 'https://leetcode.com/problems/jump-game-iii/',
  complexity: 'O(n) time and O(n) space, since each index is queued at most once.',
}

export default function JumpReachVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="Array (jump lengths)" length={run.input.arr.length} valueAt={i => run.input.arr[i]}
        active={s.current ?? -1}
        roleAt={i => (i === run.input.start ? 'start' : s.seen.includes(i) ? 'seen' : '')} />
      <StackLane title="Queue of indices to visit" items={s.queue.map(String)} note={s.found ? 'a zero is reachable' : undefined} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Breadth-first search:</strong> every index is a node and each jump is an edge, so a queue explores every reachable index once.</p>
    <p>{step.message}</p>
  </>} />
}
