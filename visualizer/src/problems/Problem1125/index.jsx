import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'The empty set of skills is covered by an empty team.' },
    { id: 'map', label: 'Bits', description: 'Give each required skill a bit.' },
    { id: 'person', label: 'Person', description: 'Consider the next person and their skill mask.' },
    { id: 'update', label: 'Extend', description: 'Store a smaller team for a newly covered set.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest team covering every skill.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with req_skills and people (lists of skills, JSON)',
  url: 'https://leetcode.com/problems/smallest-sufficient-team/',
  complexity: 'O(people * 2^skills) time. The visualization caps input at 6 skills and 8 people.',
  examples: [
    { label: 'Example 1', input: '{"req_skills":["java","nodejs","reactjs"],"people":[["java"],["nodejs"],["nodejs","reactjs"]]}' },
    { label: 'Single expert', input: '{"req_skills":["a","b"],"people":[["a"],["a","b"],["b"]]}' },
  ],
}

export default function SmallestSufficientTeam() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Covered skill sets">
      <thead><tr><th>Covered set (bits)</th><th>Team size</th></tr></thead>
      <tbody>{step.teams.map(([mask, size]) => <tr key={mask} data-role={step.changed.includes(mask) ? 'active' : undefined}>
        <td>{mask.toString(2).padStart(run.input.req_skills.length, '0')}</td><td>{size}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Current person">{step.person === -1 ? 'No person in use' : `Person ${step.person}: ${run.input.people[step.person].join(', ') || 'no skills'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each required skill is one bit, so any set of skills is one number. For each set reached so far, the team is stored with the fewest people.</p>
    <p>Adding a person either reaches a new set or improves the team for an existing one. The answer is the stored team for the set that holds every skill.</p>
  </>} />
}
