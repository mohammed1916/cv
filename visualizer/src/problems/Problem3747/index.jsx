import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with zero.' },
    { id: 'shorter', label: 'Shorter', description: 'Count the zero-free numbers with fewer digits than n.' },
    { id: 'digit', label: 'Digit', description: 'Count the smaller nonzero choices at each position.' },
    { id: 'self', label: 'Self', description: 'n itself counts when it has no zero.' },
    { id: 'done', label: 'Complete', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, for example {"n":10}',
  url: 'https://leetcode.com/problems/count-distinct-integers-after-removing-zeros/',
  complexity: 'O(d) time for d digits of n. The visualization accepts n up to 10^15.',
  examples: [
    { label: 'Example 1', input: '{"n":10}' },
    { label: 'Example 2', input: '{"n":3}' },
  ],
}

export default function ZeroFreeCount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of n" length={String(run.input.n).length} valueAt={index => String(run.input.n)[index]} active={step.index} />
    <output aria-label="Count">{`Zero-free integers counted so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Removing zeros never makes a number bigger, and every zero-free number maps to itself. So the answer is the number of zero-free integers from 1 to n.</p>
    <p>Count the shorter zero-free numbers in one power of nine each, then walk the digits of n and count the smaller choices at each position.</p>
  </>} />
}
