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
    { label: 'Own case 1', input: '{"costs":[8,20,11,2,7,2,10,12,17],"k":3,"candidates":4}' },
    { label: 'Own case 2', input: '{"costs":[2,3,5,2],"k":4,"candidates":4}' },
    { label: 'Single worker', input: '{"costs":[5],"k":1,"candidates":1}' },
    { label: 'Equal costs', input: '{"costs":[4,4,4,4],"k":2,"candidates":2}' },
    { label: 'Largest values', input: '{"costs":[20,1,20,1,20,1,20,1,20,1],"k":5,"candidates":3}' },
    { label: 'Long run: 10 workers', input: '{"costs":[20,4,15,1,6,12,19,4,7,7],"k":6,"candidates":5}' },
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
