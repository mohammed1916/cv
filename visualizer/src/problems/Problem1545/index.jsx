import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1545', phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and k (JSON)',
  url: 'https://leetcode.com/problems/find-kth-bit-in-nth-binary-string/',
  complexity: 'O(n) time and O(1) space: one step per level, descending from S(n) to S(1).',
  examples: [
    { label: 'Left half', input: '{"n":3,"k":6}' },
    { label: 'Center bit', input: '{"n":5,"k":16}' },
    { label: 'Deep right', input: '{"n":4,"k":11}' },
  ],
}

export default function KthBitNthString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, k } = run.input
    const { level, pos, flips, mid, result } = step.snapshot
    return <>
      <p>{`Target: position ${k} of S${n}. Current level S${level}, position ${pos}, ${flips % 2 ? 'inverted' : 'not inverted'}.`}</p>
      <p>{mid !== undefined ? `Center of S${level} is position ${mid}, always 1 before inversion.` : 'Each level has a center bit set to 1.'}</p>
      {result !== undefined && result !== null && <p role="status">{`Answer bit: ${result}`}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Structure:</strong> S(n) = S(n-1) + "1" + reverse(invert(S(n-1))). The center is always 1.</p>
    <p><strong>Right half:</strong> a position on the right maps to 2^n - k in the previous level, and the result is inverted. The left half is unchanged.</p>
  </>} />
}
