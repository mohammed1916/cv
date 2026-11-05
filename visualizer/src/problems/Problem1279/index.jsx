import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1279',
  phases: [
    { id: 'start', label: 'Start', description: 'Road 1 has the green light.' },
    { id: 'switch', label: 'Switch', description: 'The green light moves to the car road.' },
    { id: 'cross', label: 'Cross', description: 'The car crosses on its green road.' },
    { id: 'done', label: 'Result', description: 'Report the crossing log.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arrivals: [carId, roadId, direction] triples',
  url: 'https://leetcode.com/problems/traffic-light-controlled-intersection/',
  complexity: 'O(1) per car. The concurrent version uses a lock so only one road holds the light at a time.',
  examples: [
    { label: 'Two roads', input: '{"arrivals":[[1,1,1],[2,1,2],[3,2,3],[4,2,4],[5,1,1]]}' },
  ],
}

export default function TrafficLightControlledIntersection() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { green, log, car } = step.state
    return <>
      <div aria-label="Light state" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[1, 2].map(road => <span key={road} style={{ padding: '6px 12px', border: `2px solid ${green === road ? 'var(--success)' : 'var(--border)'}`, background: green === road ? 'var(--surface2)' : 'transparent', color: 'var(--text)', fontFamily: 'monospace' }}>
          {road === 1 ? 'Road A (roadId 1)' : 'Road B (roadId 2)'}: {green === road ? 'green' : 'red'}
        </span>)}
      </div>
      <table aria-label="Arrival timeline" style={{ marginTop: 8, borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead><tr><th>Car</th><th>Road</th><th>Direction</th></tr></thead>
        <tbody>{run.input.arrivals.map(([id, road, direction]) => <tr key={id} aria-current={car && car.id === id ? 'step' : undefined}
          style={{ outline: car && car.id === id ? '2px solid var(--primary)' : undefined }}>
          <td>{id}</td><td>{road}</td><td>{direction}</td>
        </tr>)}</tbody>
      </table>
      <ul aria-label="Crossing log">{log.map((line, index) => <li key={index} style={{ color: 'var(--text)' }}>{line}</li>)}</ul>
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only one road can be green at once. A car on the red road turns its road green first, and then crosses; cars on the green road cross without waiting.</p>
    <p>In a concurrent version this is a lock around the light, so two cars never cross on different roads at the same moment.</p>
  </>} />
}
