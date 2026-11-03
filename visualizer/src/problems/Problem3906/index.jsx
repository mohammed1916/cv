import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'route', label: 'Route', description: 'Show the 4 by 4 grid and the route.' },
    { id: 'digit', label: 'Digit DP', description: 'Advance one digit position at a time.' },
    { id: 'done', label: 'Result', description: 'Subtract the two counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with l, r (decimal strings below 10^16) and directions (three D and three R)',
  url: 'https://leetcode.com/problems/count-good-integers-on-a-grid-path/',
  complexity: 'O(16 * 10 * states) digit DP per bound, where the states are tight flag and last route digit. The visual shows a 16-digit example.',
  examples: [
    { label: 'Small range', input: '{"l":"0","r":"300","directions":"DDDRRR"}' },
    { label: 'Mixed route', input: '{"l":"1234","r":"5678","directions":"RDRDRD"}' },
  ],
}

export default function CountGoodIntegersOnAGridPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section className="algorithm-sequence" aria-label="Sample grid">
      <h3>Sample r in the 4 by 4 grid</h3>
      <div className="algorithm-sequence__cells">{(step.sampleDigits || '0000000000000000').split('').map((d, i) => (
        <div key={i} className="algorithm-sequence__cell" data-role={step.chain && step.chain.includes(i) ? 'window' : ''}>
          <small>cell {i}</small><strong>{d}</strong><span>{step.chain && step.chain.includes(i) ? 'on route' : ''}</span>
        </div>))}</div>
    </section>
    <output aria-label="Count status">{step.count !== null && step.count !== undefined ? `Good integers: ${step.count}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>The seven route cells are visited in increasing index order, so the rule is that their digits never decrease along the route.</p>
    <p>A digit DP counts 16-digit strings up to a bound, remembering whether the prefix is still tight and the last route digit.</p>
  </>} />
}
