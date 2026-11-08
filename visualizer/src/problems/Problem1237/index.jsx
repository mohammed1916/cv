import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Smallest z, sum', input: '{\"z\":1,\"operation\":\"sum\"}' },
    { label: 'Largest z, product', input: '{\"z\":100,\"operation\":\"product\"}' },
    { label: 'Long run: largest z, sum', input: '{\"z\":100,\"operation\":\"sum\"}' },
  ],
}

export default function PositiveSolutions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const z = run.input.z
    const roleAt = i => {
      const value = i + 1
      if (value === step.x && value === step.y) return 'x, y'
      if (value === step.x) return 'x (l)'
      if (value === step.y) return 'y (r)'
      return ''
    }
    return <>
      <IndexedSequence label={`Candidate values 1 to ${z}`} length={z} valueAt={i => i + 1} active={step.x - 1} roleAt={roleAt} indexOffset={1} />
      <table aria-label="Pointer state">
        <tbody>
          <tr><th scope="row">x (moves up)</th><td>{step.x}</td></tr>
          <tr><th scope="row">y (moves down)</th><td>{step.y}</td></tr>
          <tr><th scope="row">f(x, y)</th><td>{step.value === null ? '-' : step.value}</td></tr>
          <tr><th scope="row">z</th><td>{z}</td></tr>
        </tbody>
      </table>
      <output aria-label="Pairs found">{`Pairs found: ${step.pairs.map(p => `(${p[0]}, ${p[1]})`).join(' ') || 'none yet'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The function grows when either argument grows, so each comparison rules out a whole row or column of candidates.</p>
    <p>Starting at x = 1 and y = z, every step either records a pair or discards one candidate.</p>
  </>} />
}
