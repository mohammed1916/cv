import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pairs', description: 'List every ordered home and away pair.' },
    { id: 'place', label: 'Place', description: 'Put the next pair on the next day.' },
    { id: 'skip', label: 'Skip', description: 'This pair shares a team with yesterday.' },
    { id: 'backtrack', label: 'Undo', description: 'The branch is a dead end; remove the last pair.' },
    { id: 'found', label: 'Complete', description: 'Every ordered pair is placed.' },
    { id: 'done', label: 'Result', description: 'Return the schedule or an empty list.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (teams, 2 to 4 in this visual)',
  url: 'https://leetcode.com/problems/generate-schedule/',
  complexity: 'Backtracking over n(n-1) ordered pairs. The visualization caps n at 4.',
  examples: [
    { label: 'Three teams', input: '{"n":3}' },
    { label: 'Four teams', input: '{"n":4}' },
  ],
}

export default function GenerateSchedule() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Days" length={step.slots.length} valueAt={i => step.slots[i]} active={step.at >= 0 ? step.at : -1}
      roleAt={i => (i < step.at + 1 && step.slots[i] !== '·' ? 'placed' : '')} />
    <output aria-label="Schedule status">{`${run.input.n} teams, ${step.slots.filter(slot => slot !== '·').length} of ${step.slots.length} matches placed, ${step.ok === false ? 'backtracking' : step.ok ? 'complete' : 'searching'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every pair of distinct teams gives two fixtures, one with each side hosting. Counting them all leaves n(n-1) fixtures to fit onto days.</p>
    <p>Place one pair per day. If the pair shares a team with the previous day, skip it. When no pair fits, undo the last placement and try another.</p>
  </>} />
}
