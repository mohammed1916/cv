import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1942',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with times ([arrival, leaving] pairs) and targetFriend (an index)',
  url: 'https://leetcode.com/problems/the-number-of-the-smallest-unoccupied-chair/',
  complexity: 'O(n log n) for the sorted events and a sorted free list; the visualization keeps the list small.',
  examples: [
    { label: 'Target friend 1', input: '{"times":[[1,4],[2,3],[4,6]],"targetFriend":1}' },
    { label: 'Reuse at the same moment', input: '{"times":[[1,2],[2,4],[3,5]],"targetFriend":2}' },
    { label: 'Two friends', input: '{"times":[[1,2],[3,4]],"targetFriend":0}' },
    { label: 'Leaves as another arrives', input: '{"times":[[1,3],[3,5]],"targetFriend":1}' },
    { label: 'Long run: eight friends', input: '{"times":[[1,9],[2,7],[3,9],[4,7],[5,9],[6,7],[7,9],[8,15]],"targetFriend":3}' },
  ],
}

export default function Problem1942Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const maxChair = Math.max(-1, ...Object.keys(step.occupied).map(Number), ...Object.values(step.chairOf))
      const chairs = Array.from({ length: maxChair + 2 }, (_, i) => i)
      return <>
        <div aria-label="Chairs" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {chairs.map(c => {
            const who = step.occupied[c]
            return <div key={c} style={{ width: 56, textAlign: 'center', padding: '6px 4px', borderRadius: 6, border: c === step.chosen ? '2px solid var(--primary)' : '1px solid var(--border)', background: who !== undefined ? 'color-mix(in srgb, var(--success, #16a34a) 18%, var(--surface2))' : 'var(--surface2)' }}>
              <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>chair {c}</div>
              <strong>{who !== undefined ? `friend ${who}` : 'free'}</strong>
            </div>
          })}
        </div>
        <p>Event at time {step.event ? step.event.time : '-'}: {step.event ? (step.event.kind === 1 ? 'arrival' : 'departure') : ''} of friend {step.event ? step.event.friend : '-'}. Target friend: {run.input.targetFriend}.</p>
        {step.result !== null && <output aria-label="Chair">Target sits on chair {step.result}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
