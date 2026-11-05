import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DisjointSetView from '../../components/shared/DisjointSetView'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Single words', description: 'Each word starts in its own group.' },
    { id: 'union', label: 'Pairs', description: 'Each pair merges the two groups.' },
    { id: 'match', label: 'Compare', description: 'Each position needs equal words or a shared group.' },
    { id: 'mismatch', label: 'Mismatch', description: 'This position has no chain of pairs.' },
    { id: 'done', label: 'Complete', description: 'Return the verdict.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'sentence1, sentence2 and pairs (JSON object)',
  url: 'https://leetcode.com/problems/sentence-similarity-ii/',
  complexity: 'O((n + p) * α) time with union-find, where p is the number of pairs.',
  examples: [
    { label: 'Chain', input: '{"sentence1":["cat","sees","fish"],"sentence2":["dog","notices","shark"],"pairs":[["cat","dog"],["sees","notices"],["fish","shark"]]}' },
    { label: 'Broken', input: '{"sentence1":["red","car"],"sentence2":["blue","car"],"pairs":[["red","green"]]}' },
  ],
}

export default function SentenceSimilarityII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DisjointSetView parent={step.parent} size={step.size} labels={run.labels} />
    {run.input.sentence1.length === run.input.sentence2.length && <RecordStateTable label="Sentence positions" columns={['position', 'word 1', 'word 2']}
      rows={run.input.sentence1.map((a, i) => ({ position: i, 'word 1': a, 'word 2': run.input.sentence2[i] }))} activeRow={step.i} />}
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Similarity is transitive through the pairs: if cat is like dog and dog is like pup, then cat is like pup. Union-find keeps those groups.</p>
    <p>After all pairs are merged, each position must hold equal words or two words in the same group.</p>
  </>} />
}
