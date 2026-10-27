import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Words to merge.' },
    { id: 'overlap', label: 'Overlaps', description: 'Compute pairwise suffix/prefix overlaps.' },
    { id: 'dp', label: 'Subset DP', description: 'Process each subset and relax supersets.' },
    { id: 'pick', label: 'Best end', description: 'Choose the last word with maximum overlap.' },
    { id: 'backtrack', label: 'Backtrack', description: 'Follow parent pointers to recover the order.' },
    { id: 'build', label: 'Build string', description: 'Append each word minus its overlap.' },
    { id: 'done', label: 'Complete', description: 'Return the superstring.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Words (JSON array)',
  url: 'https://leetcode.com/problems/find-the-shortest-superstring/',
  complexity: 'O(2^n * n^2) time, O(2^n * n) space. The visualization caps words at 8.',
  examples: [
    { label: 'Example 1', input: '["alex","loves","leetcode"]' },
    { label: 'Example 2', input: '["catg","ctaagt","gcta","ttca","atgcatc"]' },
    { label: 'Overlaps', input: '["abc","bcd","cde"]' },
  ],
}

export default function ShortestSuperstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`dp[mask=${step.mask.toString(2).padStart(run.input.length, '0')}][last] (best overlap)`} length={run.input.length}
      valueAt={i => step.row[i]} active={step.last ?? -1} roleAt={i => step.mask >> i & 1 ? 'match' : ''} />
    <IndexedSequence label="Words (index = bit position)" length={run.input.length} valueAt={i => run.input[i]}
      roleAt={i => step.order?.includes(i) ? 'left' : ''} />
    {step.ov && <DPTable title="Overlap ov[i][j]" values={step.ov} rowLabels={run.input} columnLabels={run.input} />}
    <output aria-label="Superstring">{step.res ? `Built: ${step.res}` : step.order ? `Order: ${step.order.map(i => run.input[i]).join(' -> ')}` : 'Superstring not built yet'}</output>
  </>} renderReasoning={() => <>
    <p>Since no word contains another, a shortest superstring is some ordering of the words with consecutive words merged by their maximal overlap. Maximizing total overlap minimizes length.</p>
    <p>dp[mask][last] is the best overlap using exactly the words in mask, ending with last, which is the travelling-salesman DP; parent pointers rebuild the order.</p>
  </>} />
}
