import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'x and the digit sum start at zero.' },
    { id: 'scan', label: 'Digit', description: 'Read the next digit of n.' },
    { id: 'append', label: 'Append', description: 'A nonzero digit extends x.' },
    { id: 'sum', label: 'Sum', description: 'Every digit adds to the total.' },
    { id: 'done', label: 'Result', description: 'Multiply x by the digit sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (integer from 0 to 10^9)',
  url: 'https://leetcode.com/problems/concatenate-non-zero-digits-and-multiply-by-sum-i/',
  complexity: 'O(d) time for d decimal digits.',
  examples: [
    { label: 'Example', input: '{"n":10203}' },
    { label: 'Trailing zeros', input: '{"n":1000}' },
  ],
}

export default function ConcatenateNonZeroDigitsI() {
  const digitsOf = run => String(run.input.n).split('')
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="digits of n" length={digitsOf(run).length} valueAt={i => digitsOf(run)[i]} active={step.at} />
    <output aria-label="Accumulators">{`x = ${step.x}, digit sum = ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Concatenating a nonzero digit d onto x is the same as x * 10 + d, so x is built left to right.</p>
    <p>Zeros add nothing to the digit sum but are not appended to x.</p>
  </>} />
}
