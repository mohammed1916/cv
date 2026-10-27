import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Interleave', description: 'Start with the factorial of the healthy count.' },
    { id: 'gap', label: 'Gap', description: 'Correct for each run of healthy children.' },
    { id: 'done', label: 'Complete', description: 'Report the number of infection orders.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and a strictly increasing sick array (JSON)',
  url: 'https://leetcode.com/problems/count-the-number-of-infection-sequences/',
  complexity: 'O(n log MOD) time for the modular inverses. The visualization caps n at 10.',
  examples: [
    { label: 'Example 1', input: '{"n":4,"sick":[1]}' },
    { label: 'Two ends', input: '{"n":5,"sick":[0,4]}' },
  ],
}

export default function InfectionSequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Healthy runs (left end, between sick children, right end)" length={run.gaps.length}
      valueAt={i => run.gaps[i].length} active={Math.max(0, step.gap)}
      roleAt={i => (run.gaps[i].between ? 'between sick' : 'at an end')} />
    <output aria-label="Running count">{`Running count: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Infection spreads outward from each sick child, so the healthy children form runs. The orders interleave the runs, which gives a multinomial.</p>
    <p>A run between two sick children can be filled from either end, so each such run adds a factor of two except for its first child.</p>
  </>} />
}
