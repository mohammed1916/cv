import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count the zeros that must become ones.' },
    { id: 'visit', label: 'Visit', description: 'Take the next zero count from the queue.' },
    { id: 'next', label: 'Flip', description: 'Flipping x zeros among the k chosen gives a new zero count.' },
    { id: 'done', label: 'Result', description: 'Report the shortest distance to zero zeros, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (binary string) and k',
  url: 'https://leetcode.com/problems/minimum-operations-to-equalize-binary-string/',
  complexity: 'O(n * k) time and O(n) space with breadth-first search over zero counts. The visualization caps s at 30 characters.',
  examples: [
    { label: 'Three flips', input: '{"s":"0110","k":2}' },
    { label: 'Unreachable', input: '{"s":"01011","k":3}' },
  ],
}

export default function MinimumOperationsToEqualizeBinaryString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={-1} />
    <output aria-label="Zero count">{`zeros = ${step.zeros ?? '-'}, depth = ${step.depth ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the number of zeros matters. If k positions are flipped and x of them are zeros, the zero count becomes zeros + k - 2x.</p>
    <p>A breadth-first search over zero counts finds the fewest operations, since every operation has the same cost.</p>
  </>} />
}
