import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a total of zero.' },
    { id: 'add', label: 'Add letter', description: 'Score this letter by its reversed alphabet rank and its position.' },
    { id: 'done', label: 'Complete', description: 'Report the reverse degree.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String (JSON object with s)',
  url: 'https://leetcode.com/problems/reverse-degree-of-a-string/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 50 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abc"}' },
    { label: 'Example 2', input: '{"s":"zaza"}' },
  ],
}

export default function ReverseDegreeOfAString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.position}
      roleAt={i => (i < step.position ? 'read' : '')} />
    <output aria-label="Running total">{`Rank ${step.rank || '-'}, total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The letter z has rank 1 and a has rank 26, so earlier letters with high ranks count the most when they sit near the start.</p>
  </>} />
}
