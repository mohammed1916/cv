import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Try removing each occurrence of the chosen digit.' },
    { id: 'candidate', label: 'Candidate', description: 'Remove this occurrence and compare the result with the best so far.' },
    { id: 'done', label: 'Complete', description: 'Report the largest result.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Number and digit (JSON object with number and digit)',
  url: 'https://leetcode.com/problems/remove-digit-from-number-to-maximize-result/',
  complexity: 'O(n^2) time for building candidates. The visualization caps number at 30 digits.',
  examples: [
    { label: 'Own case 1', input: '{"number":"234","digit":"4"}' },
    { label: 'Own case 2', input: '{"number":"2342","digit":"2"}' },
    { label: 'Own case 3', input: '{"number":"662","digit":"6"}' },
    { label: 'Two digits, zero', input: '{"number":"10","digit":"0"}' },
    { label: 'Every digit matches', input: '{"number":"7777","digit":"7"}' },
    { label: 'Thirty nines', input: '{"number":"999999999999999999999999999999","digit":"9"}' },
    { label: 'Long run: 30 digits', input: '{"number":"434232806030102708828877951895","digit":"0"}' },
  ],
}

export default function RemoveDigitToMaximizeResult() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Number" length={run.input.number.length} valueAt={i => run.input.number[i]} active={step.position}
      roleAt={i => (run.input.number[i] === run.input.digit ? 'target' : '')} />
    <output aria-label="Candidate">{`Candidate: ${step.candidate || '(none)'}, best: ${step.best || '(none)'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>All candidates have the same length, so comparing them as text gives the same order as comparing their values.</p>
  </>} />
}
