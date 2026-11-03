import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sides', label: 'Sides', description: 'Split the people around pos.' },
    { id: 'sum', label: 'Split count', description: 'Choose how many visible people come from each side.' },
    { id: 'done', label: 'Result', description: 'Combine the sum with the free choice at pos.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, pos and k',
  url: 'https://leetcode.com/problems/direction-assignments-with-exactly-k-visible-people/',
  complexity: 'O(k) binomial terms once the coefficients are known. The visual caps n at 30.',
  examples: [
    { label: 'Example A', input: '{"n":3,"pos":1,"k":0}' },
    { label: 'Example B', input: '{"n":3,"pos":2,"k":1}' },
  ],
}

export default function DirectionAssignmentsWithExactlyKVisiblePeople() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <div className="algorithm-sequence" aria-label="Line of people">
      <h3>Line of people</h3>
      <div className="algorithm-sequence__cells">{Array.from({ length: run.input.n }, (_, i) => (
        <div key={i} className={`algorithm-sequence__cell ${i === run.input.pos ? 'is-active' : ''}`} data-role={i === run.input.pos ? 'pos' : i < run.input.pos ? 'left' : 'right'}>
          <small>[{i}]</small><strong>{i === run.input.pos ? 'pos' : i < run.input.pos ? 'L side' : 'R side'}</strong><span>{i < run.input.pos ? "visible if 'L'" : i > run.input.pos ? "visible if 'R'" : 'free'}</span>
        </div>))}</div>
    </div>
    <output aria-label="Count so far">{`Sides ${step.left} and ${step.right}; sum so far ${step.total}${step.a >= 0 ? `; split ${step.a}+${step.b}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Only people on the left of pos who pick L and people on the right who pick R are visible. So the visible count is a split between the two sides.</p>
    <p>Each split is counted with binomial coefficients, and the free person at pos doubles the total.</p>
  </>} />
}
