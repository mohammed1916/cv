import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, matchCount } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'All words are candidates for the secret.' },
    { id: 'choose', label: 'Pick guess', description: 'Choose the word with the smallest worst-case bucket.' },
    { id: 'ask', label: 'Ask master', description: 'Receive the match count and filter the candidates.' },
    { id: 'done', label: 'Complete', description: 'Report whether the secret was found in time.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Words, secret and guess budget (JSON)',
  url: 'https://leetcode.com/problems/guess-the-word/',
  complexity: 'Each round costs O(W^2 * L) to score all candidates and the candidate list shrinks every round. Reduced version: the hidden master is simulated by supplying the secret in the input.',
  examples: [
    { label: 'Example 1', input: '{"words":["acckzz","ccbazz","eiowzz","abcczz"],"secret":"acckzz","allowedGuesses":10}' },
    { label: 'Larger list', input: '{"words":["gaxckt","trlccr","jxwtrh","xzsxuw","xjzcrf","pzvnqn","brnrbz","ydcmxe","wyqwck","edfrch"],"secret":"xjzcrf","allowedGuesses":10}' },
    { label: 'Tight budget', input: '{"words":["abcdef","abcdez","abcdzz","abczzz","abzzzz","azzzzz"],"secret":"azzzzz","allowedGuesses":2}' },
  ],
}
export default function GuessTheWord() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Candidate words" length={step.cand.length} active={step.guess ? step.cand.indexOf(step.guess) : -1} valueAt={i => step.cand[i]}
      roleAt={i => (step.guess && step.m !== undefined && step.cand[i] !== step.guess ? `${matchCount(step.cand[i], step.guess)} match` : '')} />
    {step.worst && <IndexedSequence label="Largest bucket per candidate (smaller is better)" length={step.worst.length} active={step.cand.indexOf(step.guess)} valueAt={i => step.worst[i]} />}
    <output aria-label="Guesses">Guesses used: {step.guesses} / {run.input.allowed}{step.m !== undefined ? ` | last match count ${step.m}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why minimax:</strong> a guess partitions candidates by match count with it. The worst case is the biggest group, so choosing the guess with the smallest largest group shrinks the candidates fastest even with unlucky answers.</p>
    <p><strong>Why filtering is exact:</strong> the secret has the observed match count with the guess, so it can only be among words with that same count against the guess.</p>
  </>} />
}
