import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No plates yet; every stack has the same capacity.' },
    { id: 'push', label: 'Push', description: 'Put the value on the lowest stack that has room.' },
    { id: 'pop', label: 'Pop', description: 'Take the top plate from the rightmost non-empty stack.' },
    { id: 'popAtStack', label: 'Pop at stack', description: 'Take the top plate from the given stack.' },
    { id: 'done', label: 'Complete', description: 'Every operation has been answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"capacity": n, "operations": [push | pop | popAtStack], "arguments": [...]}',
  url: 'https://leetcode.com/problems/dinner-plate-stacks/',
  complexity: 'O(log n) per push and popAtStack with a min heap of stacks that have room. The visualization caps input at 15 operations.',
  examples: [
    { label: 'Example', input: '{"capacity":2,"operations":["push","push","push","push","push","popAtStack","push","push","popAtStack","popAtStack","pop","pop","pop","pop","pop"],"arguments":[[1],[2],[3],[4],[5],[0],[20],[21],[0],[2],[],[],[],[],[]]}' },
  ],
}

export default function DinnerPlates() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Plate stacks">
      <thead><tr><th scope="col">Stack</th><th scope="col">Plates (bottom to top)</th></tr></thead>
      <tbody>{step.stacks.length === 0 ? <tr><td colSpan={2}>No stacks yet</td></tr> : step.stacks.map((s, i) => (
        <tr key={i} className={i === step.picked ? 'is-active' : undefined}><th scope="row">{i}</th><td>{s.length ? s.join(', ') : 'empty'}</td></tr>
      ))}</tbody>
    </table>
    <p>{step.message}</p>
    <p>{`Capacity per stack: ${run.input.capacity}.`}</p>
  </>} renderReasoning={() => <>
    <p>Pushes go to the lowest-numbered stack with room, so a min heap of non-full stack indices answers that in logarithmic time.</p>
    <p>Pops take from the rightmost non-empty stack, so trailing empty stacks are removed first.</p>
  </>} />
}
