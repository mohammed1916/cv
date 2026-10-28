import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'check', label: 'Check index', description: 'Compare the digit sum at this index with the index.' },
    { id: 'done', label: 'Return', description: 'Return the first matching index, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON array of 1 to 12 integers from 0 to 1000)',
  url: 'https://leetcode.com/problems/smallest-index-with-digit-sum-equal-to-index/',
  complexity: 'O(n * d) time, where d is the number of digits per value. O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '[1,3,2]' },
    { label: 'Example 2', input: '[1,10,11,12]' },
  ],
}

export default function DigitSumIndex() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values (index in brackets)" length={run.input.length} valueAt={i => run.input[i]}
      active={step.index} roleAt={i => (step.phase === 'done' && i === step.index ? 'match' : '')} />
    <output aria-label="Digit sum state">{`${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>The digit sum of each value is compared with its own index, and the scan stops at the first match.</p>
    <p>Because the scan goes in index order, the first match is automatically the smallest index.</p>
  </>} />
}
