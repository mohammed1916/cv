import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is waiting yet.' },
    { id: 'wait', label: 'Wait', description: 'No waiting value matches, so this one waits.' },
    { id: 'pair', label: 'Pair', description: 'A waiting value matches, so both leave the waiting set.' },
    { id: 'done', label: 'Complete', description: 'Report pairs and leftover.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integers 0 to 20 as a JSON array',
  url: 'https://leetcode.com/problems/maximum-number-of-pairs-in-array/',
  complexity: 'O(n) time and O(n) space.',
  examples: [
    { label: 'Seven numbers', input: '[5,1,5,3,1,1,0]' },
    { label: 'Three equal values', input: '[4,4,4]' },
    { label: 'Single zero', input: '[0]' },
    { label: 'Single maximum value', input: '[20]' },
    { label: 'Equal values pair up', input: '[2,2,2,2]' },
    { label: 'Longest list, all equal', input: '[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]' },
    { label: 'Long run: 20 values', input: '[3,12,15,6,12,0,8,7,8,1,20,18,9,1,10,13,5,18,7,12]' },
  ],
}

export default function MaximumNumberOfPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} valueAt={i => run.input[i]} active={step.index} roleAt={i => (i < step.index ? 'seen' : '')} />
    <output aria-label="Waiting values">{`Waiting: [${step.waiting.join(', ')}] · Pairs: ${step.pairs}`}</output>
  </>} renderReasoning={() => <>
    <p>Two equal values can always be paired, and a value only needs one partner, so a waiting set that toggles is enough.</p>
    <p>Each value is either paired with an earlier waiting copy or waits itself, so the waiting set at the end is the leftover.</p>
  </>} />
}
