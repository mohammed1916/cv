import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Letters', description: 'Count every letter across all words.' },
    { id: 'pairs', label: 'Pairs', description: 'Each two matching letters form one pair.' },
    { id: 'take', label: 'Take', description: 'This word fits with the letters and pairs left.' },
    { id: 'stop', label: 'Stop', description: 'This word and the longer ones cannot all fit.' },
    { id: 'done', label: 'Result', description: 'The number of palindromes that can be formed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of 1 to 6 lowercase words, each up to 6 letters',
  url: 'https://leetcode.com/problems/maximum-palindromes-after-operations/',
  complexity: 'O(N + k log k) time, where N is the total number of letters and k is the number of words.',
  examples: [
    { label: 'Example 1', input: '["abbb","ba","aa"]' },
    { label: 'Example 2', input: '["abc","ab"]' },
  ],
}

export default function MaximumPalindromes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Letter budget">{`letters used ${step.usedLen} of ${step.total}, pairs used ${step.usedPairs} of ${step.pairs ?? '?'}`}</output>
    <output aria-label="Palindromes counted">{`palindromes counted: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Swaps can move any letter to any position in any word, so only the multiset of letters matters. A palindrome of length L needs floor(L / 2) pairs, and the total letters must cover the chosen words.</p>
    <p>Taking the shortest words first is best, so the answer is the longest prefix of sorted lengths that fits both budgets.</p>
  </>} />
}
