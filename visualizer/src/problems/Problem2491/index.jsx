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
