import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Compare', description: 'Compare s with target.' },
    { id: 'equal', label: 'Already equal', description: 'The strings match with no operation.' },
    { id: 'ones', label: 'Check ones', description: 'Check whether each string contains a 1.' },
    { id: 'done', label: 'Complete', description: 'Report whether the strings can be made equal.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and target, equal-length binary strings, e.g. {"s":"1010","target":"0110"}',
  url: 'https://leetcode.com/problems/apply-bitwise-operations-to-make-strings-equal/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the length at 12 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"1010","target":"0110"}' },
    { label: 'Example 2', input: '{"s":"11","target":"00"}' },
  ],
}

export default function MakeStringsEqual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run }) => {
    const cells = str => [...str].map((ch, i) => <td key={i} data-role={ch === '1' ? 'one' : 'zero'}>{ch}</td>)
    return <table aria-label="Binary strings">
      <tbody>
        <tr><th scope="row">s</th>{cells(run.input.s)}</tr>
        <tr><th scope="row">target</th>{cells(run.input.target)}</tr>
      </tbody>
    </table>
  }} renderReasoning={() => <>
    <p>An operation sets s[i] to the OR of the pair, so any 1 keeps at least one 1 in the string. A string with no 1 never changes.</p>
    <p>Therefore the strings match when they are already equal, or when both contain a 1 and the other positions can be shaped freely.</p>
  </>} />
}
