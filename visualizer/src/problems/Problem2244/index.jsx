import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2244',
  phases: [
    { id: 'count', label: 'Count', description: 'Count the tasks at each difficulty.' },
    { id: 'add', label: 'Rounds', description: 'Each group needs ceil(count / 3) rounds of two or three tasks.' },
    { id: 'stuck', label: 'Stuck', description: 'A difficulty with one task cannot be finished.' },
    { id: 'done', label: 'Result', description: 'Add the rounds for every difficulty.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"tasks": [2, 2, 3, 3, 2, 4, 4, 4, 4, 4]}',
  url: 'https://leetcode.com/problems/minimum-rounds-to-complete-all-tasks/',
  complexity: 'O(n) time and O(d) space for n tasks with d distinct difficulties.',
  examples: [
    { label: 'Mixed', input: '{"tasks":[5,5,6,6,6,8,8,8,8,8]}' },
    { label: 'Lone task', input: '{"tasks":[1,1,2]}' },
    { label: 'Single task', input: '{"tasks":[4]}' },
    { label: 'Equal difficulty', input: '{"tasks":[9,9,9,9]}' },
    { label: 'Long run: thirty tasks', input: '{"tasks":[3,7,1,9,4,4,8,2,6,5,1,9,3,7,2,8,6,4,5,9,1,3,7,2,8,6,4,5,9,1]}' },
  ],
}

export default function MinimumRounds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="tasks (input array)" length={run.input.tasks.length} valueAt={i => run.input.tasks[i]} roleAt={i => (step.groups[step.at] && step.groups[step.at].level === run.input.tasks[i] ? 'counting' : '')} />
    <table aria-label="Tasks by difficulty">
      <thead><tr><th scope="col">Difficulty</th><th scope="col">Tasks</th><th scope="col">Rounds</th></tr></thead>
      <tbody>{step.groups.map((g, i) => <tr key={g.level} data-current={step.at === i ? 'true' : undefined}
        style={{ background: step.at === i ? 'var(--surface2)' : undefined, color: 'var(--text)' }}>
        <td>{g.level}</td><td>{g.count}</td><td>{g.rounds === null ? 'impossible' : g.rounds}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Rounds so far">{step.rounds < 0 ? 'impossible' : `${step.rounds} rounds`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each round removes two or three tasks that share a difficulty, so a difficulty with count c needs the fewest rounds that cover c with 2s and 3s.</p>
    <p>ceil(c / 3) rounds is that minimum for c of at least 2. A count of one can never be covered, so the answer is -1.</p>
  </>} />
}
