import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count admirers and queue the people nobody names.' },
    { id: 'peel', label: 'Peel', description: 'Remove people and pass their chain depth to their favorite.' },
    { id: 'cycle', label: 'Cycle', description: 'Walk each remaining cycle.' },
    { id: 'pair', label: 'Score', description: 'Add two-person cycles, or keep the longest longer cycle.' },
    { id: 'done', label: 'Complete', description: 'Report the largest group that can be seated.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with favorite (one favorite per employee, JSON)',
  url: 'https://leetcode.com/problems/maximum-employees-to-be-invited-to-a-meeting/',
  complexity: 'O(n) time and space. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"favorite":[2,2,1,2]}' },
    { label: 'Two pairs', input: '{"favorite":[1,0,3,2,0,2]}' },
  ],
}

export default function MaximumEmployees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Favorite of each employee" length={run.input.favorite.length} valueAt={i => `→ ${run.input.favorite[i]}`}
      active={step.current} roleAt={i => (step.removed[i] ? 'removed' : 'in cycle')} />
    <IndexedSequence label="Chain depth" length={step.depth.length} valueAt={i => step.depth[i]} />
    <output aria-label="Pairs and longest cycle">{`Pair total ${step.pairTotal}, longest cycle ${step.longest}`}</output>
  </>} renderReasoning={() => <>
    <p>Each employee has one favorite, so the favorites form cycles with chains hanging off them. Chains that point into nobody are peeled off first, and their lengths are remembered.</p>
    <p>A cycle longer than two can seat only its own members. Every two-person cycle can sit side by side with its chains, so those are added together.</p>
  </>} />
}
