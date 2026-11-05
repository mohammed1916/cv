import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order players and trainers by ability.' },
    { id: 'match', label: 'Match', description: 'The trainer is at least as strong as the next player.' },
    { id: 'skip', label: 'Skip', description: 'The trainer is too weak for the next player.' },
    { id: 'done', label: 'Complete', description: 'Report the number of matches.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with players and trainers (1 to 8 abilities each, 1 to 20)',
  url: 'https://leetcode.com/problems/maximum-matching-of-players-with-trainers/',
  complexity: 'O(n log n + m log m) time for n players and m trainers. The visualization caps each list at 8.',
  examples: [
    { label: 'Mixed', input: '{"players":[5,2,9,3],"trainers":[4,10,1,6]}' },
    { label: 'Weak trainers', input: '{"players":[6,6],"trainers":[2,3]}' },
  ],
}

export default function PlayersAndTrainers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Sorted players (next = weakest unmatched)" length={step.ps.length} valueAt={index => step.ps[index]}
      active={step.next < step.ps.length ? step.next : -1} roleAt={index => (index < step.next ? 'matched' : '')} />
    <IndexedSequence label="Sorted trainers (current trainer marked)" length={step.ts.length} valueAt={index => step.ts[index]}
      active={step.ts.indexOf(step.trainer)} roleAt={index => (index < step.ts.indexOf(step.trainer) ? 'passed' : '')} />
    <output aria-label="Trainer">{`Current trainer: ${step.trainer === -1 ? 'none' : step.trainer}; matches: ${step.matches}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Matching the weakest player each trainer can handle keeps the strongest players available for the strongest trainers.</p>
    <p>A trainer who cannot train the weakest remaining player cannot train anyone else left, so skipping that trainer loses nothing.</p>
  </>} />
}
