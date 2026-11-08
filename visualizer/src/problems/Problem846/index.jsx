import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Check divisibility and count the cards.' },
    { id: 'run', label: 'Start groups', description: 'The smallest remaining card must start straights.' },
    { id: 'take', label: 'Take cards', description: 'Remove the needed copies of each card in the straight.' },
    { id: 'skip', label: 'Used up', description: 'A card with no copies left starts nothing.' },
    { id: 'fail', label: 'Missing card', description: 'A required card is short: the hand cannot be split.' },
    { id: 'done', label: 'Complete', description: 'Report whether the hand can be rearranged.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Hand and group size (JSON)',
  url: 'https://leetcode.com/problems/hand-of-straights/',
  complexity: 'O(n log n + n) time for sorting the distinct cards then at most n * groupSize card removals bounded by the hand; O(n) space for the counts.',
  examples: [
    { label: 'Own case 1', input: '{"hand":[2,3,4,7,3,4,5,8,9],"groupSize":4}' },
    { label: 'Own case 2', input: '{"hand":[2,3,4,5,6],"groupSize":5}' },
    { label: 'Missing card', input: '{"hand":[1,1,2,2,3,4],"groupSize":3}' },
    { label: 'Single card, group of one', input: '{"hand":[5],"groupSize":1}' },
    { label: 'Equal cards form one group', input: '{"hand":[2,2,2,2],"groupSize":2}' },
    { label: 'Largest hand, one long run', input: '{"hand":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60],"groupSize":60}' },
    { label: 'Long run: 60 cards, groups of 6', input: '{"hand":[872,356,39,609,247,383,459,165,641,614,741,726,876,855,693,266,908,940,722,511,107,544,44,548,464,498,994,175,490,553,99,109,531,636,205,356,881,700,794,165,255,168,465,709,343,591,250,110,206,572,4,179,94,716,250,205,699,295,936,669],"groupSize":6}' },
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
