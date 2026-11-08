import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with value x and n minus 1 bits to place.' },
    { id: 'skip', label: 'Keep bit', description: 'A set bit of x is kept and never reused.' },
    { id: 'place', label: 'Place bit', description: 'A zero bit of x takes the next bit of n minus 1.' },
    { id: 'done', label: 'Complete', description: 'Report the last element.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and x from 1 to 200, e.g. {"n":3,"x":4}',
  url: 'https://leetcode.com/problems/minimum-array-end/',
  complexity: 'O(log n) time and O(1) space. The visualization caps n and x at 200.',
  examples: [
    { label: 'Seven items, x three', input: '{"n":7,"x":3}' },
    { label: 'Twelve items, x twenty', input: '{"n":12,"x":20}' },
    { label: "Single item, single x", input: "{\"n\":1,\"x\":1}" },
    { label: "Equal n and x", input: "{\"n\":2,\"x\":2}" },
    { label: "Largest n and x", input: "{\"n\":200,\"x\":200}" },
    { label: "Long run: 173 and 149", input: "{\"n\":173,\"x\":149}" },
  ],
}

const bits = v => v.toString(2).padStart(9, '0')

export default function MinimumArrayEnd() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <table aria-label="Bit placement">
    <tbody>
      <tr><th scope="row">x</th><td>{bits(run.input.x)}</td></tr>
      <tr><th scope="row">value</th><td>{bits(step.value)}</td></tr>
      <tr><th scope="row">n - 1 left</th><td>{step.remaining}</td></tr>
      <tr><th scope="row">Position</th><td>{step.position}</td></tr>
    </tbody>
  </table>} renderReasoning={() => <>
    <p>Every element must keep the bits of x, so only the zero bits of x can change. The smallest last element places the bits of n minus 1 into those zero positions, lowest first.</p>
    <p>Filling the lowest free positions first keeps the value as small as possible.</p>
  </>} />
}
