import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the lowest bit.' },
    { id: 'scan', label: 'Scan', description: 'Read the next bit and compare it with the previous one.' },
    { id: 'pair', label: 'Pair', description: 'Two set bits in a row form a pair.' },
    { id: 'done', label: 'Return', description: 'The answer is true only when exactly one pair appeared.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"n": n}',
  url: 'https://leetcode.com/problems/exactly-one-consecutive-set-bits-pair/',
  complexity: 'O(log n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"n":6}' },
    { label: 'Example 2', input: '{"n":5}' },
  ],
}

export default function ExactlyOneConsecutiveSetBits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Binary form">{`Binary of n: ${step.bits}. Pairs so far: ${step.pairs}.`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Two neighbouring positions are both set exactly when the bit and the one before it are both 1.</p>
    <p>Counting those positions and checking for exactly one answers the question in one pass over the bits.</p>
  </>} />
}
