import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Zero ways', description: 'Start the count at zero.' },
    { id: 'pair', label: 'Pair products', description: 'Record the product of every pair on the pair side.' },
    { id: 'square', label: 'Square lookups', description: 'Look up each square in the table.' },
    { id: 'done', label: 'Total', description: 'Report the total number of ways.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two lists as JSON: {"nums1": [...], "nums2": [...]}',
  url: 'https://leetcode.com/problems/number-of-ways-where-square-of-number-is-equal-to-product-of-two-numbers/',
  complexity: 'O(n^2 + m^2) time and O(m^2) space for the product table. The visualization caps each list at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[7,4],"nums2":[5,2,8,9]}' },
    { label: 'Example 2', input: '{"nums1":[1,1],"nums2":[1,1,1]}' },
    { label: 'Example 3', input: '{"nums1":[7,7,8,3],"nums2":[1,2,9,7]}' },
  ],
}

export default function SquareProductWays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Ways so far">{`Ways so far: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Each pair from one list is multiplied once and counted in a table. A square from the other list then needs only one lookup, so the pairs are never compared with the squares directly.</p>
    <p>The count runs in both directions, because the condition can use either list for the square.</p>
  </>} />
}
