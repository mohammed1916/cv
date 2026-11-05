import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { code, python, pythonLineMap, parseInput, buildTrace, phases, examples } from './algorithm'

const definition = {
  number: '1590', phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, examples,
  inputLabel: 'Object with nums and p (JSON)',
  url: 'https://leetcode.com/problems/make-sum-divisible-by-p/',
  complexity: 'O(n) time with a map of prefix remainders, and O(min(n, p)) extra space.',
}

export default function SumDivisibleVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const rows = run.input.nums.slice(0, (s.r ?? -1) + 1).map((v, i) => ({ position: i, value: v }))
    return <>
      <IndexedSequence label={`Array (sum mod ${s.p} must become ${0})`} length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={s.r ?? -1}
        roleAt={i => (s.l !== undefined && i === s.l ? 'l' : s.r !== undefined && i === s.r ? 'r' : (s.l !== undefined && i > s.l && i < s.r ? 'removed' : ''))} />
      <RecordStateTable label="Positions scanned" columns={['position', 'value']} rows={rows} activeRow={s.r ?? -1} />
      <p>Total remainder to remove: <strong>{s.total}</strong>. Shortest removal so far: <strong>{s.best === run.input.nums.length ? 'none yet' : s.best}</strong>.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Prefix remainders:</strong> a subarray removal fixes the total when its remainder equals the total remainder, so a map from earlier prefix remainders finds the shortest one.</p>
    <p>{step.message}</p>
  </>} />
}
