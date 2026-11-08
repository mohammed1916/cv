import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import HeapView from '../../components/shared/HeapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Prepare to sort by ratio.' },
    { id: 'sort', label: 'Sort', description: 'Order workers by wage per unit of quality.' },
    { id: 'add', label: 'Add worker', description: 'Treat this worker as the highest-ratio member.' },
    { id: 'evict', label: 'Evict', description: 'Drop the largest quality when the group is too big.' },
    { id: 'cost', label: 'Price group', description: 'Cost of the group at the current ratio.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object {quality, wage, k} (JSON, up to 30 workers)',
  url: 'https://leetcode.com/problems/minimum-cost-to-hire-k-workers/',
  complexity: 'O(n log n) for the sort plus O(n log k) heap work.',
  examples: [
    { label: 'Own case 1', input: '{"quality":[11,21,6],"wage":[71,51,31],"k":3}' },
    { label: 'Own case 2', input: '{"quality":[4,2,11,11,2],"wage":[5,9,3,3,8],"k":4}' },
    { label: 'Hire one', input: '{"quality":[4,5,6],"wage":[8,5,18],"k":1}' },
    { label: 'Single worker', input: '{"quality":[1],"wage":[1],"k":1}' },
    { label: 'Equal wage per quality', input: '{"quality":[2,4],"wage":[2,4],"k":2}' },
    { label: 'Largest values, 30 workers', input: '{"quality":[10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000],"wage":[10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000],"k":30}' },
    { label: 'Long run: 30 workers, hire 12', input: '{"quality":[2509,6163,2209,3557,6470,5218,4321,3742,1128,8611,2472,202,6829,9469,3683,1980,3181,6978,3879,9182,7767,9745,9329,7896,7106,3162,4018,3023,1042,6276],"wage":[1319,847,1113,1681,698,4294,8274,1164,9146,6917,2206,6808,1019,5416,189,696,1245,3072,716,3742,6573,4372,2593,9380,6510,8268,3896,4156,309,1865],"k":12}' },
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
