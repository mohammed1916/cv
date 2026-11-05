import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'build', label: 'Index words', description: 'Each word is stored under every one-letter wildcard pattern.' },
    { id: 'probe', label: 'Probe a pattern', description: 'Wildcard one letter of the query and look for a different stored word.' },
    { id: 'answer', label: 'Answer query', description: 'A different stored word means exactly one letter can be changed.' },
    { id: 'done', label: 'Results', description: 'One boolean per query.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Words and queries (JSON object)',
  url: 'https://leetcode.com/problems/implement-magic-dictionary/',
  complexity: 'Building costs O(total letters) for the words; each query costs O(length²) in the worst case using set membership per pattern.',
  examples: [
    { label: 'One change', input: '{"words":["cart","dog"],"queries":["card","cart","dig"]}' },
    { label: 'Near words', input: '{"words":["tea","team"],"queries":["teem","tead","team"]}' },
    { label: 'Swapped letters', input: '{"words":["ab"],"queries":["ac","ba"]}' },
  ],
}

export default function MagicDictionary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecordStateTable label={step.query ? `Query ${step.query}: wildcard pattern` : 'Query'} columns={['pattern', 'stored words', 'result']}
      rows={step.pattern ? [{ pattern: step.pattern, 'stored words': step.bucket.join(', ') || 'none', result: step.matched ? 'match' : 'no match' }] : []} />
    <RecordStateTable label="Answers so far" columns={['query', 'answer']}
      rows={run.input.queries.slice(0, step.results.length).map((query, i) => ({ query, answer: String(step.results[i]) }))} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why wildcards:</strong> two words differ in exactly one letter exactly when they share a pattern with one position wildcarded, so one lookup per position is enough.</p>
  </>} />
}
