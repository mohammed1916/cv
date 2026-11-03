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

export default function CountOfMatches() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { teams, matches, round, pairs, bye } = step.snapshot
    return <>
      <div role="img" aria-label="Teams remaining" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 420 }}>
        {Array.from({ length: teams }, (_, i) => <span key={i} style={{ width: 14, height: 14, background: bye && i === teams - 1 ? '#f59e0b' : '#0891b2', display: 'inline-block' }} />)}
      </div>
      <p>Teams left: {teams} · Round: {round} · Matches so far: {matches}{pairs ? ` · Matches this round: ${pairs}` : ''}</p>
    </>
  }} renderReasoning={({ run }) => <>
    <p><strong>Key idea:</strong> each match removes exactly one team, so every tournament needs one fewer match than it has teams.</p>
    <p><strong>Simulation check:</strong> the round-by-round count with byes reaches the same total for {run.input} teams.</p>
  </>} />
}
