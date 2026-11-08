import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PlacementView from './PlacementView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2 (entries are 0 or 1)',
  url: 'https://leetcode.com/problems/constructing-two-increasing-arrays/',
  complexity: 'O(mn) time and O(mn) space. Officially nums1 has up to 1000 entries (and may be empty) and nums2 has 1 to 1000; the visualization caps each at 8.',
  examples: [
    { label: 'Mixed parities', input: '{"nums1":[1,1,0],"nums2":[0,1]}' },
    { label: 'nums1 empty', input: '{"nums1":[],"nums2":[0,0,1]}' },
    { label: 'All even competition', input: '{"nums1":[0,0],"nums2":[0,0]}' },
    { label: 'Single entry each', input: '{"nums1":[1],"nums2":[1]}' },
    { label: 'Equal bit lists', input: '{"nums1":[1,1],"nums2":[1,1]}' },
    { label: 'Largest lists', input: '{"nums1":[1,0,1,0,1,0,1,0],"nums2":[0,1,0,1,0,1,0,1]}' },
    { label: 'Long run: eight generated bits per list', input: '{"nums1":[0,1,0,1,0,1,0,1],"nums2":[0,1,0,1,0,1,0,1]}' },
  ],
}

export default function ConstructingTwoIncreasingArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PlacementView run={run} step={step} />} renderReasoning={() => <>
    <p>Imagine handing out integers from small to large. Whichever entry gets the current largest integer must be the last placed entry of nums1 or of nums2, so a state only needs how many entries of each array are done.</p>
    <p>Everything already placed sits at or below the current maximum, so the new entry simply takes the next integer of its parity above that maximum. That also keeps each array increasing and every integer unique.</p>
    <p>A smaller maximum is never worse for later entries, so keeping only the smallest value per cell is safe.</p>
  </>} />
}
