import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3661',
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the robots left to right.' },
    { id: 'first', label: 'First robot', description: 'Its bullets cover walls with no neighbour in the way.' },
    { id: 'step', label: 'Next robot', description: 'Try both directions and remove any double-counted overlap.' },
    { id: 'done', label: 'Result', description: 'Report the best total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with robots, distance and walls (positions and reaches)',
  url: 'https://leetcode.com/problems/maximum-walls-destroyed-by-robots/',
  complexity: 'Sorting plus a two-state DP over the robots. Each interval count scans the walls in this teaching version.',
  examples: [
    { label: 'Three robots', input: '{"robots":[6,15,20],"distance":[4,3,2],"walls":[3,5,9,18,21,22]}' },
    { label: 'Blocked shot', input: '{"robots":[1,2],"distance":[100,1],"walls":[10]}' },
  ],
}

export default function MaximumWallsDestroyedByRobots() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section className="algorithm-sequence" aria-label="Robot ranges">
      <h3>Robots from left to right</h3>
      <table>
        <thead><tr><th scope="col">Robot</th><th scope="col">Position</th><th scope="col">Left bullet</th><th scope="col">Right bullet</th></tr></thead>
        <tbody>{run.positions.map((p, i) => <tr key={i} data-current={step.robot === i}>
          <th scope="row">{i + 1}</th><td>{p}</td>
          <td>{step.robot === i ? step.ranges[0] : '-'}</td>
          <td>{step.robot === i ? step.ranges[1] : '-'}</td>
        </tr>)}</tbody>
      </table>
    </section>
    {step.options.length > 0 && <ul aria-label="Options for this robot">{step.options.map(o => <li key={o.side}>
      {o.side === 0 ? 'Fire left' : 'Fire right'} over {o.range} covers {o.walls} walls: {o.choices.map(c => `after ${c.prevSide === 0 ? 'left' : 'right'} ${c.value}${c.overlap ? ` (overlap ${c.overlap})` : ''}`).join(', ')}
    </li>)}</ul>}
    <output aria-label="Best totals">Best ending left: {step.best[0]}, ending right: {step.best[1]}{step.result !== null ? ` · Answer ${step.result}` : ''}</output>
  </>} renderReasoning={() => <>
    <p>A bullet is stopped by the nearest robot on its side, so each robot's reach depends only on its neighbours' positions.</p>
    <p>Two neighbouring bullets can overlap only between their two robots. Subtracting that overlap keeps every wall counted once.</p>
  </>} />
}
