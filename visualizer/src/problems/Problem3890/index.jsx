import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No sums have been counted yet.' },
    { id: 'a', label: 'Pairs for a', description: 'Add every pair that starts with this a.' },
    { id: 'done', label: 'Complete', description: 'Keep the sums reached at least twice, in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Limit (JSON object with n)',
  url: 'https://leetcode.com/problems/integers-with-multiple-sum-of-two-cubes/',
  complexity: 'About (cube root of n) squared pairs are enumerated. The visualization caps n at 5000.',
  examples: [
    { label: 'Example 1', input: '{"n":4104}' },
    { label: 'Example 2', input: '{"n":578}' },
  ],
}

export default function MultipleCubeSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Cube bases" length={Math.max(1, step.a ?? 1)} valueAt={i => i + 1} active={(step.a ?? 1) - 1} />
    <output aria-label="Result">{step.result ? `Results: [${step.result.join(', ')}]` : `Sums counted: ${step.sums}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each cube base is at most the cube root of n, so only a few hundred pairs need to be listed. Sums that appear in two different pairs are the answers.</p>
  </>} />
}
