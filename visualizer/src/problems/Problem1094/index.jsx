import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1094',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with capacity and trips, each trip [passengers, start, end]',
  url: 'https://leetcode.com/problems/car-pooling/',
  complexity: 'O(t + S) time for t trips and S stops, here at most 21 stops. Extra space is O(S).',
  examples: [
    { label: 'Fits with room', input: '{"capacity":4,"trips":[[2,0,3],[2,3,6],[1,1,5]]}' },
    { label: 'Over capacity', input: '{"capacity":2,"trips":[[2,0,3],[2,3,6],[1,1,5]]}' },
    { label: 'Exact fill', input: '{"capacity":2,"trips":[[2,0,4]]}' },
  ],
}

export default function CarPooling() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { capacity, delta, load, stop } = step.state
    return <div>
      <div role="img" aria-label="Load by stop" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, fontFamily: 'monospace', fontSize: '.7rem' }}>
        {delta.map((change, index) => {
          const showLoad = step.phase === 'sweep' && index <= stop
          const bar = showLoad ? Math.max(0, load) : 0
          const over = showLoad && bar > capacity
          return <div key={index} data-stop={index} style={{ width: 18, textAlign: 'center' }}>
            <div style={{ height: `${Math.min(100, bar * 14)}px`, background: over ? '#dc2626' : 'var(--accent, #0891b2)', opacity: showLoad ? 1 : 0.2 }} />
            <div>{index}</div>
            <div>{change !== 0 ? (change > 0 ? `+${change}` : change) : ''}</div>
          </div>
        })}
      </div>
      <p aria-label="Capacity">{`Capacity ${capacity}${step.phase === 'sweep' ? ` · load ${load}` : ''}`}</p>
    </div>
  }} renderReasoning={() => <>
    <p><strong>Net changes:</strong> pickup and drop-off at the same stop are combined first, so a passenger leaving and another boarding at one stop are not counted twice.</p>
    <p><strong>Sweep:</strong> the running load is checked after each stop, which is the largest load possible there.</p>
  </>} />
}
