import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Seats', description: 'Each couple is the people (0, 1), (2, 3), and so on.' },
    { id: 'together', label: 'Together', description: 'The seat-mate already belongs to the same couple.' },
    { id: 'swap', label: 'Swap', description: 'Bring the partner next to the first person.' },
    { id: 'done', label: 'Complete', description: 'Return the number of swaps.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Row (JSON array: person sitting in each seat)',
  url: 'https://leetcode.com/problems/couples-holding-hands/',
  complexity: 'O(n) time and O(n) space for the position table.',
  examples: [
    { label: 'Crossed', input: '[2,3,0,1]' },
    { label: 'Mixed', input: '[5,4,2,6,3,1,0,7]' },
    { label: 'Settled', input: '[1,0,3,2]' }, { label: 'Single couple', input: '[1,0]' }, { label: 'Already seated', input: '[0,1,2,3]' }, { label: 'Reversed 30 seats', input: '[29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0]' }, { label: 'Long run: shuffled 30 seats', input: '[2,29,21,12,4,28,3,13,27,23,10,15,17,11,6,25,5,18,20,22,14,24,7,16,1,9,26,8,0,19]' },
  ],
}

export default function CouplesHoldingHands() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Seats (person in each seat; couple = person >> 1)" length={step.seats.length} active={step.pair ? step.pair[0] : -1}
      valueAt={i => step.seats[i]}
      roleAt={i => (step.swapped.includes(i) ? 'swapped' : step.pair && (i === step.pair[0] || i === step.pair[1]) ? 'pair' : '')} />
    <output aria-label="Step">{`${step.message} (input ${run.input.join(', ')})`}</output>
  </>} renderReasoning={() => <>
    <p>Seats are taken in pairs. If the second person is not the first person's partner, one swap brings the partner over.</p>
    <p>Each swap fixes one couple, so the total is the number of swaps needed to seat every couple together.</p>
  </>} />
}
