import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is chosen yet.' },
    { id: 'take', label: 'Take', description: 'The candidate has no partner among the chosen values.' },
    { id: 'skip', label: 'Skip', description: 'The candidate would pair with a chosen value to make k.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and k (JSON), n from 1 to 20, k from 1 to 40',
  url: 'https://leetcode.com/problems/determine-the-minimum-sum-of-a-k-avoiding-array/',
  complexity: 'O(n * k) with the simple membership test. The visualization caps n at 20.',
  examples: [
    { label: 'Example 1', input: '{"n":5,"k":4}' },
    { label: 'Example 2', input: '{"n":2,"k":6}' },
  ],
}

export default function KAvoidingSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Chosen values" length={step.chosen.length} valueAt={i => step.chosen[i]} />
    <output aria-label="Candidate">{`Candidate ${step.candidate || '-'}, running sum ${step.sum}`}</output>
  </>} renderReasoning={() => <>
    <p>Taking the smallest values first keeps the sum small, so the only reason to skip a value is that its partner for k is already in the array.</p>
    <p>The value k divided by two may be used once, because the elements must be distinct.</p>
  </>} />
}
