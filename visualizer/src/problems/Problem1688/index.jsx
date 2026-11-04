import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1688',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Number of teams',
  url: 'https://leetcode.com/problems/count-of-matches-in-tournament/',
  complexity: 'O(log n) rounds, each O(1), so O(log n) time overall. The simulation could also be replaced by n - 1 directly.',
  examples: [
    { label: 'Nine teams', input: '9' },
    { label: 'Twenty teams', input: '20' },
    { label: 'Single team', input: '1' },
  ],
}

// Teams drawn in pairs: each bracket is one match, and an odd team out waits with a bye.
function Bracket({ teams, bye, pairs }) {
  const groups = Array.from({ length: pairs }, (_, k) => k)
  return <div role="img" aria-label={`${teams} teams this round`} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
    {groups.map(k => <span key={k} style={{ display: 'inline-flex', gap: 3, padding: '4px 6px', borderRadius: 8, border: '1px solid var(--primary)' }}>
      <span style={{ width: 12, height: 22, borderRadius: 3, background: 'var(--primary)' }} />
      <span style={{ width: 12, height: 22, borderRadius: 3, background: 'var(--primary)' }} />
    </span>)}
    {bye && <span style={{ padding: '4px 8px', borderRadius: 8, border: '1px dashed var(--text)', fontFamily: 'monospace', fontSize: 13 }}>bye</span>}
  </div>
}

export default function CountOfMatches() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { teams, matches, round, pairs, bye } = step.snapshot
    return <>
      {round > 0 && pairs > 0 && <Bracket teams={teams} bye={bye} pairs={pairs} />}
      {(round === 0 || pairs === 0) && <p>{teams > 1 ? 'Teams enter the first round.' : 'One team is left: the tournament is over.'}</p>}
      <p style={{ marginTop: 12 }}>Teams left: <strong>{teams}</strong> · Round: {round} · Matches so far: <strong>{matches}</strong>{pairs ? ` · Matches this round: ${pairs}` : ''}</p>
      <p style={{ color: 'var(--text-muted, var(--text))' }}>Every match removes exactly one team, so the matches played are the starting teams minus one.</p>
    </>
  }} renderReasoning={({ run }) => <>
    <p><strong>Key idea:</strong> each match removes exactly one team, so every tournament needs one fewer match than it has teams.</p>
    <p><strong>Simulation check:</strong> the round-by-round count with byes reaches the same total for {run.input} teams.</p>
  </>} />
}
