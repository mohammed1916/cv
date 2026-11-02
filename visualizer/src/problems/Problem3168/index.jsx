import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The waiting room is empty.' },
    { id: 'arrive', label: 'Arrive', description: 'Someone enters and may raise the peak.' },
    { id: 'leave', label: 'Leave', description: 'Someone leaves the waiting room.' },
    { id: 'done', label: 'Result', description: 'The peak is the chair count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON string of E (enter) and L (leave) letters, 1 to 50 long',
  url: 'https://leetcode.com/problems/minimum-number-of-chairs-in-a-waiting-room/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '"EEEEEEE"' },
    { label: 'Example 2', input: '"ELELEEL"' },
    { label: 'Example 3', input: '"ELEELEELLL"' },
  ],
}

export default function WaitingRoomChairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="events" length={run.input.length} valueAt={i => run.input[i]} active={step.at} roleAt={i => (i === step.at ? 'event' : '')} />
    <output aria-label="Waiting count">{`waiting now ${step.current}, peak ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Chairs must cover the largest number of people waiting at the same moment. Each E raises the count, each L lowers it, and the running peak is the answer.</p>
  </>} />
}
