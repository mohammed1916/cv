import PointerRail from '../../components/shared/PointerRail'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '15',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/3sum/',
  complexity: 'O(n²) time: sorting costs O(n log n), then each of n anchors scans with two pointers. O(1) extra space beyond the output.',
  examples: [
    { label: 'Mixed signs', input: '[4,-2,-2,0,6,-6,1]' },
    { label: 'No triple', input: '[1,2,3,4]' },
    { label: 'All zeros', input: '[0,0,0,0]' },
  ],
}

export default function ThreeSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, i, left, right, total, triples } = step.snapshot
    return <>
      <PointerRail title="Sorted values: anchor, left and right" values={sorted}
        pointers={[
          i !== null && i !== undefined && i >= 0 && { id: 'anchor', label: `i ${i}`, index: i, tone: 'primary' },
          left !== null && left !== undefined && { id: 'left', label: `L ${left}`, index: left, tone: 'info' },
          right !== null && right !== undefined && { id: 'right', label: `R ${right}`, index: right, tone: 'warning' },
        ].filter(Boolean)}
        range={left !== null && left !== undefined ? { start: left, end: right } : null}
        note="Anchor i is fixed; L and R scan the rest of the sorted values." />
      <p>{total === null ? 'No sum yet.' : `Current sum: ${total}`}</p>
      <p>Triples found: {triples.length === 0 ? 'none yet' : triples.map(t => `[${t.join(', ')}]`).join(' ')}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Sort, then fix one value:</strong> with the first value fixed, the other two form a two-sum problem on a sorted range that two pointers solve in linear time.</p>
    <p><strong>Duplicates:</strong> equal neighbours are skipped at the anchor and at both pointers, so each distinct triple is reported once.</p>
  </>} />
}
