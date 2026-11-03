import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WindowFlipView from './WindowFlipView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Zero operations already reach the original string.' },
    { id: 'window', label: 'Window', description: 'Each window start adds an independent flip.' },
    { id: 'done', label: 'Result', description: 'Report the reachable count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (binary string) and k (window length)',
  url: 'https://leetcode.com/problems/number-of-distinct-binary-strings-after-applying-operations/',
  complexity: 'O(n - k) time with the power-of-two count, since the windows are linearly independent over GF(2). The visualization caps s at 12 bits.',
  examples: [
    { label: 'Mixed', input: '{"s":"101101","k":3}' },
    { label: 'Whole string', input: '{"s":"0000","k":4}' },
    { label: 'Pairs', input: '{"s":"1100110","k":2}' },
  ],
}

export default function DistinctBinaryStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <WindowFlipView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Flipping a window is XOR with a fixed 0/1 pattern. Window starts have distinct leading positions, so no combination of them cancels to nothing, and each window doubles the set of strings.</p>
  </>} />
}
