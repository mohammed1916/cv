import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the running count at zero.' },
    { id: 'count', label: 'Count words', description: 'Add one for each word that starts and ends with a vowel.' },
    { id: 'query', label: 'Queries', description: 'Subtract two running totals to get the count in a range.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with words (1 to 10 lowercase words) and queries ([l, r] pairs)',
  url: 'https://leetcode.com/problems/count-the-number-of-vowel-strings-in-range/',
  complexity: 'O(n + q) time after building the running counts. The visualization caps input at 10 words and 10 queries.',
  examples: [
    { label: 'Example 1', input: '{"words":["aba","bcb","ece","aa","e"],"queries":[[0,2],[1,4],[1,1]]}' },
    { label: 'Example 2', input: '{"words":["a","e","i"],"queries":[[0,2],[0,1],[2,2]]}' },
  ],
}

export default function VowelStringsInRange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="words" length={run.input.words.length} valueAt={index => run.input.words[index]} active={step.index}
      roleAt={index => step.range && index >= step.range[0] && index <= step.range[1] ? 'in range' : step.flags?.[index] ? 'vowel' : ''} />
    <output aria-label="Running totals">{`Running totals: ${step.running.join(', ')}`}</output>
  </>} renderReasoning={() => <>
    <p>A running total turns any range count into one subtraction: the count from l to r is running[r + 1] minus running[l].</p>
    <p>Each word is checked once, so the queries cost nothing beyond their subtraction.</p>
  </>} />
}
