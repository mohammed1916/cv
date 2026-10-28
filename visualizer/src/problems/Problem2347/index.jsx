import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Look at the five cards.' },
    { id: 'flush', label: 'Suits', description: 'Check whether every suit matches.' },
    { id: 'rank', label: 'Ranks', description: 'Count how many cards share each rank.' },
    { id: 'done', label: 'Complete', description: 'Grade the hand.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with ranks (five integers 1 to 13) and suits (five letters a to d)',
  url: 'https://leetcode.com/problems/best-poker-hand/',
  complexity: 'O(1) time, since a hand has five cards.',
  examples: [
    { label: 'Flush', input: '{"ranks":[13,2,3,1,9],"suits":["a","a","a","a","a"]}' },
    { label: 'Pair', input: '{"ranks":[4,4,2,6,10],"suits":["a","b","c","d","a"]}' },
  ],
}

export default function BestPokerHand() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="ranks" length={run.input.ranks.length} valueAt={i => run.input.ranks[i]} active={step.index ?? -1}
      roleAt={i => run.input.suits[i]} />
    <p aria-label="Hand">{`Suits all match: ${step.flush === null ? '(not yet)' : String(step.flush)}; largest rank group: ${step.most ?? '(not yet)'}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A flush needs one suit throughout, which outranks every pair-based hand.</p>
    <p>Otherwise the hand is graded by its largest group of equal ranks: three or more is a triple, two is a pair, and one is high card.</p>
  </>} />
}
