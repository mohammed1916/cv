import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/valid-elements-in-an-array/',
  complexity: 'O(n) time and O(n) space. Two exclusive maxima scans avoid repeatedly searching each side.',
  phases: [
    { id: 'start', label: 'Input', description: 'Initialize exclusive maxima.' },
    { id: 'left', label: 'Scan →', description: 'Track the largest value strictly before each index.' },
    { id: 'right', label: 'Scan ←', description: 'Track the largest value strictly after each index.' },
    { id: 'select', label: 'Keep / reject', description: 'Keep values that beat at least one side.' },
    { id: 'done', label: 'Complete', description: 'Return values in original order.' },
  ],
  examples: [{ label: 'Mixed records', input: '[1,2,4,2,3,2]' }, { label: 'All equal', input: '[5,5,5,5]' }, { label: 'Singleton', input: '[1]' }],
}

export default function ValidElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const leftKnown = i => ['right', 'select', 'done'].includes(step.phase) || step.phase === 'left' && i <= step.index
    const rightKnown = i => ['select', 'done'].includes(step.phase) || step.phase === 'right' && i >= step.index
    const decided = i => step.phase === 'done' || step.phase === 'select' && i <= step.index
    return <>
      <IndexedSequence label="Input and decisions" length={run.input.length} active={step.index} valueAt={i => run.input[i]}
        roleAt={i => decided(i) ? run.selected[i] ? 'keep' : 'reject' : 'pending'} />
      <IndexedSequence label="Maximum strictly to the left →" length={run.input.length} active={step.phase === 'left' ? step.index : -1}
        valueAt={i => leftKnown(i) ? run.left[i] || 'empty' : '?'} />
      <IndexedSequence label="← Maximum strictly to the right" length={run.input.length} active={step.phase === 'right' ? step.index : -1}
        valueAt={i => rightKnown(i) ? run.right[i] || 'empty' : '?'} />
      {['select', 'done'].includes(step.phase) && <output aria-label="Valid elements">{JSON.stringify(run.input.filter((_, i) => decided(i) && run.selected[i]))}</output>}
    </>
  }} renderReasoning={({ run, step }) => <>
    <p>Qualification uses <strong>strictly greater</strong> and <strong>OR</strong>. Equal neighbors can block an interior value; endpoints always have one empty side.</p>
    {step.phase === 'select' && <table><caption>Decision at index {step.index}</caption>
      <thead><tr><th>Condition</th><th>Result</th></tr></thead><tbody>
        <tr><th>{run.input[step.index]} &gt; left maximum {run.left[step.index] || '(empty)'}</th><td>{String(run.input[step.index] > run.left[step.index])}</td></tr>
        <tr><th>{run.input[step.index]} &gt; right maximum {run.right[step.index] || '(empty)'}</th><td>{String(run.input[step.index] > run.right[step.index])}</td></tr>
      </tbody></table>}
    <p>The current element is excluded from both maxima. Zero represents an empty side because every allowed input value is positive.</p>
  </>} />
}
