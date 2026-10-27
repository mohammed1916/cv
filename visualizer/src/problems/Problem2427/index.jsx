import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Set the candidate range to the smaller number.' },
    { id: 'scan', label: 'Test x', description: 'Check whether x divides both numbers.' },
    { id: 'done', label: 'Complete', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a and b (JSON)',
  url: 'https://leetcode.com/problems/number-of-common-factors/',
  complexity: 'O(min(a, b)) time and O(1) space. The visualization caps a and b at 60.',
  examples: [
    { label: 'Example 1', input: '{"a":12,"b":6}' },
    { label: 'Example 2', input: '{"a":25,"b":30}' },
  ],
}

export default function NumberOfCommonFactors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Candidates x" length={run.limit} valueAt={i => i + 1} active={step.x - 1}
      roleAt={i => (step.factors.includes(i + 1) ? 'common' : '')} />
    <output aria-label="Count">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A common factor cannot be larger than either number, so only candidates up to the smaller value need checking.</p>
    <p>Each candidate is kept exactly when it divides both numbers.</p>
  </>} />
}
