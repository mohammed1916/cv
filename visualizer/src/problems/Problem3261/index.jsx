import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the answers list before the first query.' },
    { id: 'extend', label: 'Extend', description: 'Add the next character to the zero and one counts.' },
    { id: 'shrink', label: 'Shrink', description: 'Move the left end while both counts exceed k.' },
    { id: 'count', label: 'Count', description: 'Every start up to the left end is valid for this right end.' },
    { id: 'answer', label: 'Answer', description: 'Store the total for the finished query.' },
    { id: 'done', label: 'Complete', description: 'Return every answer in query order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s, k and queries',
  url: 'https://leetcode.com/problems/count-substrings-that-satisfy-k-constraint-ii/',
  complexity: 'O(n) per query with a sliding window. The visualization caps input at 12 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"0001111","k":2,"queries":[[0,6]]}' },
    { label: 'Two queries', input: '{"s":"010101","k":1,"queries":[[0,2],[2,5]]}' },
    { label: 'Single zero', input: '{"s":"0","k":0,"queries":[[0,0]]}' },
    { label: 'Equal bits, two queries', input: '{"s":"1111","k":0,"queries":[[0,3],[1,2]]}' },
    { label: 'Largest string, k at limit', input: '{"s":"101101101101","k":12,"queries":[[0,11]]}' },
    { label: 'Long run: twelve bits, five queries', input: '{"s":"010101010101","k":2,"queries":[[2,11],[0,5],[7,10],[0,1],[10,11]]}' },
  ],
}

export default function KConstraintSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Binary string" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.right}
      roleAt={i => (step.query >= 0 && i >= run.input.queries[step.query][0] && i <= run.input.queries[step.query][1] ? 'query' : '')} />
    <output aria-label="Counts">{`Zeros ${step.zeros}, ones ${step.ones}, k ${run.input.k}. Answers so far: ${step.answers.join(', ') || 'none'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A substring fails only when it has more than k zeros and more than k ones, so the valid starts for each end form a block that ends at the current window.</p>
  </>} />
}
