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
    { label: 'Example 1', input: '{"nums":[4,8,12,16],"p":2,"queries":[[0,3],[2,6]]}' },
    { label: 'Example 2', input: '{"nums":[4,5,7,8],"p":3,"queries":[[0,6],[1,9],[2,3]]}' },
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
