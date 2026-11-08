import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No hours have been seen yet.' },
    { id: 'hour', label: 'Add hour', description: 'Count earlier hours whose remainder completes a day.' },
    { id: 'done', label: 'Complete', description: 'Report the number of complete-day pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Hours as a JSON array of integers',
  url: 'https://leetcode.com/problems/count-pairs-that-form-a-complete-day-ii/',
  complexity: 'O(n) time and O(24) space.',
  examples: [
    { label: 'Own case 1', input: '[13,13,31,25,25]' },
    { label: 'Own case 2', input: '[73,49,25,4]' },
    { label: "Single entry", input: "[1]" },
    { label: "Largest hours, tied", input: "[1000, 1000]" },
    { label: "Long run: 24 entries", input: "[5, 12, 7, 3, 9, 14, 2, 11, 8, 6, 10, 4, 13, 1, 15, 16, 3, 7, 9, 12, 5, 8, 2, 6]" },
  ],
}

export default function CompleteDayPairsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Hours" length={run.input.length} valueAt={i => run.input[i]} active={step.index} roleAt={i => (i < step.index ? 'seen' : '')} />
    <output aria-label="Remainders seen">{`Remainders seen (remainder: count): ${Object.entries(step.seen).map(([r, c]) => `${r}: ${c}`).join(', ') || 'none'}`}</output>
    <output aria-label="Complete-day pairs">{`Complete-day pairs so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the remainder of each hour modulo 24 matters, since adding 24 does not change whether a sum is a multiple of 24.</p>
    <p>For each hour, the earlier hours that complete it are exactly those whose remainder is 24 minus this remainder, taken modulo 24.</p>
  </>} />
}
