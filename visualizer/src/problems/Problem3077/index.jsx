import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const show = value => (value === -Infinity ? '-∞' : String(value))

const definition = {
  phases: [
    { id: 'start', label: 'Nothing chosen', description: 'Zero subarrays, strength zero.' },
    { id: 'element', label: 'Next element', description: 'Each count keeps or starts a subarray with this element.' },
    { id: 'done', label: 'Complete', description: 'Report the best strength using exactly k subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers from -20 to 20) and k',
  url: 'https://leetcode.com/problems/maximum-strength-of-k-disjoint-subarrays/',
  complexity: 'O(n * k) time and O(k) space. The visualization caps input at 8 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,-1,2],"k":3}' },
    { label: 'Example 2', input: '{"nums":[12,-2,-2,-2,-2],"k":5}' },
  ],
}

export default function KDisjointStrength() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Best strengths by number of subarrays">
      <caption>Best strength for j subarrays, with the last element closed or inside the j-th subarray</caption>
      <thead><tr><th scope="col">j</th><th scope="col">closed</th><th scope="col">open</th></tr></thead>
      <tbody>{step.closed.map((value, j) => <tr key={j}><th scope="row">{j}</th><td>{show(value)}</td><td>{show(step.open[j])}</td></tr>)}</tbody>
    </table>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The strength formula alternates signs across the chosen subarrays, and each weight shrinks by one, so the position of a subarray matters.</p>
    <p>Two states per count are enough: whether the current element is inside the latest subarray or not.</p>
  </>} />
}
