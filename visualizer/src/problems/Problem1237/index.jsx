import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at x = 1 and y = z.' },
    { id: 'low', label: 'Too small', description: 'The value is below z, so x moves up.' },
    { id: 'high', label: 'Too large', description: 'The value is above z, so y moves down.' },
    { id: 'found', label: 'Solution', description: 'The value equals z; record the pair.' },
    { id: 'done', label: 'Complete', description: 'Report every pair found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with z and operation "sum" or "product" (JSON)',
  url: 'https://leetcode.com/problems/find-positive-integer-solution-for-a-given-equation/',
  complexity: 'O(z) time with two pointers, one call per step. The hidden function is fixed to sum or product here.',
  examples: [
    { label: 'Sum, z = 5', input: '{"z":5,"operation":"sum"}' },
    { label: 'Product, z = 5', input: '{"z":5,"operation":"product"}' },
  ],
}

export default function PositiveSolutions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Pointer state">
      <tbody>
        <tr><th scope="row">x</th><td>{step.x}</td></tr>
        <tr><th scope="row">y</th><td>{step.y}</td></tr>
        <tr><th scope="row">f(x, y)</th><td>{step.value === null ? '-' : step.value}</td></tr>
        <tr><th scope="row">z</th><td>{run.input.z}</td></tr>
      </tbody>
    </table>
    <output aria-label="Pairs found">{`Pairs found: ${step.pairs.map(p => `(${p[0]}, ${p[1]})`).join(' ') || 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>The function grows when either argument grows, so each comparison rules out a whole row or column of candidates.</p>
    <p>Starting at x = 1 and y = z, every step either records a pair or discards one candidate.</p>
  </>} />
}
