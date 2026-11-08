import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, phases, code, python, pythonLineMap } from './algorithm'

const definition = {
  number: '1437',
  inputLabel: 'Object with nums (0/1 array) and k',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  examples: [
    { label: 'Spaced', input: '{"nums":[1,0,0,0,1,0,0,1],"k":2}' },
    { label: 'Too close', input: '{"nums":[1,0,1],"k":2}' },
    { label: 'Adjacent', input: '{"nums":[0,1,1,0],"k":1}' },
    { label: 'One empty slot', input: '{"nums":[1],"k":0}' },
    { label: 'All ones, no gap', input: '{"nums":[1,1,1],"k":0}' },
    { label: 'Alternating, largest k', input: '{"nums":[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],"k":30}' },
    { label: 'Long run: 30 slots', input: '{"nums":[0,1,1,1,0,1,1,0,0,1,1,1,1,0,1,0,0,1,0,0,0,0,0,1,1,1,1,1,0,1],"k":3}' },
  ],
  complexity: 'Time O(n) · Space O(1).',
  url: 'https://leetcode.com/problems/check-if-all-1s-are-at-least-length-k-places-away/',
}

import IndexedSequence from '../../components/shared/IndexedSequence'

// The array with the previous 1 (last) and the current position (i) marked. The zeros between them are counted.
function GapVisual({ run, step }) {
  const { nums, k } = run.input
  const { index, last, gap, verdict } = step.snapshot
  const roleAt = i => {
    const parts = []
    if (last !== null && i === last) parts.push('last 1')
    return parts.join(' ')
  }
  return <div>
    <IndexedSequence label={`Positions (k = ${k}); the marked 1 is the previous one`} length={nums.length} active={index ?? -1}
      valueAt={i => nums[i]} roleAt={roleAt} />
    <p style={{ color: 'var(--text)' }}>
      {gap !== null && gap !== undefined
        ? `Zeros between the previous 1 and this 1: ${gap}. They must be at least ${k}.`
        : (last !== null ? `Latest 1 so far is at ${last}.` : 'No 1 seen yet.')}
    </p>
    {verdict !== null && verdict !== undefined && <p style={{ color: 'var(--text)' }}>Verdict: <strong>{verdict ? 'true' : 'false'}</strong></p>}
  </div>
}

export default function AllOnesAwayByK() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <GapVisual run={run} step={step} />}
    renderReasoning={() => <p>Only neighbouring 1s matter: if each consecutive pair has at least k zeros between them, every pair is fine.</p>} />
}
