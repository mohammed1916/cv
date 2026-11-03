import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'block', label: 'Blocks', description: 'Find a rotation that matches each block to its sorted slice.' },
    { id: 'divisor', label: 'Divisor', description: 'Decide whether this block length is sortable.' },
    { id: 'done', label: 'Result', description: 'Report the sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, a list of integers from 1 to 20',
  url: 'https://leetcode.com/problems/sum-of-sortable-integers/',
  complexity: 'This visual tries each rotation of each block: at most n times k checks per divisor. The visual caps nums at 12 values.',
  examples: [
    { label: 'Example A', input: '{"nums":[3,1,2]}' },
    { label: 'Example B', input: '{"nums":[7,6,5]}' },
  ],
}

export default function SumOfSortableIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section className="algorithm-sequence" aria-label="Current block">
      <h3>{step.k ? `Block length k = ${step.k}` : 'Divisors'}</h3>
      <div className="algorithm-sequence__cells">{(step.block || run.input.nums).map((v, i) => (
        <div key={i} className="algorithm-sequence__cell" data-role={step.block ? 'window' : ''}>
          <small>[{i}]</small><strong>{v}</strong><span>{step.want ? `target ${step.want[i]}` : ''}</span>
        </div>))}</div>
    </section>
    <output aria-label="Sum so far">{`Total ${step.total}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Sorting the whole array means every block must hold exactly the sorted values for its positions, and it must be a rotation of them.</p>
    <p>A divisor counts only when every block works, and the answer sums those divisors.</p>
  </>} />
}
