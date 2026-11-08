import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Place pointers', description: 'left starts at 0² and right at the largest square not above c.' },
    { id: 'inspect', label: 'Compare sum', description: 'Add the two squares under the pointers and compare with c.' },
    { id: 'update', label: 'Move a pointer', description: 'A small sum moves left up; a large sum moves right down.' },
    { id: 'done', label: 'Result', description: 'Report the pair, or report that the pointers crossed.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Target c (JSON integer)',
  url: 'https://leetcode.com/problems/sum-of-square-numbers/',
  complexity: 'O(√c) time and O(1) extra space.',
  examples: [
    { label: 'Pair found', input: '13' },
    { label: 'Two equal squares', input: '8' },
    { label: 'No pair', input: '6' },
    { label: 'Zero is 0 squared plus 0 squared', input: '0' },
    { label: 'Prime three mod four has no pair', input: '1000003' },
    { label: 'Long run: nine-digit value', input: '123456789' },
  ],
}

export default function SumOfSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Squares 0² … top²" length={run.frames[0].right + 1} active={-1}
      valueAt={i => i * i}
      roleAt={i => (i === step.left && i === step.right ? 'l = r' : i === step.left ? 'l' : i === step.right ? 'r' : '')} />
    <output aria-label="Current sum">{step.sum === null || step.sum === undefined ? `Target ${step.c}` : `${step.left}² + ${step.right}² = ${step.sum} (target ${step.c})`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why two pointers:</strong> the squares are sorted, so a sum that is too small must move left up, and a sum that is too large must move right down.</p>
  </>} />
}
