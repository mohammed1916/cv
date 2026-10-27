import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Four cards', description: 'Start with the four numbers.' },
    { id: 'try', label: 'Try a combination', description: 'Combine two numbers and recurse on the rest.' },
    { id: 'done', label: 'Complete', description: 'Report the expression or failure.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Four cards (JSON array of integers 1–9)',
  url: 'https://leetcode.com/problems/24-game/',
  complexity: 'Constant for four cards: at most 6 pairs × 6 operations at each of 3 levels, about 4 000 combinations.',
  examples: [
    { label: 'Classic', input: '[4,1,8,7]' },
    { label: 'Impossible', input: '[1,2,1,2]' },
    { label: 'Division', input: '[8,3,8,3]' },
  ],
}

export default function TwentyFourGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title="Numbers left" items={step.values} note={step.phase === 'done' ? (step.result ? 'solved' : 'no solution') : 'combining'} />
    <output aria-label="Expression">{step.phase === 'done' ? (step.found ? `${step.found} = 24` : 'No expression reaches 24') : `Trying ${step.attempt ?? '…'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Completeness:</strong> any expression tree over four numbers has a pair of leaves combined first, so trying every pair and operation covers every possibility.</p>
  </>} />
}
