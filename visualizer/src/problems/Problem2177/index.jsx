import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TripleView from './TripleView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2177',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'A non-negative integer, e.g. 33',
  url: 'https://leetcode.com/problems/find-three-consecutive-integers-that-sum-to-a-given-number/',
  complexity: 'O(1) time and O(1) space. The visualization accepts totals up to 1,000,000.',
  examples: [
    { label: 'Multiple of 3', input: '33' },
    { label: 'Not a multiple', input: '4' },
    { label: 'Around zero', input: '0' },
    { label: 'Smallest positive', input: '1' },
    { label: 'Smallest multiple of three', input: '3' },
    { label: 'Largest multiple of three', input: '999999' },
    { label: 'Largest allowed, not a multiple', input: '1000000' },
  ],
}

export default function Problem2177Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TripleView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
