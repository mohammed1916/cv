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
    { label: 'Own: a plus b times a', input: '"(let a 5 b 3 (add a (mult b a)))"' },
    { label: 'Own: nested add and mult', input: '"(let p -2 q 4 (add (mult p p) q))"' },
    { label: 'Own: shadowed z', input: '"(let z 7 (add z (let z 1 z)))"' },
    { label: 'Shadowing', input: '"(add (let x 5 (mult x x)) (let x 2 (add x -7)))"' },
    { label: 'Single number', input: '"5"' },
    { label: 'Nested shadowing', input: '"(let x 2 (let x (add x 3) (mult x x)))"' },
    { label: 'Negative arithmetic', input: '"(mult (add -4 1) (let y -2 y))"' },
    { label: 'Long run: 12 nested lets', input: '"(let a11 11 (add a11 (let a10 10 (add a10 (let a9 9 (add a9 (let a8 8 (add a8 (let a7 7 (add a7 (let a6 6 (add a6 (let a5 5 (add a5 (let a4 4 (add a4 (let a3 3 (add a3 (let a2 2 (add a2 (let a1 1 (add a1 (let a0 0 (add a0 0))))))))))))))))))))))))"' },
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
