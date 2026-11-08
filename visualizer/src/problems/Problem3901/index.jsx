import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no queries answered.' },
    { id: 'update', label: 'Update', description: 'Apply the query to the array.' },
    { id: 'element', label: 'Extend table', description: 'Combine this multiple of p with every gcd found so far.' },
    { id: 'check', label: 'Check', description: 'Look for gcd p with a subset smaller than the whole array.' },
    { id: 'done', label: 'Return', description: 'Report how many queries succeeded.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"nums": [...], "p": p, "queries": [[index, value], ...]}',
  url: 'https://leetcode.com/problems/good-subsequence-queries/',
  complexity: 'Each query costs O(n times the number of distinct gcd values). The visualization caps n at 8.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[5,9,13,17],"p":3,"queries":[[1,4],[3,7]]}' },
    { label: 'Own case 2', input: '{"nums":[5,6,8,9],"p":4,"queries":[[1,7],[2,10],[3,4]]}' },
    { label: 'Smallest pair', input: '{"nums":[1,1],"p":1,"queries":[[0,1]]}' },
    { label: 'Equal values', input: '{"nums":[6,6,6,6],"p":2,"queries":[[1,6]]}' },
    { label: 'Extreme values, p at limit', input: '{"nums":[60,1,60,1,60,1,60,1],"p":30,"queries":[[0,60],[7,1],[3,30]]}' },
    { label: 'Long run: 8 values, 10 queries', input: '{"nums":[7,12,5,39,46,59,37,32],"p":7,"queries":[[3,18],[7,52],[4,11],[5,2],[0,52],[4,46],[6,44],[2,48],[0,28],[3,26]]}' },
  ],
}

export default function GoodSubsequenceQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const roles = {}
    if (step.index !== undefined) roles[step.index] = 'updated'
    return <>
      <IndexedSequence label="Current array" length={step.values.length} valueAt={j => step.values[j]} active={step.index ?? -1} roleAt={j => roles[j] ?? ''} />
      <output aria-label="Gcd table">{step.best.length ? `Smallest subset size per gcd: ${step.best.map(([g, s]) => `${g}:${s}`).join(', ')}` : 'No table yet.'}</output>
      <output aria-label="Count">{`Queries that succeed so far: ${step.count}. ${step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only multiples of p can take part in a subset whose gcd is p, so other values are skipped.</p>
    <p>For each gcd value, keeping the smallest subset size is enough, because a smaller subset is always allowed when size is the only other condition.</p>
  </>} />
}
