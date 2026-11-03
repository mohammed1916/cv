import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Players (JSON with scores and ages)',
  url: 'https://leetcode.com/problems/best-team-with-no-conflicts/',
  complexity: 'O(n²) time and O(n) space. The visualization accepts up to 12 players.',
  examples: [
    { label: 'Mixed ages', input: '{"scores":[9,2,8,6],"ages":[1,1,3,3]}' },
    { label: 'Rising', input: '{"scores":[1,3,5,10,15],"ages":[1,2,3,4,5]}' },
    { label: 'Ties', input: '{"scores":[7,7,7],"ages":[2,1,3]}' },
  ],
}

export default function BestTeamWithNoConflicts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Players in sorted order" length={run.input.scores.length}
      valueAt={i => `age ${run.input.ages[step.order[i]]} · score ${run.input.scores[step.order[i]]}`}
      active={step.current}
      roleAt={i => (step.team?.includes(step.order[i]) ? 'team' : i === step.candidate ? 'candidate' : '')} />
    <DPTable title="Best team ending at each player" values={[step.best.map(v => v ?? '·')]} rowLabels={['best']}
      columnLabels={step.order.map(p => `p${p + 1}`)}
      activeCell={step.current >= 0 ? { row: 0, column: step.current } : null}
      relatedCells={step.candidate >= 0 ? [{ row: 0, column: step.candidate }] : []} />
  </>} renderReasoning={({ step }) => <>
    <p>Sorting by age, then score, means a team is a subsequence of this order, so each player only needs the best team that ends at an earlier player.</p>
    <p>A younger player can join an older one only when the younger score does not exceed the older score. Players of the same age never conflict, which is why equal ages are sorted by score.</p>
    {step.team && <p>Team members in this run: players {step.team.map(p => p + 1).join(', ')}.</p>}
  </>} />
}
