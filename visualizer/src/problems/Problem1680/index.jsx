import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Upper limit n (whole number from 1 to 60)',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(n) time and O(1) space: one update per number, with the width kept as a single counter.',
  examples: [
    { label: 'Four', input: '4' },
    { label: 'Nine', input: '9' },
    { label: 'Twenty', input: '20' },
  ],
}

export default function ConcatenatedBinary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { i, width, result, bits } = step.snapshot
    return <>
      <table aria-label="Binary state" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <tbody>
          <tr><th scope="row">current number</th><td>{i ?? 'none yet'}</td></tr>
          <tr><th scope="row">binary of current</th><td>{bits ?? '-'}</td></tr>
          <tr><th scope="row">width (bits)</th><td>{width}</td></tr>
          <tr><th scope="row">result mod 1000000007</th><td>{result}</td></tr>
        </tbody>
      </table>
      <p>{i === null ? 'Each number is appended after the bits already in the result.' : `Shift the result left by ${width} bit${width === 1 ? '' : 's'}, then add ${i}.`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Width only changes at powers of two:</strong> a number has one more bit than the previous number exactly when it is a power of two.</p>
    <p><strong>Modulo at every step:</strong> shifting and adding before reducing gives the same remainder as reducing the full concatenation at the end.</p>
  </>} />
}
