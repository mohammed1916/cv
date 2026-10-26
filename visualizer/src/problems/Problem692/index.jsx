import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Tally every word.' },
    { id: 'rank', label: 'Rank', description: 'Keep the highest-ranked words, most frequent first.' },
    { id: 'done', label: 'Complete', description: 'Return the top k.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Words and k (JSON object)',
  url: 'https://leetcode.com/problems/top-k-frequent-words/',
  complexity: 'O(n log n) time for the sort; a heap of size k gives O(n log k).',
  examples: [
    { label: 'Ties alphabetical', input: '{"words":["i","love","leetcode","i","love","coding"],"k":2}' },
    { label: 'Four words', input: '{"words":["the","day","is","sunny","the","the","the","sunny","is","is"],"k":4}' },
  ],
}

export default function TopKWords() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title="Ranked so far" items={step.ranked} note={step.phase === 'done' ? 'final' : 'building'} />
    <output aria-label="Top words">{step.phase === 'done' ? `Top: ${step.result.join(', ')}` : 'Counting…'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Tie break:</strong> equal counts are ordered alphabetically, so the output is deterministic.</p>
  </>} />
}
