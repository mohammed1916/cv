import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2165',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer (may be negative, up to 12 digits)',
  url: 'https://leetcode.com/problems/smallest-value-of-the-rearranged-number/',
  complexity: 'O(d log d) time for d digits (a sort of the digits); O(d) space.',
  examples: [
    { label: 'Positive with zeros', input: '3091' },
    { label: 'Negative', input: '-4520' },
    { label: 'Zero', input: '0' },
    { label: 'All digits equal', input: '5555' },
    { label: 'Largest 12-digit value', input: '999999999999' },
    { label: 'Negative with zeros', input: '-100000000001' },
  ],
}

export default function Problem2165Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence label="Digits of the rearranged number" length={step.digits.length} valueAt={i => step.digits[i]} active={step.lead ?? -1} roleAt={i => (i === step.lead ? 'lead' : '')} />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
