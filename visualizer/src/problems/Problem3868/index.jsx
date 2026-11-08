import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Count', description: 'Count each value in both arrays.' },
    { id: 'value', label: 'Values', description: 'Check parity and surplus for each value.' },
    { id: 'done', label: 'Result', description: 'Report the cost or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2',
  url: 'https://leetcode.com/problems/minimum-cost-to-equalize-arrays-using-swaps/',
  complexity: 'Counting values is linear in the array length, with a small table per distinct value. The visual caps the arrays at 10 values.',
  examples: [
    { label: 'Example', input: '{"nums1":[1,1,2],"nums2":[2,3,3]}' },
    { label: 'Impossible', input: '{"nums1":[1],"nums2":[2]}' },
    { label: 'Single pair', input: '{"nums1":[9],"nums2":[9]}' },
    { label: 'Equal pairs', input: '{"nums1":[5,5],"nums2":[5,5]}' },
    { label: 'Largest values, ten items', input: '{"nums1":[9,9,9,9,9,9,9,9,9,9],"nums2":[1,1,1,1,1,1,1,1,1,1]}' },
    { label: 'Long run: 10 items', input: '{"nums1":[2,3,3,1,5,5,1,9,1,2],"nums2":[4,8,2,8,4,2,3,4,6,7]}' },
  ],
}

export default function MinimumCostToEqualizeArraysUsingSwaps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const current = step.rows.length ? step.rows[step.rows.length - 1].value : null
    return <>
      <IndexedSequence label="nums1 (cells of the value being counted are marked)" length={run.input.nums1.length} active={-1}
        valueAt={index => run.input.nums1[index]} roleAt={index => run.input.nums1[index] === current ? 'counted' : ''} />
      <IndexedSequence label="nums2 (cells of the value being counted are marked)" length={run.input.nums2.length} active={-1}
        valueAt={index => run.input.nums2[index]} roleAt={index => run.input.nums2[index] === current ? 'counted' : ''} />
      <table aria-label="Value counts">
        <thead><tr><th scope="col">Value</th><th scope="col">nums1</th><th scope="col">nums2</th><th scope="col">Surplus</th></tr></thead>
        <tbody>{step.rows.map(row => <tr key={row.value} data-role={row.odd ? 'odd' : ''}>
          <th scope="row">{row.value}</th><td>{row.a}</td><td>{row.b}</td><td>{row.odd ? 'odd total' : row.surplus}</td></tr>)}</tbody>
      </table>
      <output aria-label="Running cost">{`Running cost: ${step.cost}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Swaps inside one array are free, so positions do not matter. Only how many copies of each value sit in each array matters.</p>
    <p>A paid swap moves one copy across, so the answer is the total of the surpluses that must cross, provided every value has an even total.</p>
  </>} />
}
