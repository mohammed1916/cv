import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Clashes', description: 'Find the positions where both arrays hold the same value.' },
    { id: 'cost', label: 'Clash cost', description: 'Swapping the clashing positions among themselves costs the sum of their indices.' },
    { id: 'borrow', label: 'Borrow', description: 'Borrow an index that holds neither the dominant value; it costs its index.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total cost, or -1 if impossible.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2 (equal-length arrays, 1 to 6 entries, values 1 to 9)',
  url: 'https://leetcode.com/problems/minimum-total-cost-to-make-arrays-unequal/',
  complexity: 'O(n) time after counting the clashes. The visualization caps input at 6 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[1,2,3,4,5],"nums2":[1,2,3,4,5]}' },
    { label: 'Example 2', input: '{"nums1":[1,1],"nums2":[1,1]}' },
  ],
}

export default function MinimumTotalCostUnequal() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Positions (nums1 / nums2)" length={run.input.nums1.length} valueAt={i => `${run.input.nums1[i]} / ${run.input.nums2[i]}`} active={step.index} roleAt={i => (step.extra.includes(i) ? 'borrowed' : run.input.nums1[i] === run.input.nums2[i] ? 'clash' : '')} />
    <output aria-label="Running cost">{`Cost so far: ${step.cost}`}</output>
  </>} renderReasoning={() => <>
    <p>Every position where the arrays match must receive a new value, and swaps among clashing positions cost their indices.</p>
    <p>If one value clashes more than half the time, extra positions that hold neither that value are needed; the smallest such indices are the cheapest to borrow.</p>
  </>} />
}
