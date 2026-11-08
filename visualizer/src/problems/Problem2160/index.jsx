import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2160',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Four-digit number (1000 to 9999)',
  url: 'https://leetcode.com/problems/minimum-sum-of-four-digit-number-after-splitting-digits/',
  complexity: 'O(1) time for four digits; the sort is constant-sized.',
  examples: [
    { label: 'Repeated digit', input: '4441' },
    { label: 'Zero present', input: '7306' },
    { label: 'Smallest number', input: '1000' },
    { label: 'All digits equal', input: '2222' },
    { label: 'Largest number', input: '9999' },
    { label: 'Descending digits', input: '9753' },
  ],
}

export default function Problem2160Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <IndexedSequence label="Sorted digits (number one takes positions 0 and 2, number two takes 1 and 3)" length={step.digits.length} valueAt={i => step.digits[i]} active={-1} roleAt={i => (i === 0 || i === 2 ? 'number one' : 'number two')} />
          <p>Number one: {step.new1.join('') || '–'} · number two: {step.new2.join('') || '–'} · total: {step.total ?? '–'}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
