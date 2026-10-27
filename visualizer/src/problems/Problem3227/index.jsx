import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing scanned yet.' },
    { id: 'scan', label: 'Scan', description: 'Check each letter for a vowel.' },
    { id: 'vowel', label: 'Vowel found', description: 'The first vowel settles the game in Alice’s favor.' },
    { id: 'done', label: 'Complete', description: 'Report the winner.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters), for example {"s":"leetcoder"}',
  url: 'https://leetcode.com/problems/vowels-game-in-a-string/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"s":"leetcoder"}' },
    { label: 'Example 2', input: '{"s":"bbcd"}' },
  ],
}

export default function VowelsGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index} roleAt={i => (i === step.index && step.phase === 'vowel' ? 'vowel' : '')} />
    <output aria-label="Found">{step.found ? 'A vowel is present: Alice wins.' : 'No vowel found yet.'}</output>
  </>} renderReasoning={() => <>
    <p>With an odd number of vowels, Alice removes the whole string and Bob has no move. With an even, positive number, Alice removes a single vowel substring and leaves Bob with a position that has the same winning pattern.</p>
    <p>Without any vowel, Alice has no move at all, so she loses.</p>
  </>} />
}
