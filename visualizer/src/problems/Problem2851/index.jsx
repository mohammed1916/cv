import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count rotations', description: 'Find which rotations of s equal t.' },
    { id: 'start', label: 'Start', description: 'Initial counts before any operation.' },
    { id: 'step', label: 'Operation', description: 'Apply one more operation to both counts.' },
    { id: 'done', label: 'Result', description: 'Report the count after k operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, t (equal length) and k (1 to 8)',
  url: 'https://leetcode.com/problems/string-transformation/',
  complexity: 'O(n * k) time with the two-count recurrence, O(n) extra space. The visualization caps n at 6 and k at 8.',
  examples: [
    { label: 'Example', input: '{"s":"abcd","t":"cdab","k":2}' },
    { label: 'Two letters', input: '{"s":"ab","t":"ba","k":1}' },
  ],
}

export default function StringTransformation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Operation counts">
      <tbody>
        <tr><th scope="row">s</th><td>{run.input.s}</td></tr>
        <tr><th scope="row">t</th><td>{run.input.t}</td></tr>
        <tr><th scope="row">After operations</th><td>{step.step} of {run.input.k}</td></tr>
        <tr><th scope="row">Sequences ending at t</th><td>{step.ways ?? '-'}</td></tr>
        <tr><th scope="row">All sequences</th><td>{step.total ?? '-'}</td></tr>
      </tbody>
    </table>
  </>} renderReasoning={() => <>
    <p>Each operation picks a suffix length from 1 to n minus 1, and the string after it is a rotation of s.</p>
    <p>From any state, the number of choices that land on t depends only on whether the state is t, so two counts are enough to track every sequence.</p>
  </>} />
}
