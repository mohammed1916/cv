import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the full set of moves and the requested rank.' },
    { id: 'H', label: 'Choose H', description: 'The rank falls within the paths that start with H, so take H.' },
    { id: 'V', label: 'Choose V', description: 'Skip the paths that start with H and take V.' },
    { id: 'done', label: 'Complete', description: 'Report the instruction string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Destination (JSON object with destination as [rows, columns] and k)',
  url: 'https://leetcode.com/problems/kth-smallest-instructions/',
  complexity: 'O(rows + columns) binomial evaluations. The visualization caps each dimension at 6.',
  examples: [
    { label: 'Example 1', input: '{"destination":[2,3],"k":1}' },
    { label: 'Example 2', input: '{"destination":[2,3],"k":2}' },
    { label: 'Example 3', input: '{"destination":[2,3],"k":3}' },
  ],
}

export default function KthInstructions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const length = run.total
    const placed = step.path.length
    return <>
      <IndexedSequence label="Moves" length={length} active={placed < length ? placed : -1}
        valueAt={i => step.path[i] ?? '·'}
        roleAt={i => (i < placed ? 'placed' : 'open')} />
      <output aria-label="Path">{`Path so far: ${step.path || '(empty)'} · rank k = ${step.k}`}</output>
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>The instructions are the paths in dictionary order, with H before V. The paths that start with H number C(h-1+v, v).</p>
    <p>If k fits within those, the next move is H. Otherwise skip them, subtract their count from k, and move V.</p>
  </>} />
}
