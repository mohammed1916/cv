import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The empty prefix has total 0 with no subarrays.' },
    { id: 'row', label: 'Extend prefix', description: 'For each count, take the better of skipping this value or ending a subarray here.' },
    { id: 'done', label: 'Return', description: 'Take the best total over all allowed counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"nums": [...], "m": m, "l": l, "r": r}',
  url: 'https://leetcode.com/problems/maximum-sum-of-m-non-overlapping-subarrays-ii/',
  complexity: 'O(n * m * (r - l)) time and O(n * m) space. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,1,-5,2],"m":2,"l":1,"r":3}' },
    { label: 'Example 3', input: '{"nums":[-1,7,-4],"m":1,"l":2,"r":3}' },
  ],
}

export default function MaxSumNonOverlappingII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Table row">{`Prefix length ${step.i}: [${step.row.map(v => (v === -Infinity ? '-inf' : v)).join(', ')}]`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each cell asks whether the current value is skipped or ends a subarray whose length is between l and r.</p>
    <p>Tracking the number of subarrays used keeps the at-most-m limit exact, and at least one subarray is required by taking j from 1.</p>
  </>} />
}
