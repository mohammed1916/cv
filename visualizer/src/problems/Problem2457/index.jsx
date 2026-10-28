import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Check n', description: 'Compare the digit sum of n with the target.' },
    { id: 'try', label: 'Round up', description: 'Round n up to a multiple of the current power of ten and check its digit sum.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest addition.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (1 to 1000) and target (1 to 30)',
  url: 'https://leetcode.com/problems/minimum-addition-to-make-integer-beautiful/',
  complexity: 'O(log n) candidates, each with O(digits) work. The visualization caps n at 1000.',
  examples: [
    { label: 'Example 1', input: '{"n":999,"target":1}' },
    { label: 'Example 2', input: '{"n":1999,"target":1}' },
  ],
}

export default function MinimumAdditionBeautiful() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Digits of the candidate" length={String(step.candidate).length} valueAt={i => String(step.candidate)[i]} active={-1} roleAt={() => ''} />
    <output aria-label="Candidate digit sum">{`Candidate ${step.candidate} has digit sum ${step.sum}`}</output>
  </>} renderReasoning={() => <>
    <p>Lowering the digit sum means making trailing digits zero. For each power of ten, the smallest number at or above n that is a multiple of it has the smallest digit sum in its block.</p>
    <p>So checking the rounded-up candidates in order finds the smallest valid number, and the answer is that number minus n.</p>
  </>} />
}
