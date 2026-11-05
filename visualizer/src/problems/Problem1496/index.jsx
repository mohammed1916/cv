import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1496', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with a path string (JSON)',
  url: 'https://leetcode.com/problems/path-crossing/',
  complexity: 'O(n) time and O(n) space for the set of visited positions.',
}

export default function PathCrossingVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <StackLane title="Path so far" items={[...run.input.slice(0, s.visited.length - 1)].map((c, i) => `${i + 1}. ${c}`)} />
      <StackLane title="Visited positions" items={s.visited.map(v => `(${v})`)} note={`now at (${s.x}, ${s.y})${s.crossed ? ' - crossing' : ''}`} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Remember every point:</strong> a set of visited coordinates answers "have we been here" in constant time per step.</p>
    <p>{step.message}</p>
  </>} />
}
