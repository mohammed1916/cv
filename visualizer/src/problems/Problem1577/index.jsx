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
    { label: 'Three and four values', input: '{"nums1":[7,3,6],"nums2":[4,9,2,8]}' },
    { label: 'Repeated square factors', input: '{"nums1":[4,6],"nums2":[9,6,6]}' },
    { label: 'Mixed lengths', input: '{"nums1":[7,12,3],"nums2":[21,4,5,6]}' },
    { label: 'Single value each', input: '{"nums1":[1],"nums2":[1]}' },
    { label: 'Repeated values', input: '{"nums1":[5,5],"nums2":[5,5]}' },
    { label: 'Largest values', input: '{"nums1":[100000,1,100000,1,100000,1,100000,1],"nums2":[100000]}' },
    { label: 'Long run: 8 each', input: '{"nums1":[23368,28441,37867,36868,32336,1639,86534,81717],"nums2":[81850,36204,44841,22139,46074,88402,92151,53122]}' },
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
