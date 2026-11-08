import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the count-paired domains.' },
    { id: 'parse', label: 'Split entry', description: 'Separate the count from the domain.' },
    { id: 'credit', label: 'Credit suffix', description: 'Add the count to one dot-suffix.' },
    { id: 'done', label: 'Complete', description: 'Emit "count domain" strings.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array cpdomains (JSON)',
  url: 'https://leetcode.com/problems/subdomain-visit-count/',
  complexity: 'O(total characters) time with a hash map of at most (entries * labels) keys.',
  examples: [
    { label: 'Own case 1', input: '["1223 fkuewuu.nggveqfg.eqo"]' },
    { label: 'Own case 2', input: '["122 iqqing.ockn.eqo","72 acjqq.eqo","3 kpvgn.ockn.eqo","7 ykmk.qti"]' },
    { label: 'Single label', input: '["7 com","3 a.com"]' },
    { label: 'Single count', input: '["1 x"]' },
    { label: 'Equal counts for different domains', input: '["5 a.com","5 b.com"]' },
    { label: 'Largest count and deepest domain', input: '["999999 a.b.c.d"]' },
    { label: 'Long run: 10 domains', input: '["4381 b.c.d.org","6429 x.y.z","4206 b.c.d.org","1602 b.c.d.org","9594 b.c.d.org","1275 a.com","379 b.c.d.org","85 mail.google.com","328 org","6092 com"]' },
  ],
}
export default function SubdomainVisitCount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="cpdomains" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => i < step.index ? 'done' : ''} />
    <IndexedSequence label="Hash map counts (insertion order)" length={step.entries.length} active={step.entries.findIndex(([d]) => d === step.sub)} valueAt={i => `${step.entries[i][0]}: ${step.entries[i][1]}`} />
    <HashMapView maps={[{ name: 'counts', isSet: false, keyLabel: 'domain', valueLabel: 'count', entries: step.entries }]} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why suffixes:</strong> "a.b.c" is visited whenever "b.c" or "c" is visited as its parent, so the count flows up every dot boundary, and a hash map merges entries that share a suffix.</p>
  </>} />
}
