import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1335', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with jobDifficulty and d (JSON)',
  url: 'https://leetcode.com/problems/minimum-difficulty-of-a-job-schedule/',
  complexity: 'O(d n^2) time and O(n) extra space with a rolling row; this page keeps the full table so each cell can be read.',
}

export default function JobScheduleVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <DPTable title="dp[day][jobs finished] (rows are days, columns are jobs done)" values={s.table}
        activeCell={s.cell ? { row: s.cell.row, column: s.cell.column } : null} rowLabels={s.table.map((_, r) => `day ${r}`)} />
      <p>Current day: <strong>{s.day}</strong>. Each cell takes the best earlier split plus the hardest job in its last block.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Split the jobs into blocks:</strong> the last day in a block works on the block's hardest job, so the cost of a block is its maximum.</p>
    <p>{step.message}</p>
  </>} />
}
