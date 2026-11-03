import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1535',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Distinct values and win target (JSON object)',
  url: 'https://leetcode.com/problems/find-the-winner-of-an-array-game/',
  complexity: 'O(n + k) time and O(n) space: the line is simulated duel by duel until one champion reaches k wins.',
  examples: [
    { label: 'Sample A', input: '{"arr":[1,4,2,3],"k":2}' },
    { label: 'Long streak', input: '{"arr":[5,1,3,2],"k":3}' },
    { label: 'First duel', input: '{"arr":[2,9,4],"k":1}' },
  ],
}

export default function ArrayGameWinner() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { champion, wins, k, queue, challenger } = step.snapshot
    return <>
      <div role="img" aria-label="Champion and challenger" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ padding: 10, border: '2px solid var(--text)', fontFamily: 'monospace', textAlign: 'center' }}>
          <div>Champion</div><strong style={{ fontSize: 22 }}>{champion}</strong><div>{wins} of {k} wins</div>
        </div>
        <div style={{ padding: 10, border: '1px dashed var(--border)', fontFamily: 'monospace', textAlign: 'center' }}>
          <div>Challenger</div><strong style={{ fontSize: 22 }}>{challenger ?? '-'}</strong>
        </div>
      </div>
      <p>Waiting line (front first):</p>
      <div role="img" aria-label="Waiting line" style={{ display: 'flex', gap: 6 }}>
        {queue.map((v, i) => <div key={i} style={{ minWidth: 36, textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', padding: 4 }}>{v}</div>)}
      </div>
    </>
  }} renderReasoning={() => <>
    <p><strong>Streak rule:</strong> the champion only needs wins in a row, so the simulation keeps a single streak counter instead of recording every duel.</p>
    <p><strong>Why it ends:</strong> the largest value never loses, so some champion always reaches k wins within a bounded number of duels.</p>
  </>} />
}
