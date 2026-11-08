import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1916',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON prevRoom array, prevRoom[0] = -1 (e.g. [-1,0,0,1,1])',
  url: 'https://leetcode.com/problems/count-ways-to-build-rooms-in-an-ant-colony/',
  complexity: 'O(n) time for the subtree sizes and O(n log MOD) for the modular inverses. The visualization caps n at 12.',
  examples: [
    { label: 'Five rooms', input: '[-1,0,0,1,1]' },
    { label: 'Chain', input: '[-1,0,1,2]' },
    { label: 'Single room', input: '[-1]' },
    { label: 'Siblings share a parent', input: '[-1,0,0,0]' },
    { label: 'Chain of twelve rooms', input: '[-1,0,1,2,3,4,5,6,7,8,9,10]' },
    { label: 'Long run: 12 rooms, random parents', input: '[-1,0,0,1,0,1,0,4,4,3,6,6]' },
  ],
}

export default function Problem1916Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const roles = {}
      if (step.room !== null && step.room >= 0) roles[step.room] = 'focus'
      return <>
        <RootedTreeDiagram root={run.tree} roles={roles} title="Rooms as a tree (room numbers in the circles)" />
        <table aria-label="Prerequisite map" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th>Room</th><th>Prerequisite</th><th>Subtree size</th></tr></thead>
          <tbody>{step.map.map(({ room, prereq }) => <tr key={room} style={{ background: step.room === room ? 'color-mix(in srgb, var(--primary) 18%, transparent)' : 'transparent' }}>
            <td>{room}</td><td>{prereq < 0 ? 'none (start)' : prereq}</td><td>{step.size[room]}</td>
          </tr>)}</tbody>
        </table>
        {step.factor !== null && <p>Dividing by {step.factor}.</p>}
        {step.result !== null && <output aria-label="Build orders">Build orders (mod 1000000007): {step.result}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
