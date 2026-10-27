import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import HeapView from '../../components/shared/HeapView'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Prepare to sort by ratio.' },
    { id: 'sort', label: 'Sort', description: 'Order workers by wage per unit of quality.' },
    { id: 'add', label: 'Add worker', description: 'Treat this worker as the highest-ratio member.' },
    { id: 'evict', label: 'Evict', description: 'Drop the largest quality when the group is too big.' },
    { id: 'cost', label: 'Price group', description: 'Cost of the group at the current ratio.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum cost.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object {quality, wage, k} (JSON, up to 30 workers)',
  url: 'https://leetcode.com/problems/minimum-cost-to-hire-k-workers/',
  complexity: 'O(n log n) for the sort plus O(n log k) heap work.',
  examples: [
    { label: 'Official example 1', input: '{"quality":[10,20,5],"wage":[70,50,30],"k":2}' },
    { label: 'Official example 2', input: '{"quality":[3,1,10,10,1],"wage":[4,8,2,2,7],"k":3}' },
    { label: 'Hire one', input: '{"quality":[4,5,6],"wage":[8,5,18],"k":1}' },
  ],
}

export default function MinimumCostToHireKWorkers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Workers sorted by wage / quality (value = ratio)" length={run.sorted.length} active={step.index}
      valueAt={i => (run.sorted[i].w / run.sorted[i].q).toFixed(2)}
      roleAt={i => i <= step.index ? (i === step.bestIdx ? 'written' : 'shifted') : ''} />
    <IndexedSequence label="Qualities (sorted order)" length={run.sorted.length} active={step.index} valueAt={i => run.sorted[i].q} />
    {step.heapState && <HeapView {...step.heapState} />}
    <output aria-label="Quality sum">Quality sum of the group = {step.sumQ ?? 0}</output>
    <output aria-label="Best cost">Best cost so far: {step.best === null || step.best === undefined ? 'none' : step.best.toFixed(5)}</output>
  </>} renderReasoning={({ step }) => <>
    <p>Quality sum of the group: {step.sumQ ?? 0}. {step.cost !== null && step.cost !== undefined && <>Group cost: {step.cost.toFixed(5)}.</>}</p>
    <p><strong>Key idea:</strong> if a group is paid at ratio r (the largest wage/quality among them), the cost is r times the quality sum, and every worker's minimum wage is met.</p>
    <p><strong>Greedy:</strong> process ratios in increasing order so the current worker sets r; among everyone seen, the cheapest group of k at that ratio minimises the quality sum, which a max-heap maintains.</p>
  </>} />
}
