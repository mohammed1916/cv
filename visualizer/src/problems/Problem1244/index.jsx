import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1244',
  phases: [
    { id: 'start', label: 'Empty', description: 'No players are on the board.' },
    { id: 'add', label: 'Add', description: 'Add points to a running total.' },
    { id: 'top', label: 'Top', description: 'Sort the totals and sum the largest k.' },
    { id: 'reset', label: 'Reset', description: 'Remove a player from the board.' },
    { id: 'done', label: 'Result', description: 'Report every top sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: ["add", id, score], ["top", k] or ["reset", id]',
  url: 'https://leetcode.com/problems/design-a-leaderboard/',
  complexity: 'O(1) per add or reset, and O(p log p) per top query for p players. The visualization caps the input at 20 operations.',
  examples: [
    { label: 'Example', input: '{"ops":[["add",1,30],["add",2,50],["add",3,10],["top",2],["add",3,60],["top",2],["reset",2],["top",1]]}' },
    { label: 'Top query on an empty board', input: '{\"ops\":[[\"top\",1]]}' },
    { label: 'Equal scores tie', input: '{\"ops\":[[\"add\",1,50],[\"add\",2,50],[\"top\",1]]}' },
    { label: 'Largest allowed score', input: '{\"ops\":[[\"add\",7,100],[\"top\",1],[\"reset\",7],[\"top\",1]]}' },
    { label: 'Long run: twenty mixed operations', input: '{\"ops\":[[\"reset\",1],[\"top\",3],[\"top\",3],[\"top\",2],[\"top\",1],[\"add\",4,83],[\"reset\",1],[\"top\",1],[\"add\",5,80],[\"add\",4,17],[\"top\",1],[\"reset\",3],[\"reset\",5],[\"add\",2,100],[\"reset\",4],[\"add\",3,19],[\"reset\",4],[\"reset\",3],[\"reset\",4],[\"add\",2,6]]}' },
  ],
}

// The trace stores each player as "player id: score" and each top query as "top k sum: total".
function readBoard(state) {
  const players = []
  let top = null
  for (const line of state) {
    const player = /^player (\d+): (\d+)$/.exec(line)
    if (player) players.push({ id: Number(player[1]), score: Number(player[2]) })
    const sum = /^top (\d+) sum: (\d+)$/.exec(line)
    if (sum) top = { k: Number(sum[1]), total: Number(sum[2]) }
  }
  players.sort((a, b) => b.score - a.score || a.id - b.id)
  return { players, top }
}

export default function DesignALeaderboard() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { players, top } = readBoard(step.state)
    const k = top ? top.k : 0
    return <>
      <table aria-label="Leaderboard, highest first" style={{ borderCollapse: 'collapse', minWidth: 260 }}>
        <thead><tr><th scope="col" style={{ textAlign: 'left', padding: '4px 10px' }}>Rank</th><th scope="col" style={{ textAlign: 'left', padding: '4px 10px' }}>Player</th><th scope="col" style={{ textAlign: 'right', padding: '4px 10px' }}>Score</th></tr></thead>
        <tbody>{players.length
          ? players.map((p, i) => <tr key={p.id} data-rank={i + 1} data-counted={i < k ? 'yes' : 'no'} style={{
            background: i < k ? 'color-mix(in srgb, var(--primary) 22%, transparent)' : 'transparent',
            color: 'var(--text)',
          }}>
            <td style={{ padding: '4px 10px' }}>{i + 1}</td>
            <td style={{ padding: '4px 10px' }}>{p.id}</td>
            <td style={{ padding: '4px 10px', textAlign: 'right', fontFamily: 'monospace' }}>{p.score}</td>
          </tr>)
          : <tr><td colSpan={3} style={{ padding: '4px 10px', color: 'var(--text-dim)' }}>No players yet</td></tr>}</tbody>
      </table>
      {top && <p>The top {top.k} scores add up to <strong>{top.total}</strong>. Shaded rows are the ones counted.</p>}
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each player keeps one running total, so an add never has to scan the board.</p>
    <p>Sorting is deferred until a top query asks for it, which keeps the cost of adds low. The shaded rows are the k largest totals.</p>
  </>} />
}
