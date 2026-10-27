import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No bits compared yet.' },
    { id: 'bit', label: 'Compare', description: 'Compare this bit of n and k.' },
    { id: 'impossible', label: 'Impossible', description: 'k needs a bit that n does not have, so no sequence of changes works.' },
    { id: 'done', label: 'Complete', description: 'Report the number of changes, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": integer, "k": integer}, values 0 to 255',
  url: 'https://leetcode.com/problems/number-of-bit-changes-to-make-two-integers-equal/',
  complexity: 'O(log max(n, k)) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"n":13,"k":4}' },
    { label: 'Example 2', input: '{"n":21,"k":21}' },
    { label: 'Example 3', input: '{"n":14,"k":13}' },
  ],
}

export default function BitChanges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, k } = run.input
    return <>
      <IndexedSequence label="Bits of n / bits of k (bit 0 first)" length={8} valueAt={i => `${(n >> i) & 1}/${(k >> i) & 1}`} active={step.bit}
        roleAt={i => (((n >> i) & 1) && !((k >> i) & 1) ? 'clear' : ((k >> i) & 1) && !((n >> i) & 1) ? 'impossible' : '')} />
      <output aria-label="Changes">{`Changes so far: ${step.changes}`}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>A change turns one set bit of n off, so bits can only leave n. Any bit that k has and n lacks makes the target unreachable.</p>
    <p>Otherwise each bit that n has and k lacks needs exactly one change.</p>
  </>} />
}
