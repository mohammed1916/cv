import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Targets', description: 'Every common sum from 2 to twice the limit is a candidate.' },
    { id: 'pair', label: 'Pair', description: 'Each mirrored pair adds 2 moves, minus 1 on a range of sums, minus 1 at its own sum.' },
    { id: 'scan', label: 'Scan', description: 'A running sum gives the total cost of every target.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and limit (JSON)',
  url: 'https://leetcode.com/problems/minimum-moves-to-make-array-complementary/',
  complexity: 'O(n + limit) time and O(limit) space. The visualization caps input at 12 values and limit 10.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,4,3],"limit":4}' },
    { label: 'Example 2', input: '{"nums":[1,2,2,1],"limit":2}' },
  ],
}

export default function MinimumComplementaryMoves() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Moves for each target sum" length={2 * run.input.limit + 1} valueAt={i => step.costs?.[i] ?? '·'} active={step.index} indexOffset={0} />
    <output aria-label="Best">{`Cheapest so far: ${step.phase === 'done' ? run.result : '(scanning)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each mirrored pair fixes its own cost curve over target sums, so the total can be built as a sum of range updates.</p>
    <p>A pair whose sum already equals the target costs 0 moves, one that can be fixed by changing one value costs 1, and otherwise it costs 2.</p>
  </>} />
}
