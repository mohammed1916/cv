import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the skills so the outside pairs are the extremes.' },
    { id: 'target', label: 'Team total', description: 'The smallest and largest players set the total every team must reach.' },
    { id: 'pair', label: 'Pair', description: 'Check the next outside pair and add its product.' },
    { id: 'fail', label: 'Mismatch', description: 'A pair misses the total, so equal teams are impossible.' },
    { id: 'done', label: 'Complete', description: 'Report the total chemistry.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with skill (JSON)',
  url: 'https://leetcode.com/problems/divide-players-into-teams-of-equal-skill/',
  complexity: 'O(n log n) time for sorting and O(n) for the pair checks. The visualization caps input at 30 players.',
  examples: [
    { label: 'Valid', input: '{"skill":[3,2,5,1,3,4]}' },
    { label: 'Impossible', input: '{"skill":[1,1,2,3]}' },
    { label: 'Two players', input: '{"skill":[1,5]}' },
    { label: 'All equal skill', input: '{"skill":[2,2,2,2]}' },
    { label: 'Largest roster, equal pairs', input: '{"skill":[1,100,2,99,3,98,4,97,5,96,6,95,7,94,8,93,9,92,10,91,11,90,12,89,13,88,14,87,15,86]}' },
    { label: 'Long run: 30 players', input: '{"skill":[5,34,28,4,16,44,55,47,41,46,85,12,54,97,89,58,73,39,99,62,2,99,96,60,2,43,67,64,57,37]}' },
  ],
}

export default function EqualSkillTeams() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Sorted skills" length={step.values.length} valueAt={i => step.values[i]}
      active={step.left} roleAt={i => (i === step.right ? 'right' : '')} />
    <output aria-label="Team total">{`Team total: ${step.total ?? 'not set'}, chemistry: ${step.chemistry}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Sorting puts the weakest and strongest players on the outside, so every valid team total must equal their sum.</p>
  </>} />
}
