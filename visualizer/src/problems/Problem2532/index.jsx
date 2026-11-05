import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, STATE_TEXT } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'All workers wait on the left; the boxes wait on the right.' },
    { id: 'bridgeRight', label: 'Cross right', description: 'The least efficient free worker takes the bridge to the right.' },
    { id: 'bridgeLeft', label: 'Cross left', description: 'A worker carrying a box takes the bridge back to the left.' },
    { id: 'arrive', label: 'Deliver', description: 'A box reaches the left side.' },
    { id: 'done', label: 'Result', description: 'The last box has reached the left side.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": 3, "k": 2, "time": [[1,1,1,1],[2,1,2,1]]}',
  url: 'https://leetcode.com/problems/time-to-cross-a-bridge/',
  complexity: 'Each event moves time forward to a finishing step, so the simulation runs in O(n k log k) with heaps. The visualization caps n at 6 and k at 4.',
  examples: [
    { label: 'One box, two workers', input: '{"n":1,"k":2,"time":[[1,2,3,1],[2,1,1,2]]}' },
    { label: 'Two boxes, two workers', input: '{"n":2,"k":2,"time":[[2,1,3,2],[1,2,1,1]]}' },
  ],
}

export default function TimeToCrossBridge() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section aria-label="Bridge" style={{ marginBottom: 12 }}>
      <h3 style={{ color: 'var(--text)' }}>Bridge</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
        <span>Left: {step.delivered} delivered, {step.boxesLeft} unclaimed</span>
        <span style={{ flex: 1, height: 10, borderRadius: 5, background: step.bridgeWorker >= 0 ? 'var(--primary)' : 'var(--surface2)' }} />
        <span>Right: {run.input.n - step.delivered - step.boxesLeft} boxes in transit</span>
      </div>
      <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
    </section>
    <RecordStateTable label={`Workers at minute ${step.now}`} columns={['worker', 'state', 'until', 'time']}
      rows={run.input.time.map((t, i) => ({ worker: i, state: STATE_TEXT[step.status[i]], until: step.status[i] === 'left' || step.status[i] === 'ready' ? '-' : step.until[i], time: `${t[0]}/${t[1]}/${t[2]}/${t[3]}` }))}
      activeRow={step.bridgeWorker} />
    <output aria-label="Elapsed minutes">{step.result === null ? `Minute ${step.now}` : `Answer ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>The bridge serves one worker at a time. When it is free, a worker who already holds a box on the right crosses first; only if none does, a worker from the left crosses, and only while boxes remain unclaimed.</p>
    <p>Among the workers allowed to cross, the least efficient one goes: the largest total of crossing times, with ties going to the higher index.</p>
  </>} />
}
