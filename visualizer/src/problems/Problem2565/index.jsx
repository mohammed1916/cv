import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Prefix', description: 'Start the greedy prefix match at the front of s.' },
    { id: 'prefix', label: 'Prefix', description: 'Match t from the left as far as s allows.' },
    { id: 'suffix', label: 'Suffix', description: 'Match t from the right as far as s allows.' },
    { id: 'pair', label: 'Cut', description: 'A prefix of t and a suffix of t meet inside s.' },
    { id: 'done', label: 'Result', description: 'Report the smallest score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and t',
  url: 'https://leetcode.com/problems/subsequence-with-the-minimum-score/',
  complexity: 'O(n * m) time for the pair scan with prefix and suffix tables. The visualization caps s at 14 and t at 12 characters.',
  examples: [
    { label: 'Example', input: '{"s":"abacaba","t":"bzaa"}' },
    { label: 'No overlap', input: '{"s":"cde","t":"xyz"}' },
    { label: 'Already there', input: '{"s":"ace","t":"ae"}' },
  ],
}

export default function MinimumScoreSubsequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={-1} />
    <IndexedSequence label="t" length={run.input.t.length} valueAt={i => run.input.t[i]} active={step.j >= 0 ? step.j : (step.l > 0 ? step.l - 1 : -1)}
      roleAt={i => (step.l >= 0 && i < step.l ? 'prefix' : step.j >= 0 && i >= step.j ? 'suffix' : step.l >= 0 && step.j >= 0 && i >= step.l && i < step.j ? 'removed' : '')} />
    <output aria-label="Cut">{step.l >= 0 && step.j >= 0 ? `Remove t[${step.l}..${step.j}), score ${step.j - step.l}` : 'Prefix from the left, suffix from the right.'}</output>
  </>} renderReasoning={() => <>
    <p>Keep the characters of t that match s from the left, and those that match from the right. The removed span is whatever lies between them.</p>
    <p>For each prefix length, the earliest suffix that still fits after it gives the cheapest cut.</p>
  </>} />
}
