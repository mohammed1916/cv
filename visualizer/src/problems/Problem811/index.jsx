import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the count-paired domains.' },
    { id: 'parse', label: 'Split entry', description: 'Separate the count from the domain.' },
    { id: 'credit', label: 'Credit suffix', description: 'Add the count to one dot-suffix.' },
    { id: 'done', label: 'Complete', description: 'Emit "count domain" strings.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array cpdomains (JSON)',
  url: 'https://leetcode.com/problems/subdomain-visit-count/',
  complexity: 'O(total characters) time with a hash map of at most (entries * labels) keys.',
  examples: [
    { label: 'Example 1', input: '["9001 discuss.leetcode.com"]' },
    { label: 'Example 2', input: '["900 google.mail.com","50 yahoo.com","1 intel.mail.com","5 wiki.org"]' },
    { label: 'Single label', input: '["7 com","3 a.com"]' },
  ],
}
export default function SubdomainVisitCount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="cpdomains" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => i < step.index ? 'done' : ''} />
    <IndexedSequence label="Hash map counts (insertion order)" length={step.entries.length} active={step.entries.findIndex(([d]) => d === step.sub)} valueAt={i => `${step.entries[i][0]}: ${step.entries[i][1]}`} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why suffixes:</strong> "a.b.c" is visited whenever "b.c" or "c" is visited as its parent, so the count flows up every dot boundary, and a hash map merges entries that share a suffix.</p>
  </>} />
}
