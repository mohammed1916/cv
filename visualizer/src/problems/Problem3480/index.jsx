import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Start with no best count.' },
    { id: 'skip', label: 'Remove', description: 'Drop one pair and keep the rest.' },
    { id: 'table', label: 'Table', description: 'Record the largest blocking left end for each right end.' },
    { id: 'count', label: 'Count', description: 'Each right end contributes right minus its blocked prefix.' },
    { id: 'keep', label: 'Keep best', description: 'Keep the largest total over all removals.' },
    { id: 'done', label: 'Result', description: 'Report the best total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and conflictingPairs',
  url: 'https://leetcode.com/problems/maximize-subarrays-after-removing-one-conflicting-pair/',
  complexity: 'O(m * (n + m)) time for m pairs and n elements; the visualization caps n at 10.',
  examples: [
    { label: 'Example', input: '{"n":4,"conflictingPairs":[[2,3],[1,4]]}' },
    { label: 'Three pairs', input: '{"n":5,"conflictingPairs":[[1,3],[2,4],[3,5]]}' },
  ],
}

export default function MaximizeSubarraysAfterRemovingOneConflictingPair() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Right ends" length={run.input.n} valueAt={i => i + 1} active={step.at}
      roleAt={i => (step.right > 0 && i + 1 <= step.right ? 'counted' : '')} />
    <output aria-label="Pair state">{`skip pair ${step.skip >= 0 ? `[${run.input.conflictingPairs[step.skip]}]` : 'none'}, right ${step.right}, blocked ${step.blocked}, total ${step.total}, best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A subarray is bad when it contains both members of one remaining pair. For a fixed right end, the bad left ends form a prefix, so only the largest blocking left end matters.</p>
    <p>Trying each removal and sweeping the right ends keeps the work small enough to follow frame by frame.</p>
  </>} />
}
