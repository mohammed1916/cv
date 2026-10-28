import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'The empty prefix costs nothing.' },
    { id: 'position', label: 'Position', description: 'Extend every word that matches at this position.' },
    { id: 'done', label: 'Complete', description: 'Report the cost of the whole target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object {"target": string, "words": [...], "costs": [...]}',
  url: 'https://leetcode.com/problems/construct-string-with-minimum-cost/',
  complexity: 'O(n * w * L) time for n target letters, w words and word length L. The visualization caps the target at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"target": "abcdef", "words": ["abdef", "abc", "d", "def", "ef"], "costs": [100, 1, 1, 10, 5]}' },
    { label: 'Repeated word', input: '{"target": "aaaa", "words": ["a"], "costs": [2]}' },
  ],
}

export default function ConstructStringMinimumCost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Cheapest cost to build each prefix" values={[step.best]} columnLabels={step.best.map((_, p) => p)}
      activeCell={step.index >= 0 && step.index < step.best.length ? { row: 0, column: step.index } : null} />
    <output aria-label="Target">{`Target ${run.input.target}, position ${step.index >= 0 && step.index < run.input.target.length ? step.index : 'end'}`}</output>
    <output aria-label="Result">{step.result === null ? step.message : `Answer: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>The cheapest way to build a prefix is the cheapest way to build a shorter prefix plus one matching word. Each prefix is therefore final once every shorter prefix before it is settled.</p>
    <p>Words may be reused, so each matching word simply offers another edge from the current position.</p>
  </>} />
}
