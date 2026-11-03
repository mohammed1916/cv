import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, costOf } from './algorithm'

const definition = {
  phases: [
    { id: 'cost', label: 'Costs', description: 'Price each interior index.' },
    { id: 'dp', label: 'Choose', description: 'Decide whether to make this index special.' },
    { id: 'done', label: 'Result', description: 'Report the minimum raises.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, a list of integers from 0 to 20',
  url: 'https://leetcode.com/problems/minimum-increase-to-maximize-special-indices/',
  complexity: 'O(n) time for the costs and the two-step DP. The visual caps nums at 12 values.',
  examples: [
    { label: 'Example A', input: '{"nums":[1,2,2]}' },
    { label: 'Example B', input: '{"nums":[2,1,1,3]}' },
  ],
}

export default function MinimumIncreaseToMaximizeSpecialIndices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section className="algorithm-sequence" aria-label="Values and raise costs">
      <h3>Values and raise cost</h3>
      <div className="algorithm-sequence__cells">{run.input.nums.map((v, i) => (
        <div key={i} className={`algorithm-sequence__cell ${i === step.k ? 'is-active' : ''}`} data-role={step.best && step.best.chosen.includes(i) ? 'window' : ''}>
          <small>[{i}]</small><strong>{v}</strong><span>{i > 0 && i < run.input.nums.length - 1 ? `cost ${costOf(run.input.nums, i)}` : 'edge'}</span>
        </div>))}</div>
    </section>
    <output aria-label="Best choice so far">{step.best ? `Special ${step.best.count}, cost ${step.best.cost}. ${step.message}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Two special indices cannot be neighbours, because each would have to be larger than the other. So the choice is a set of interior positions with gaps between them.</p>
    <p>Raising a value only ever helps that position itself, so each chosen index is priced as the raise needed to beat its larger neighbour.</p>
  </>} />
}
