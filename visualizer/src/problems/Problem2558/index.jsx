import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Piles', description: 'Every pile starts in the max heap.' },
    { id: 'take', label: 'Take', description: 'Take the richest pile and leave the floor of its square root.' },
    { id: 'done', label: 'Complete', description: 'Sum the gifts left.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"gifts": [...], "k": seconds}',
  url: 'https://leetcode.com/problems/take-gifts-from-the-richest-pile/',
  complexity: 'O(k log n) time with a max heap. The visualization caps input at 6 piles and 8 seconds.',
  examples: [
    { label: 'Example 1', input: '{"gifts":[25,64,9,4,100],"k":4}' },
    { label: 'Example 2', input: '{"gifts":[1,1,1,1],"k":4}' },
  ],
}

export default function RichestPile() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Piles" length={step.piles.length} valueAt={i => step.piles[i]} active={step.picked} />
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each second the richest pile is the only one that changes, so a max heap always gives the pile to reduce.</p>
    <p>Taking the square root shrinks large piles quickly, which is why the total falls fast even for large counts.</p>
  </>} />
}
