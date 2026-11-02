import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No best cost yet.' },
    { id: 'candidate', label: 'Candidate', description: 'Choose how many combined units to buy.' },
    { id: 'split', label: 'Split', description: 'Cover the rest with single-requirement units.' },
    { id: 'cost', label: 'Cost', description: 'Add up the total price of this split.' },
    { id: 'compare', label: 'Compare', description: 'Check against the best cost so far.' },
    { id: 'update', label: 'Update', description: 'This split is the new best.' },
    { id: 'done', label: 'Result', description: 'Report the minimum cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with cost1, cost2, costBoth, need1 and need2',
  url: 'https://leetcode.com/problems/minimum-cost-to-acquire-required-items/',
  complexity: 'O(1) time: only three candidate counts of combined units are tested.',
  examples: [
    { label: 'Example 1', input: '{"cost1":3,"cost2":2,"costBoth":1,"need1":3,"need2":2}' },
    { label: 'Example 2', input: '{"cost1":5,"cost2":4,"costBoth":15,"need1":2,"need2":3}' },
    { label: 'Zero needs', input: '{"cost1":5,"cost2":4,"costBoth":15,"need1":0,"need2":0}' },
  ],
}

export default function MinimumCostToAcquireRequiredItems() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Cost check">{`both = ${step.both >= 0 ? step.both : 'none'}, total = ${step.total ?? 'pending'}, best = ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each combined unit covers both requirements at once. Only a few counts of combined units can be optimal: 0, need1 or need2.</p>
    <p>For a fixed count, the rest of each need is bought with its single-requirement unit, so the cost is a direct sum.</p>
  </>} />
}
