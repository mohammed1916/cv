import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Start with one element.' },
    { id: 'prefix', label: 'Prefix sums', description: 'Build prefix sums of the current dp row.' },
    { id: 'increase', label: 'I step', description: 'New rank j sums old ranks below j.' },
    { id: 'decrease', label: 'D step', description: 'New rank j sums old ranks from j upward.' },
    { id: 'done', label: 'Complete', description: 'Sum the final row.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'DI string s (JSON)',
  url: 'https://leetcode.com/problems/valid-permutations-for-di-sequence/',
  complexity: 'O(n^2) time and O(n) space (the visualization keeps each row; s is capped at 100 characters).',
  examples: [
    { label: 'Example 1', input: '"DID"' },
    { label: 'Example 2', input: '"D"' },
    { label: 'All increasing', input: '"IIII"' },
    { label: 'Mixed', input: '"DIDDIID"' },
  ],
}

export default function ValidPermutationsDI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s (D/I)" length={run.input.length} active={step.i ?? -1} valueAt={i => run.input[i]} roleAt={i => i < step.i ? 'read' : ''} />
    <IndexedSequence label="dp: count by rank of last element" length={step.dp.length} valueAt={i => step.dp[i]} />
    {step.prefix && <IndexedSequence label="Prefix sums of previous dp" length={step.prefix.length} valueAt={i => step.prefix[i]} />}
    <output aria-label="Answer">{step.phase === 'done' ? `Answer: ${run.result}` : `Row length ${step.dp.length}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Relabel the first i+1 values by rank. Appending a new element with rank j shifts old ranks at or above j up by one, which turns each D/I condition into a contiguous range of old ranks.</p>
  </>} />
}
