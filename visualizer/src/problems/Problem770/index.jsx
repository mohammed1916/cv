import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Tokenize', description: 'Split the expression into tokens and bind known variables.' },
    { id: 'atom', label: 'Atom', description: 'Turn a number, variable, or parenthesised group into a polynomial.' },
    { id: 'combine', label: 'Combine', description: 'Add, subtract, or multiply two polynomials.' },
    { id: 'done', label: 'Complete', description: 'Sort terms by degree then lexicographic order and format them.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object {expression, evalvars, evalints} (JSON, expression up to 80 chars)',
  url: 'https://leetcode.com/problems/basic-calculator-iv/',
  complexity: 'Polynomial multiplication dominates: roughly O(t1 * t2) per product for polynomials with t1 and t2 terms.',
  examples: [
    { label: 'e + 8 - a + 5', input: '{"expression":"e + 8 - a + 5","evalvars":["e"],"evalints":[1]}' },
    { label: 'e - 8 + temperature - pressure', input: '{"expression":"e - 8 + temperature - pressure","evalvars":["e","temperature"],"evalints":[1,12]}' },
    { label: '(e + 8) * (e - 8)', input: '{"expression":"(e + 8) * (e - 8)","evalvars":[],"evalints":[]}' },
    { label: 'cancel to zero', input: '{"expression":"a * b - b * a","evalvars":[],"evalints":[]}' },
  ],
}
export default function BasicCalculatorIV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Tokens" length={run.input.tokens.length} active={step.phase === 'start' ? -1 : Math.min(step.pos - 1, run.input.tokens.length - 1)} valueAt={i => run.input.tokens[i]} roleAt={i => (i < step.pos ? 'consumed' : '')} />
    <output aria-label="Current polynomial">Current polynomial (depth {step.depth}): {step.poly || '-'}</output>
    {step.phase === 'done' && <output aria-label="Answer">Answer: {JSON.stringify(run.result)}</output>}
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Precedence:</strong> expr handles + and -, term handles *, atom handles numbers, variables and parentheses, so multiplication binds tighter and brackets recurse.</p>
    <p><strong>Representation:</strong> each polynomial maps a sorted variable list to a coefficient, so a*b and b*a are the same monomial. Zero coefficients are removed.</p>
  </>} />
}
