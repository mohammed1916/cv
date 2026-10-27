import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty number.' },
    { id: 'extend', label: 'Append a digit', description: 'Only digits that differ by exactly k from the previous one are tried.' },
    { id: 'complete', label: 'Full number', description: 'A number with n digits is valid.' },
    { id: 'done', label: 'Complete', description: 'Every valid number has been found.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'n and k (JSON)',
  url: 'https://leetcode.com/problems/numbers-with-same-consecutive-differences/',
  complexity: 'Proportional to the number of answers times n. The visualization caps n at 5.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"k":7}' },
    { label: 'Zero difference', input: '{"n":2,"k":0}' },
  ],
}

export default function SameConsecutiveDifferences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Digits (${run.input.n} needed)`} length={run.input.n} active={step.digits.length - 1}
      valueAt={i => (i < step.digits.length ? step.digits[i] : '·')} />
    <output aria-label="Found">{`Found so far: ${step.results.length ? step.results.join(', ') : 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Build the number from the left. Each new digit must differ from the one before by exactly k, so most digits are ruled out at once.</p>
    <p>A finished number is kept; the search then backtracks to try the other digits.</p>
  </>} />
}
