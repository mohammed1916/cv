import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'convert', label: 'To fraction', description: 'Turn a repeating decimal into numerator over denominator.' },
    { id: 'compare', label: 'Compare', description: 'Two fractions are equal when their cross products match.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Two numbers (JSON strings)',
  url: 'https://leetcode.com/problems/equal-rational-numbers/',
  complexity: 'O(1) big-integer arithmetic on the digit lengths.',
  examples: [
    { label: 'Equal', input: '{"s":"0.(52)","t":"0.5(25)"}' },
    { label: 'Not equal', input: '{"s":"0.(6)","t":"0.(9)"}' },
  ],
}

export default function EqualRationalNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Fraction">{step.num === null ? step.message : `${step.text}: ${step.num} / ${step.den}`}</output>
    {step.equal !== null && <p>{step.equal ? 'The two numbers are equal.' : 'The two numbers differ.'}</p>}
  </>} renderReasoning={() => <>
    <p>A repeating decimal is an exact fraction. The non-repeating digits set the power of ten, and the repeating block adds a term whose denominator is 9 for each repeated digit.</p>
    <p>Comparing fractions without division avoids rounding: a × d equals c × b exactly.</p>
  </>} />
}
