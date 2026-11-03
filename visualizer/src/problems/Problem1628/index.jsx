import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1628',
  phases: [
    { id: 'start', label: 'Empty', description: 'No subtrees yet.' },
    { id: 'leaf', label: 'Leaf', description: 'A number becomes a leaf on the stack.' },
    { id: 'combine', label: 'Combine', description: 'An operator joins the two top subtrees.' },
    { id: 'done', label: 'Result', description: 'The single remaining tree gives the value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with postfix: a list of digits and operators + - * /',
  url: 'https://leetcode.com/problems/design-an-expression-tree-with-evaluate-function/',
  complexity: 'O(n) for n tokens. Each operator combines the two newest subtrees, so the stack never grows past the number of leaves.',
  examples: [
    { label: 'Example', input: '{"postfix":["6","3","+","5","*","4","-"]}' },
    { label: 'Division', input: '{"postfix":["9","2","/","1","+"]}' },
  ],
}

export default function DesignAnExpressionTreeWithEvaluateFunction() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ol aria-label="Subtree stack" className="algorithm-workspace__queue">{step.state.map((value, index) => <li key={index}>{value}</li>)}</ol>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each operator's two operands are the two most recent subtrees, which is why a stack builds the tree bottom up.</p>
    <p>Evaluating while combining gives the same value as evaluating the finished tree, and it needs no extra pass.</p>
  </>} />
}
