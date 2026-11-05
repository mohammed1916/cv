import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2232',
  phases: [
    { id: 'setup', label: 'Split', description: 'Split the expression at its plus sign.' },
    { id: 'try', label: 'Try', description: 'Place one pair of parentheses and evaluate the result.' },
    { id: 'done', label: 'Result', description: 'Return the placement with the smallest value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"expression": "316+52"}',
  url: 'https://leetcode.com/problems/minimize-result-by-adding-parentheses-to-expression/',
  complexity: 'O(a * b) time and O(a + b) space for left digits a and right digits b. Each candidate is built and evaluated once.',
  examples: [
    { label: 'Example', input: '{"expression":"316+52"}' },
    { label: 'Short', input: '{"expression":"8+943"}' },
    { label: 'Long right', input: '{"expression":"5+6789"}' },
  ],
}

export default function MinimizeWithParentheses() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="candidate characters" length={step.shown.length} valueAt={i => step.shown[i]}
      active={step.shown.indexOf('+')}
      roleAt={i => (step.shown[i] === '(' || step.shown[i] === ')' ? 'paren' : step.shown[i] === '+' ? 'plus' : '')} />
    <output aria-label="Candidate value">{step.value === null ? 'not evaluated' : `${step.shown} = ${step.value}`}</output>
    <p aria-label="Best so far">{step.best ? `Best so far: ${step.best}` : 'No candidate yet'}</p>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The parentheses must open somewhere in the left number and close somewhere in the right number. Each choice gives a product of the outer digits with a sum in the middle.</p>
    <p>A prefix of the left number multiplies the group, and a suffix of the right number multiplies it too. An empty prefix or suffix counts as the factor 1.</p>
  </>} />
}
