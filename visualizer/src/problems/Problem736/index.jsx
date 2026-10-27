import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Tokenise', description: 'Split the expression into tokens.' },
    { id: 'enter', label: 'Enter form', description: 'Begin a let/add/mult form or read a variable name.' },
    { id: 'literal', label: 'Literal', description: 'Read an integer.' },
    { id: 'lookup', label: 'Lookup', description: 'Find a variable from the innermost scope outward.' },
    { id: 'bind', label: 'Bind', description: 'Store a let variable in the innermost scope.' },
    { id: 'combine', label: 'Combine', description: 'Finish an add, mult or let and return its value.' },
    { id: 'done', label: 'Complete', description: 'Return the overall value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Expression (JSON string)',
  url: 'https://leetcode.com/problems/parse-lisp-expression/',
  complexity: 'O(n * d) time for n tokens and scope depth d. The visualization caps the expression at 300 characters.',
  examples: [
    { label: 'Example 1', input: '"(let x 2 (mult x (let x 3 y 4 (add x y))))"' },
    { label: 'Example 2', input: '"(let x 3 x 2 x)"' },
    { label: 'Example 3', input: '"(let x 1 y 2 x (add x y) (add x y))"' },
    { label: 'Shadowing', input: '"(add (let x 5 (mult x x)) (let x 2 (add x -7)))"' },
  ],
}

export default function ParseLispExpression() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Tokens" length={run.tokens.length} active={step.token ?? -1} valueAt={i => run.tokens[i]} roleAt={i => i < step.pos ? 'read' : ''} />
    <StackLane title="Scope stack (outermost first)" items={step.scopes.map(s => `{${s.join(', ')}}`)} note={`recursion depth ${step.depth}`} />
    <output aria-label="Value">{step.value === undefined ? 'No value yet' : `Latest value: ${step.value}`}</output>
  </>} renderReasoning={() => <>
    <p>Each form is evaluated recursively; a let pushes a scope and lookups walk the scope stack from the top, so inner definitions shadow outer ones and disappear when the let closes.</p>
    <p>In a let, an item followed by the closing parenthesis, or an opening parenthesis, is the final expression; otherwise it is a variable name followed by its value expression.</p>
  </>} />
}
