import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Fix the high bits and start with x equal to 0.' },
    { id: 'agree', label: 'Agree', description: 'Both values share this bit.' },
    { id: 'split', label: 'Split', description: 'The values differ here, so one of them gets the 1.' },
    { id: 'done', label: 'Complete', description: 'Report the product modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a, b (0 to 255) and n (1 to 8) (JSON)',
  url: 'https://leetcode.com/problems/maximum-xor-product/',
  complexity: 'O(n) time. The product is computed with exact integers before the modulus.',
  examples: [
    { label: 'Example 1', input: '{"a":12,"b":5,"n":4}' },
    { label: 'Example 2', input: '{"a":6,"b":7,"n":5}' },
  ],
}

export default function MaximumXorProduct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.n
    return <>
      <IndexedSequence label="Bits of x, high to low" length={n} valueAt={i => (step.x >> (n - 1 - i)) & 1}
        active={step.bit === null ? -1 : n - 1 - step.bit} roleAt={i => (step.bit !== null && i > n - 1 - step.bit ? 'decided' : '')} />
      <output aria-label="Current values">{`a xor x = ${run.input.a ^ step.x}, b xor x = ${run.input.b ^ step.x}, gap = ${step.gap}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The product is largest when the two values are as large as possible and as close as possible.</p>
    <p>Where both values have a 0, flipping x makes both 1, which adds the most. Where they differ, x only chooses which value gets the 1, so the choice keeps their difference small.</p>
  </>} />
}
