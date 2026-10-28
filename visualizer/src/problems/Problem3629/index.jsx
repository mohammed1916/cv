import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Index 0 begins the search at distance 0.' },
    { id: 'visit', label: 'Visit', description: 'Expand neighbours and, for a prime value, its one-time teleports.' },
    { id: 'done', label: 'Complete', description: 'Report the jumps to the last index.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers from 1 to 1000000',
  url: 'https://leetcode.com/problems/minimum-jumps-to-reach-end-via-prime-teleportation/',
  complexity: 'O(n * sqrt(max value)) with trial-division primality, plus each prime bucket scanned once.',
  examples: [
    { label: 'Example 1', input: '[1,2,4,6]' },
    { label: 'Example 2', input: '[2,3,4,7,9]' },
    { label: 'Example 3', input: '[4,6,5,8]' },
  ],
}

export default function PrimeTeleportJumps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.index} roleAt={i => (step.dist !== undefined && i === 0 ? 'start' : '')} />
    <output aria-label="Distance">{`Index ${step.index} at ${step.dist} jumps`}</output>
  </>} renderReasoning={() => <>
    <p>Breadth-first search finds the fewest jumps because every move costs one jump.</p>
    <p>A prime value can teleport to all indices whose value it divides. Each prime is expanded once, since its bucket is fully visited after that.</p>
  </>} />
}
