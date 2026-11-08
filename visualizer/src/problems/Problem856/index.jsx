import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Outer level', description: 'The whole string starts at score 0.' },
    { id: 'open', label: 'Open', description: 'A new pair starts with score 0.' },
    { id: 'bare', label: 'Bare pair', description: '"()" is worth 1.' },
    { id: 'nested', label: 'Nested pair', description: '"(A)" is worth twice A.' },
    { id: 'done', label: 'Complete', description: 'The outer score is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Balanced parentheses (JSON string)',
  url: 'https://leetcode.com/problems/score-of-parentheses/',
  complexity: 'O(n) time and O(n) space for the stack.',
  examples: [
    { label: 'Nested', input: '"(()(()))"' },
    { label: 'Pairs', input: '"()()()"' },
    { label: 'Deep', input: '"((()))"' },
    { label: 'Single pair', input: '"()"' },
    { label: 'Equal pairs side by side', input: '"()()"' },
    { label: 'Longest allowed (50 characters)', input: '"((((((((((((((((((((((((()))))))))))))))))))))))))"' },
    { label: 'Long run: random 50 characters', input: '"((())()())(())()((((())(()()(((())((((()))))))))))"' },
  ],
}

export default function ScoreOfParentheses() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="Stack of open levels (top is the last row)" columns={['level', 'score']}
      rows={step.stack.map((score, level) => ({ level, score }))} activeRow={step.stack.length - 1} />
    <output aria-label="Step">{`Position ${step.pos}: ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A pair that contains a score A is worth 2A, and a bare pair is worth 1. Summing at each level gives the total.</p>
  </>} />
}
