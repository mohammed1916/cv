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
    { label: 'Own case 1', input: '[2,3,5,7]' },
    { label: 'Own case 2', input: '[3,4,5,8,10]' },
    { label: 'Own case 3', input: '[5,7,6,9]' },
    { label: 'Single one', input: '[1]' },
    { label: 'Equal values', input: '[6,6,6]' },
    { label: 'Largest values allowed', input: '[1000000,999983,2]' },
    { label: 'Long run: 30 values', input: '[779290,424433,500090,4342,611572,82872,682401,25268,653487,46574,158973,450636,792127,524601,137951,346370,461912,945787,873372,951003,45039,797851,320457,63898,817847,30586,791161,503875,874404,32446]' },
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
