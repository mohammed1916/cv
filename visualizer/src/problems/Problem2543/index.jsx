import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at (1, 1) and read the target.' },
    { id: 'gcd', label: 'GCD', description: 'Compute the gcd of the target coordinates.' },
    { id: 'check', label: 'Power of two', description: 'Test whether the gcd is a power of two.' },
    { id: 'done', label: 'Answer', description: 'Report whether the target is reachable.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with targetX and targetY (1 to 1000)',
  url: 'https://leetcode.com/problems/check-if-point-is-reachable/',
  complexity: 'O(log(max(targetX, targetY))) time and O(1) space.',
  examples: [
    { label: 'Example 1', input: '{"targetX": 6, "targetY": 9}' },
    { label: 'Example 2', input: '{"targetX": 4, "targetY": 7}' },
  ],
}

export default function ReachablePoint() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <table aria-label="Gcd check">
      <tbody>
        <tr><th scope="row">Target</th><td>{`(${run.targetX}, ${run.targetY})`}</td></tr>
        <tr><th scope="row">GCD</th><td>{step.g ?? 'not yet computed'}</td></tr>
      </tbody>
    </table>
  )} renderReasoning={() => (
    <>
      <p>Subtraction moves keep the gcd of the two coordinates unchanged, and a doubling move can at most double it.</p>
      <p>Starting from (1, 1), the gcd is 1, so every reachable point has a gcd that is a power of two. The converse also holds, so the test is exact.</p>
    </>
  )} />
}
