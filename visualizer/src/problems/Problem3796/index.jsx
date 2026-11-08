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
    { label: 'Four values, two caps', input: '{"n":4,"restrictions":[[1,5],[3,2]],"diff":[2,3,1]}' },
    { label: 'Three values, one cap', input: '{"n":3,"restrictions":[[2,7]],"diff":[1,4]}' },
    { label: 'Two values', input: '{"n":2,"restrictions":[[1,5]],"diff":[3]}' },
    { label: 'Equal differences and limits', input: '{"n":4,"restrictions":[[1,2],[2,2]],"diff":[2,2,2]}' },
    { label: 'Limit at the maximum', input: '{"n":5,"restrictions":[[1,1000],[4,1]],"diff":[10,10,10,10]}' },
    { label: 'Long run: 30 values', input: '{"n":30,"restrictions":[[1,717],[6,691],[11,803],[16,605],[21,559],[26,829]],"diff":[9,1,8,3,4,4,3,4,7,1,6,6,7,8,4,2,3,7,9,6,6,9,7,1,8,2,3,7,10]}' },
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
