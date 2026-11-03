import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Digits', description: 'Read the digits of n.' },
    { id: 'digit', label: 'Factorials', description: 'Add the factorial of each digit.' },
    { id: 'compare', label: 'Compare', description: 'Sort both digit strings and compare.' },
    { id: 'done', label: 'Result', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n',
  url: 'https://leetcode.com/problems/check-digitorial-permutation/',
  complexity: 'The digit factorial sum is computed once in O(d) time for d digits. Rearrangements are never enumerated.',
  examples: [
    { label: 'Digitorial', input: '{"n":40585}' },
    { label: 'Not digitorial', input: '{"n":1234}' },
  ],
}

export default function CheckDigitorialPermutation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <div className="algorithm-sequence" aria-label="Digit factorials">
      <h3>Digit factorials</h3>
      <div className="algorithm-sequence__cells">{step.terms.map(([d, f], index) =>
        <div key={index} className="algorithm-sequence__cell" data-role="window"><small>digit</small><strong>{d}</strong><span>{`${d}! = ${f}`}</span></div>)}</div>
    </div>
    <output aria-label="Total">{`Total ${step.total}${step.sortedTotal ? ` · sorted total ${step.sortedTotal} vs sorted n ${step.sortedN}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Rearranging the digits never changes the sum of their factorials, so the sum is one fixed number.</p>
    <p>A digitorial arrangement must equal that sum, so the question becomes whether the sum uses exactly the digits of n.</p>
  </>} />
}
