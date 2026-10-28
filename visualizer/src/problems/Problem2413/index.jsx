import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with n as the candidate.' },
    { id: 'step', label: 'Add n', description: 'If the candidate is odd, add n to it.' },
    { id: 'done', label: 'Complete', description: 'Report the even candidate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n from 1 to 150, for example {"n":5}',
  url: 'https://leetcode.com/problems/smallest-even-multiple/',
  complexity: 'O(1) time. At most one addition is needed.',
  examples: [
    { label: 'Odd n', input: '{"n":5}' },
    { label: 'Even n', input: '{"n":6}' },
  ],
}

export default function SmallestEvenMultiple() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Candidates" length={2} valueAt={index => run.input.n * (index + 1)} active={step.multiple === run.input.n ? 0 : 1} indexOffset={1} />
    <output aria-label="Candidate">{`Candidate: ${step.multiple}`}</output>
  </>} renderReasoning={() => <>
    <p>A multiple of n is even when it is n times an even number. If n is even, n already works. If n is odd, 2n is the smallest even multiple.</p>
  </>} />
}
