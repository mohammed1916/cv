import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pairs', description: 'Count the AND of every ordered pair.' },
    { id: 'pairs', label: 'Pair counts', description: 'Group the pairs by their AND value.' },
    { id: 'match', label: 'Match a value', description: 'Count the pairs that share no bit with this value.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON array)',
  url: 'https://leetcode.com/problems/triples-with-bitwise-and-equal-to-zero/',
  complexity: 'O(n^2 + n * distinct pair values) time. The visualization caps input at 12 numbers.',
  examples: [
    { label: 'Example 1', input: '[2,1,3]' },
    { label: 'All zero', input: '[0,0,0]' },
  ],
}

export default function TriplesAndZero() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Pair AND values (value : count)" length={step.pairs.length}
      valueAt={i => `${step.pairs[i][0]} : ${step.pairs[i][1]}`} />
    <output aria-label="Total">{`Running total: ${step.total}${step.value === null ? '' : `, matching value ${step.value}`}`}</output>
  </>} renderReasoning={() => <>
    <p>Looping over every triple is cubic. Instead, count the AND of each pair once; a triple is zero exactly when the pair’s AND shares no bit with the third number.</p>
    <p>Each third number then checks each distinct pair value once.</p>
  </>} />
}
