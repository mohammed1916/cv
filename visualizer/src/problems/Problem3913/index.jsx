import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'String s (JSON)',
  url: 'https://leetcode.com/problems/sort-vowels-by-frequency/',
  complexity: 'O(n) time and O(n) space. Only five vowel kinds need ranking. Every execution step is retained; long sequences are paged.',
  examples: [{ label: 'leetcode', input: '"leetcode"' }, { label: 'Many vowels', input: '"aeiaaioooa"' }, { label: 'First-occurrence tie', input: '"uoaei"' }, { label: 'No vowels', input: '"rhythm"' }],
}
export default function SortVowelsByFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Original characters" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => run.ordinal[i] >= 0 ? 'vowel' : 'fixed'} />
    <IndexedSequence label="Vowel placement" length={run.input.length} active={step.index}
      valueAt={i => run.ordinal[i] >= 0 && run.ordinal[i] < step.placed ? run.result[i] : run.input[i]}
      roleAt={i => run.ordinal[i] < 0 ? 'fixed' : run.ordinal[i] < step.placed ? 'written' : 'pending'} />
    {step.phase === 'done' && <output aria-label="Result">{run.result}</output>}
  </>} renderReasoning={({ run, step }) => <>
    <table><caption>Vowel counts {step.phase === 'count' ? 'so far' : ''}</caption><thead><tr><th>Vowel</th><th>Count</th><th>First index</th></tr></thead>
      <tbody>{[...'aeiou'].map((v, i) => <tr key={v}><th>{v}</th><td>{step.counts[i]}</td><td>{step.counts[i] ? run.first[i] : 'not seen'}</td></tr>)}</tbody></table>
    {['rank', 'write', 'done'].includes(step.phase) && <p>Ranked groups: {run.order.join(' → ') || 'none'}.</p>}
    <p>Only vowel positions can change. Equal-frequency groups keep their first-occurrence order.</p>
  </>} />
}
