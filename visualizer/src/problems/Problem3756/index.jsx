import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Prefixes', description: 'Build prefix arrays for the concatenation, the count and the sum.' },
    { id: 'skip', label: 'Zero', description: 'A zero adds no digit to x.' },
    { id: 'collect', label: 'Digit', description: 'A nonzero digit extends the concatenation.' },
    { id: 'window', label: 'Query', description: 'Pick the window for this query.' },
    { id: 'combine', label: 'Combine', description: 'Subtract the prefix to read x, then multiply by the digit sum.' },
    { id: 'done', label: 'Result', description: 'Every query has its answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (digits) and queries ([l, r] pairs)',
  url: 'https://leetcode.com/problems/concatenate-non-zero-digits-and-multiply-by-sum-ii/',
  complexity: 'O(m + q) time after the prefix arrays, with products kept modulo 1000000007. The visualization caps s at 20 digits.',
  examples: [
    { label: 'Example', input: '{"s":"3014","queries":[[0,3],[1,1]]}' },
    { label: 'Longer', input: '{"s":"907060","queries":[[0,5],[2,4]]}' },
  ],
}

export default function ConcatenateNonZeroDigitsAndMultiplyBySumII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at}
      roleAt={i => (step.span && i >= step.span[0] && i <= step.span[1] ? 'window' : '')} />
    <output aria-label="Query reading">{step.x === null
      ? `Window ${step.span ? `${step.span[0]} to ${step.span[1]}` : 'not chosen yet'}`
      : `x = ${step.x}, digit sum = ${step.sum}, answer = ${step.answer}`}</output>
  </>} renderReasoning={() => <>
    <p>Nonzero digits are read as one number, so a prefix can store the number built so far and each window can remove the older part by a power of ten.</p>
    <p>The digit sum and the nonzero count are prefix sums too, so every query costs constant work after the preparation.</p>
  </>} />
}
