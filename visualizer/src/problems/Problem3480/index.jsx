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
    { label: 'Example', input: '{"n":4,"conflictingPairs":[[1,3],[2,4]]}' },
    { label: 'Three pairs', input: '{"n":5,"conflictingPairs":[[1,3],[2,4],[3,5]]}' },
    { label: 'Smallest n with one conflict', input: '{"n":2,"conflictingPairs":[[1,2]]}' },
    { label: 'Same conflict listed twice', input: '{"n":3,"conflictingPairs":[[1,2],[2,1]]}' },
    { label: 'Largest n with 2n pairs', input: '{"n":10,"conflictingPairs":[[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,1],[1,3],[2,4],[3,5],[4,6],[5,7],[6,8],[7,9],[8,10],[9,1],[10,2]]}' },
    { label: 'Long run: n 10 with 15 pairs', input: '{"n":10,"conflictingPairs":[[3,2],[10,7],[4,7],[6,8],[9,4],[8,1],[3,7],[3,10],[8,2],[1,10],[2,9],[10,5],[5,1],[6,3],[8,7]]}' },
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
