import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { Sequence } from './SeqKit'

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
    { label: 'Example 1', input: '{"req_skills":["go","rust","sql"],"people":[["go"],["rust","sql"],["sql"]]}' },
    { label: 'Single expert', input: '{"req_skills":["a","b"],"people":[["a"],["a","b"],["b"]]}' },
    { label: 'Single skill', input: '{"req_skills":["x"],"people":[["x"]]}' },
    { label: 'Every person needed', input: '{"req_skills":["a","b","c"],"people":[["a"],["b"],["c"]]}' },
    { label: 'Long run: 6 skills, 8 people', input: '{"req_skills":["a","b","c","d","e","f"],"people":[["a","b"],["c"],["d","e"],["f"],["a","c","e"],["b","d"],["f","a"],["c","d","e","f"]]}' },
  ],
}

export default function SmallestTeamVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const skills = run.input.req_skills
    const people = run.input.people
    const names = mask => skills.filter((_, i) => mask & (1 << i)).join(', ') || '(none)'
    const rows = step.teams.map(([mask, size]) => ({ covered: names(mask), 'team size': size, 'new this person': step.changed.includes(mask) ? 'yes' : 'no' }))
    return <>
      <Sequence label="Skills (bit order)" values={skills} />
      <Sequence label="People (current person marked)" values={people.map(p => p.join(' + ') || '(none)')} pointers={step.person >= 0 ? { person: step.person } : {}} />
      <RecordStateTable label="Smallest team found for each covered set" columns={['covered', 'team size', 'new this person']} rows={rows} />
      <output aria-label="Result">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Bitmask of skills:</strong> each covered set is a number whose bits are the skills it contains.</p>
    <p><strong>Keep the smallest team per set:</strong> adding a person to every known set produces new sets; the smallest team for each set is kept.</p>
  </>} />
}
