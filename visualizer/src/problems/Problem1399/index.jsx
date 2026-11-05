import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples } from './algorithm'

const definition = {
  number: '1399', phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, examples,
  inputLabel: 'Object with n (JSON)',
  url: 'https://leetcode.com/problems/count-largest-group/',
  complexity: 'O(n log n) time over the digits, and O(1) extra space since the digit sums are at most 36 for n up to 10000.',
}

export default function LargestGroupVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <RecordStateTable label="Groups by digit sum" columns={['sum', 'size']} rows={s.rows} activeRow={s.rows.findIndex(r => r.sum === s.current)} />
      <StackLane title="Largest group size so far" items={[String(s.largest)]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Group, then compare sizes:</strong> the digit sum is a small key, so a map from sum to count finds the largest group in one pass.</p>
    <p>{step.message}</p>
  </>} />
}
