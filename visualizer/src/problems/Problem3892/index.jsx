import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'candidate', label: 'Candidates', description: 'Try one set of non-adjacent peaks.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest set.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (circular, 3 to 10 values) and k',
  url: 'https://leetcode.com/problems/minimum-operations-to-achieve-at-least-k-peaks/',
  complexity: 'This visual enumerates subsets of positions: O(2^n * n). A dynamic programme around the circle would be needed for large inputs. The visual caps nums at 10 values.',
  examples: [
    { label: 'Example A', input: '{"nums":[3,1,3],"k":1}' },
    { label: 'Example B', input: '{"nums":[1,5,2,6,3],"k":2}' },
  ],
}

export default function MinimumOperationsToAchieveAtLeastKPeaks() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section className="algorithm-sequence" aria-label="Circular array">
      <h3>Circular array</h3>
      <div className="algorithm-sequence__cells">{run.input.nums.map((v, i) => (
        <div key={i} className="algorithm-sequence__cell" data-role={step.set && step.set.includes(i) ? 'window' : ''}>
          <small>[{i}]</small><strong>{v}</strong><span>{step.set && step.set.includes(i) ? 'peak' : ''}</span>
        </div>))}</div>
    </section>
    <output aria-label="Best cost so far">{step.best === null || step.best === undefined ? step.message : `Best cost ${step.best}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Two neighbours on the circle cannot both be strict peaks, so the peaks form a set of spaced positions.</p>
    <p>A chosen peak only needs to beat its larger neighbour, and raising other positions never helps it, so each set's cost is a plain sum.</p>
  </>} />
}
