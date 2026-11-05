import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1983',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two binary arrays of equal length (JSON)',
  url: 'https://leetcode.com/problems/widest-pair-of-indices-with-equal-range-sum/',
  complexity: 'O(n) time and O(n) space for the balance map.',
  examples: [
    { label: 'Equal prefix', input: '{"nums1":[1,0,0,1,1],"nums2":[1,1,0,0,0]}' },
    { label: 'Single swap', input: '{"nums1":[0,1],"nums2":[1,0]}' },
    { label: 'No match', input: '{"nums1":[0],"nums2":[1]}' },
  ],
}

export default function WidestPairOfIndices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { diff, k, balance, first, r, widest } = step.snapshot
    const l = first ?? -1
    return <>
      <IndexedSequence label="Balance at each boundary" length={diff.length} valueAt={i => diff[i]} active={k}
        roleAt={i => (i === l ? 'l' : '') + (i === r ? ' r' : '')} indexOffset={0} />
      <p>Current balance: <strong>{balance}</strong> at boundary <strong>{k}</strong>. Widest equal segment so far: <strong>{widest}</strong>.</p>
      {r !== null && <p>Boundaries <strong>{l}</strong> (l) and <strong>{r}</strong> (r) hold the same balance, so indices {l} to {r - 1} have equal sums.</p>}
    </>
  }} renderReasoning={() => <p>A segment has equal sums exactly when the running difference of nums1 and nums2 returns to the same value at its two boundaries. The first time each balance appears gives the longest segment ending later.</p>} />
}
