import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Check divisibility and count the cards.' },
    { id: 'run', label: 'Start groups', description: 'The smallest remaining card must start straights.' },
    { id: 'take', label: 'Take cards', description: 'Remove the needed copies of each card in the straight.' },
    { id: 'skip', label: 'Used up', description: 'A card with no copies left starts nothing.' },
    { id: 'fail', label: 'Missing card', description: 'A required card is short: the hand cannot be split.' },
    { id: 'done', label: 'Complete', description: 'Report whether the hand can be rearranged.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Hand and group size (JSON)',
  url: 'https://leetcode.com/problems/hand-of-straights/',
  complexity: 'O(n log n + n) time for sorting the distinct cards then at most n * groupSize card removals bounded by the hand; O(n) space for the counts.',
  examples: [
    { label: 'Example 1', input: '{"hand":[1,2,3,6,2,3,4,7,8],"groupSize":3}' },
    { label: 'Example 2', input: '{"hand":[1,2,3,4,5],"groupSize":4}' },
    { label: 'Missing card', input: '{"hand":[1,1,2,2,3,4],"groupSize":3}' },
  ],
}
export default function HandOfStraights() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Distinct cards" length={run.keys.length} active={step.card === null ? -1 : run.keys.indexOf(step.card)} valueAt={i => run.keys[i]}
      roleAt={i => (step.k === run.keys[i] ? 'taking' : '')} />
    <IndexedSequence label="Copies remaining" length={run.keys.length} active={step.k === null ? -1 : run.keys.indexOf(step.k)} valueAt={i => step.counts[i]} />
    <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result ? 'True' : 'False'}` : `Group size ${run.input.groupSize}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why greedy:</strong> the smallest remaining card cannot be the continuation of any straight (the card below it is gone), so it must begin one. Every copy of it begins its own group, forcing the next groupSize - 1 values.</p>
  </>} />
}
