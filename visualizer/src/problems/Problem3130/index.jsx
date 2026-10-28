import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'Both tables start with the empty prefix counted once.' },
    { id: 'zeros', label: 'Ends in 0', description: 'Append a run of zeros of length at most limit after a run of ones.' },
    { id: 'ones', label: 'Ends in 1', description: 'Append a run of ones of length at most limit after a run of zeros.' },
    { id: 'done', label: 'Complete', description: 'Add the two tables at the final cell, modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with zero, one, and limit (JSON)',
  url: 'https://leetcode.com/problems/find-all-possible-stable-binary-arrays-ii/',
  complexity: 'O(zero * one * limit) time and O(zero * one) space in this trace; the Python version uses prefix sums. The visualization caps each input at 8.',
  examples: [
    { label: 'Example 1', input: '{"zero":1,"one":1,"limit":2}' },
    { label: 'Example 2', input: '{"zero":1,"one":2,"limit":1}' },
    { label: 'Example 3', input: '{"zero":3,"one":3,"limit":2}' },
  ],
}

export default function StableBinaryArraysTwo() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const active = step.cell ? { row: step.cell[0], column: step.cell[1] } : null
    return <>
      <DPTable title="Ends in 0 (rows: zeros, columns: ones)" values={step.ends0} activeCell={active} />
      <DPTable title="Ends in 1 (rows: zeros, columns: ones)" values={step.ends1} activeCell={active} />
      <output aria-label="Result">{step.phase === 'done' ? `Answer modulo 1000000007: ${run.result}` : `Counting arrays with ${run.input.zero} zeros, ${run.input.one} ones, limit ${run.input.limit}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A stable array never has a run longer than limit, because such a run would be a window with only one symbol.</p>
    <p>Each cell adds up the arrays whose last run is the other symbol. The sums are reduced modulo 1000000007 as they grow.</p>
  </>} />
}
