import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pairs', description: 'Every two positions start a subsequence of length two.' },
    { id: 'pair', label: 'Extend pair', description: 'Extend the pair by a third value whose difference is strictly smaller.' },
    { id: 'done', label: 'Complete', description: 'Report the longest valid subsequence.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON array of integers)',
  url: 'https://leetcode.com/problems/longest-subsequence-with-decreasing-adjacent-difference/',
  complexity: 'O(n^3) time and O(n^2) space. The visualization caps nums at 7 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[16,6,3]}' },
    { label: 'Example 2', input: '{"nums":[5,1,4,2]}' },
  ],
}

export default function LongestDecreasingDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Longest length by the pair of positions (rows: earlier, columns: later)" values={step.table}
      rowLabels={run.input.nums.map((v, i) => `${i}:${v}`)} columnLabels={run.input.nums.map((v, i) => `${i}:${v}`)}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Result">{step.phase === 'done' ? `Answer: ${run.result}` : `Values ${run.input.nums.length}`}</output>
  </>} renderReasoning={() => <>
    <p>A subsequence works when its adjacent absolute differences shrink strictly from left to right.</p>
    <p>The table keeps the longest valid subsequence that ends with each pair of positions, so a new value only needs the pairs before it.</p>
  </>} />
}
