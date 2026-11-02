import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Budget', description: 'Start with the full budget and an empty result.' },
    { id: 'pick', label: 'Pick', description: 'Choose the smallest letter this position can afford.' },
    { id: 'done', label: 'Result', description: 'The smallest string within the budget.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase, 1 to 30 letters) and k (0 to 100)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-string-after-operations-with-constraint/',
  complexity: 'O(26 * n) time with the cost computed directly for each letter.',
  examples: [
    { label: 'Example 1', input: '{"s":"cbabc","k":2}' },
    { label: 'Example 2', input: '{"s":"xaxcd","k":4}' },
    { label: 'Example 3', input: '{"s":"lol","k":0}' },
  ],
}

export default function SmallestStringWithBudget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at} roleAt={i => (i < step.out.length ? 'done' : '')} />
    <output aria-label="Budget and result">{`budget left ${step.budget}, result so far "${step.out}"`}</output>
  </>} renderReasoning={() => <>
    <p>Positions are decided from left to right, so an earlier smaller letter always beats any later change. Each position takes the smallest letter whose cyclic distance still fits the remaining budget.</p>
  </>} />
}
