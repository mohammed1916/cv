import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with x equal to 0.' },
    { id: 'try', label: 'Try x', description: 'Reverse x and add it to x.' },
    { id: 'done', label: 'Complete', description: 'Report whether a match was found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with num from 0 to 1000, for example {"num":443}',
  url: 'https://leetcode.com/problems/sum-of-number-and-its-reverse/',
  complexity: 'O(num * digits) time for the search. The visualization caps num at 1000.',
  examples: [
    { label: 'Match', input: '{"num":443}' },
    { label: 'No match', input: '{"num":63}' },
  ],
}

export default function SumAndReverse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Candidates tried" length={step.checked} valueAt={index => index} active={step.x} />
    <output aria-label="Candidate">{`Candidates checked: ${step.checked}`}</output>
  </>} renderReasoning={() => <>
    <p>A number x plus its reverse is at most num, so the search only needs candidates from 0 up to num.</p>
    <p>Reversing a number takes its digits from the last one up, the same way as the mirror distance problem.</p>
  </>} />
}
