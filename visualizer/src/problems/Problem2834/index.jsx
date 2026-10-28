import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is chosen yet.' },
    { id: 'take', label: 'Take', description: 'The candidate has no partner among the chosen values.' },
    { id: 'skip', label: 'Skip', description: 'The candidate would pair with a chosen value to make the target.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum sum modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and target (JSON), n from 1 to 20, target from 1 to 40',
  url: 'https://leetcode.com/problems/find-the-minimum-possible-sum-of-a-beautiful-array/',
  complexity: 'O(n * target) with the simple membership test. The visualization caps n at 20.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"target":3}' },
    { label: 'Example 2', input: '{"n":3,"target":3}' },
  ],
}

export default function BeautifulArraySum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Chosen values" length={step.chosen.length} valueAt={i => step.chosen[i]} />
    <output aria-label="Candidate">{`Candidate ${step.candidate || '-'}, running sum ${step.sum}`}</output>
  </>} renderReasoning={() => <>
    <p>Smaller values always reduce the sum, so the array is built from 1 upward and a value is only skipped when its partner for the target is already chosen.</p>
    <p>Values are distinct, so the target divided by two can be used once.</p>
  </>} />
}
