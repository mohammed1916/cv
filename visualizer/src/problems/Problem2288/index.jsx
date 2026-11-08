import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Split', description: 'Split the sentence into words.' },
    { id: 'price', label: 'Discount price', description: 'This word is a price, so write its discounted value with two decimals.' },
    { id: 'keep', label: 'Keep word', description: 'This word is not a price, so it is copied unchanged.' },
    { id: 'done', label: 'Complete', description: 'Join the words back into a sentence.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sentence and discount (JSON object with sentence and discount)',
  url: 'https://leetcode.com/problems/apply-discount-to-prices/',
  complexity: 'O(n) time for the sentence. The visualization caps the sentence at 80 characters.',
  examples: [
    { label: 'Three prices, 20 percent', input: '{"sentence":"pen $30 mug $7 cap 9","discount":20}' },
    { label: 'Own: mixed prices, 50 percent', input: '{"sentence":"$12 3 apples $4 $0$","discount":50}' },
    { label: 'Single price', input: '{"sentence":"$5","discount":10}' },
    { label: 'No prices, no change', input: '{"sentence":"apple pear","discount":30}' },
    { label: 'Zero discount', input: '{"sentence":"$7 $8","discount":0}' },
    { label: 'Long run: fills 80 characters', input: '{"sentence":"$860 $190 item k6 $141 item k3 k6 k5 item $703 item k8 item k8 item k2 k8 k2","discount":25}' },
  ],
}

export default function ApplyDiscountToPrices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.input.sentence.split(' ').length} valueAt={i => run.input.sentence.split(' ')[i]} active={step.index}
      roleAt={i => (i < step.priced.length ? 'done' : '')} />
    <output aria-label="Priced so far">{`Result so far: ${step.priced.join(' ') || '(empty)'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A price of P dollars becomes P times (100 minus the discount) cents. Working in whole cents keeps the result exact.</p>
  </>} />
}
