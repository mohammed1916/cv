import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Caps', description: 'Set a[0] to 0 and the restricted caps.' },
    { id: 'forward', label: 'Left to right', description: 'Lower each cap from its left neighbour.' },
    { id: 'backward', label: 'Right to left', description: 'Lower each cap from its right neighbour.' },
    { id: 'done', label: 'Complete', description: 'Report the largest cap.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sequence (JSON object with n, restrictions, diff)',
  url: 'https://leetcode.com/problems/find-maximum-value-in-a-constrained-sequence/',
  complexity: 'O(n) time for two passes. The visualization caps n at 30.',
  examples: [
    { label: 'Example 1', input: '{"n":8,"restrictions":[[3,2]],"diff":[3,5,2,4,2,3,1]}' },
    { label: 'Example 2', input: '{"n":10,"restrictions":[[3,1],[8,1]],"diff":[2,2,3,1,4,5,1,1,2]}' },
  ],
}

export default function FindMaximumValueConstrainedSequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <IndexedSequence label="Cap for each position" length={step.limit.length} valueAt={i => (step.limit[i] >= 1e15 ? 'inf' : step.limit[i])}
      active={step.index} roleAt={i => (step.index >= 0 && i === step.index ? 'updated' : '')} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each cap is pushed through the step limits from both sides. The largest final cap is achievable, because the caps differ by at most diff between neighbours.</p>
  </>} />
}
