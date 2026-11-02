import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin reading digit runs from every cell.' },
    { id: 'prime', label: 'Prime', description: 'This run forms a prime above ten.' },
    { id: 'done', label: 'Result', description: 'The most frequent prime.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON matrix of digits, up to 4 by 4',
  url: 'https://leetcode.com/problems/most-frequent-prime/',
  complexity: 'O(m * n * (m + n) * sqrt(V)) time, where V is the largest number formed. The grid is at most 4 by 4 here.',
  examples: [
    { label: 'Example 1', input: '[[1,1],[9,9],[1,1]]' },
    { label: 'Example 2', input: '[[7]]' },
    { label: 'Example 3', input: '[[9,7,8],[4,6,5],[2,8,6]]' },
  ],
}

export default function MostFrequentPrime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Current run">{step.cell ? `from (${step.cell[0]}, ${step.cell[1]}) going (${step.dir[0]}, ${step.dir[1]}): ${step.num}` : 'no run yet'}</output>
    <output aria-label="Best prime">{`best so far: ${step.best ?? '-'}, count ${step.bestCount}`}</output>
  </>} renderReasoning={() => <>
    <p>Every straight run of digits from each cell counts as one number. Runs are formed in all eight directions, and only primes above ten are kept.</p>
    <p>The answer is the prime seen most often; on a tie the larger prime wins.</p>
  </>} />
}
