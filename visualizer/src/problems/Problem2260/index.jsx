import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty table', description: 'No card has been seen yet.' },
    { id: 'scan', label: 'New card', description: 'Record this card’s index for later.' },
    { id: 'match', label: 'Repeat found', description: 'Measure the run from the last copy to here.' },
    { id: 'done', label: 'Best run', description: 'Report the shortest run, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Cards as JSON: {"cards": [...]}',
  url: 'https://leetcode.com/problems/minimum-consecutive-cards-to-pick-up/',
  complexity: 'O(n) time and O(n) space for the last-seen table. The visualization caps input at 20 cards.',
  examples: [
    { label: 'Example 1', input: '{"cards":[3,4,2,3,4,7]}' },
    { label: 'Example 2', input: '{"cards":[1,0,5,3]}' },
  ],
}

export default function ConsecutiveCards() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Cards" length={run.input.cards.length} valueAt={i => run.input.cards[i]} active={step.index}
      roleAt={i => (step.runStart >= 0 && i >= step.runStart && i <= step.index ? 'run' : '')} />
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Best run">{`Best run: ${step.best === -1 ? 'none yet' : step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the latest copy of each value matters, because the nearest earlier copy always makes the shortest run ending here.</p>
    <p>Each card is read once, and each lookup is a single hash map step.</p>
  </>} />
}
