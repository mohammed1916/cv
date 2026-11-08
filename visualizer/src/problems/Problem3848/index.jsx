import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'One', input: '{"n":1}' },
    { label: 'Small', input: '{"n":135}' },
    { label: 'Largest', input: '{"n":999999999}' },
    { label: 'Long run: 987654321', input: '{"n":987654321}' },
  ],
}

// Two sorted digit strings side by side: the digits of n and the digits of the factorial sum.
function SortedDigits({ n, total, sortedN, sortedTotal }) {
  if (!sortedTotal) return null
  const cells = (text, other) => [...text].map((ch, i) => <span key={i} style={{ display: 'inline-block', minWidth: 22, textAlign: 'center', padding: '2px 4px', margin: 2, border: '1px solid var(--text-muted)', background: text === other ? 'var(--surface2)' : 'var(--primary)', color: text === other ? 'var(--text)' : 'var(--surface)' }}>{ch}</span>)
  return <div aria-label="Sorted digit comparison">
    <p>Digits of n sorted: {cells(sortedN, sortedTotal)}</p>
    <p>Digits of the factorial sum {total} sorted: {cells(sortedTotal, sortedN)}</p>
  </div>
}

export default function CheckDigitorialPermutation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of n (l and r are not used here; the current digit is marked)" length={String(run.input.n).length}
      active={step.terms.length - 1} valueAt={index => String(run.input.n)[index]} roleAt={index => index < step.terms.length ? 'added' : ''} />
    <div className="algorithm-sequence" aria-label="Digit factorials">
      <h3>Digit factorials</h3>
      <div className="algorithm-sequence__cells">{step.terms.map(([d, f], index) =>
        <div key={index} className="algorithm-sequence__cell" data-role="window"><small>digit</small><strong>{d}</strong><span>{`${d}! = ${f}`}</span></div>)}</div>
    </div>
    <SortedDigits n={run.input.n} total={step.total} sortedN={step.sortedN} sortedTotal={step.sortedTotal} />
    <output aria-label="Total">{`Total ${step.total}${step.sortedTotal ? ` · sorted total ${step.sortedTotal} vs sorted n ${step.sortedN}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Rearranging the digits never changes the sum of their factorials, so the sum is one fixed number.</p>
    <p>A digitorial arrangement must equal that sum, so the question becomes whether the sum uses exactly the digits of n.</p>
  </>} />
}
