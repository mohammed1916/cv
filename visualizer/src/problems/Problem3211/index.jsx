import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'Start with no bits.' },
    { id: 'extend', label: 'Append bit', description: 'Try a bit after the current prefix.' },
    { id: 'skip', label: 'Skip 0', description: 'A zero after a zero is rejected.' },
    { id: 'emit', label: 'Full length', description: 'A complete string joins the answer.' },
    { id: 'done', label: 'Complete', description: 'Report every valid string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String length n (integer 1 to 8)',
  url: 'https://leetcode.com/problems/generate-binary-strings-without-adjacent-zeros/',
  complexity: 'O(n * F(n)) time, where F(n) is the number of answers, and O(n) recursion depth. The visualization caps n at 8.',
  examples: [
    { label: 'Length 3', input: '3' },
    { label: 'Length 1', input: '1' },
  ],
}

export default function NoAdjacentZeros() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p aria-label="Current prefix">Prefix: <code>{step.prefix === '' ? '(empty)' : step.prefix}</code></p>
    <ul aria-label="Answers found so far">{step.answer.map(text => <li key={text}><code>{text}</code></li>)}</ul>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Build the string left to right. The only forbidden move is a zero right after another zero.</p>
    <p>Trying 0 before 1 at each position produces the answers in sorted order.</p>
  </>} />
}
