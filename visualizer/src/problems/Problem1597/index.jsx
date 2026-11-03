import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ExpressionTreeView from './ExpressionTreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Both stacks begin empty.' },
    { id: 'read', label: 'Read', description: 'Take the next token from the left.' },
    { id: 'leaf', label: 'Operand', description: 'A number becomes a leaf node.' },
    { id: 'open', label: 'Open', description: 'A "(" waits on the operator stack.' },
    { id: 'compare', label: 'Compare', description: 'Check precedence before pushing an operator.' },
    { id: 'combine', label: 'Combine', description: 'Pop an operator and two operands into a node.' },
    { id: 'discard', label: 'Close', description: 'Remove the matching "(".' },
    { id: 'push', label: 'Push', description: 'Store the operator for later.' },
    { id: 'finish', label: 'Drain', description: 'Combine whatever operators remain.' },
    { id: 'done', label: 'Result', description: 'The last operand is the root.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Infix string in double quotes (e.g. "12+3*4")',
  url: 'https://leetcode.com/problems/build-binary-expression-tree-from-infix-expression/',
  complexity: 'O(n) time and O(n) space for n tokens, using two stacks. Each token is read once and each node is combined once. The visualization caps the string at 21 characters with no spaces; the tree is drawn with the operators and numbers as written.',
  examples: [
    { label: 'Precedence', input: '"12+3*4"' },
    { label: 'Left associativity', input: '"100/7/2"' },
    { label: 'Parentheses', input: '"(2+9)*(10-4)/3"' },
  ],
}

export default function BuildExpressionTree() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <ExpressionTreeView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Operators wait on their stack until a weaker or equal operator arrives, so higher-precedence work is grouped into subtrees first.</p>
    </>}
  />
}
