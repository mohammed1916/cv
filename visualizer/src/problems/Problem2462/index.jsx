import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pools', description: 'Split the workers into a front pool and a back pool of candidates.' },
    { id: 'hire', label: 'Hire', description: 'Hire the cheaper candidate, then refill the pool it came from.' },
    { id: 'done', label: 'Complete', description: 'Report the total cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"costs": [...], "k": hires, "candidates": pool size}',
  url: 'https://leetcode.com/problems/total-cost-to-hire-k-workers/',
  complexity: 'O(k log c) time with two heaps of candidates, where c is the pool size. The visualization caps input at 10 workers.',
  examples: [
    { label: 'Example 1', input: '{"costs":[17,12,10,2,7,2,11,20,8],"k":3,"candidates":4}' },
    { label: 'Example 2', input: '{"costs":[1,2,4,1],"k":3,"candidates":3}' },
  ],
}

export default function TotalCostToHire() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const costs = run.input.costs
    return <>
      <IndexedSequence label="Worker costs" length={costs.length} valueAt={i => costs[i]} active={step.picked}
        roleAt={i => (step.hired.includes(i) ? 'hired' : step.front.includes(i) || step.back.includes(i) ? 'candidate' : '')} />
      <output aria-label="Total cost">{`Total cost so far: ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only the first and last few workers can be hired next, so two pools of candidates are enough. Each pool is a heap ordered by cost, then by index.</p>
    <p>After a hire, the pool that lost a worker takes the next unassigned worker from its side, so every pool keeps its size.</p>
  </>} />
}
