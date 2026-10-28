import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Sort the pizzas heaviest first.' },
    { id: 'odd', label: 'Odd day', description: 'Gain the heaviest remaining pizza.' },
    { id: 'even', label: 'Even day', description: 'Discard the heaviest remaining pizza and gain the next.' },
    { id: 'done', label: 'Complete', description: 'Report the total weight gained.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 4, 8 or 12 pizza weights from 1 to 50 (JSON)',
  url: 'https://leetcode.com/problems/eat-pizzas/',
  complexity: 'O(n log n) for the sort. The visualization caps input at 12 pizzas.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,4,5,6,7,8]' },
    { label: 'Example 2', input: '[4,4,4,4]' },
  ],
}

export default function EatPizzas() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Pizzas, heaviest first" length={step.ranked.length} valueAt={i => step.ranked[i]}
      active={step.gain ?? -1}
      roleAt={i => (i === step.partner ? 'discarded' : step.gained.includes(i) ? 'gained' : '')} />
    <output aria-label="Weight gained so far">{`Day ${step.day}, total gained ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Odd days gain the heaviest pizza they eat, and even days gain the second heaviest, so the largest pizzas are best spent as odd-day gains.</p>
    <p>Each even day must also eat a heavier pizza that is not counted. Pairing the leftover pizzas in order lets every even day discard the pizza just above its gain.</p>
  </>} />
}
