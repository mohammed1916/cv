import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryCodeView from './BinaryCodeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1256',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Nonnegative integer num (e.g. 5)',
  url: 'https://leetcode.com/problems/encode-number/description/',
  complexity: 'O(log num) time and O(log num) space for the binary digits. The visualization caps num at 1023; the draft does not state an exact official bound.',
  examples: [
    { label: 'Five', input: '5' },
    { label: 'Three', input: '3' },
    { label: 'Zero', input: '0' },
    { label: 'One', input: '1' },
    { label: 'Largest value', input: '1023' },
    { label: 'Long run: 1000', input: '1000' },
  ],
}

export default function Problem1256EncodeNumber() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BinaryCodeView run={run} step={step} />}
      renderReasoning={() => (
        <p>Writing num + 1 in binary and dropping the leading one gives the length-first code: shorter codes come first, and within one length the codes follow binary order.</p>
      )}
    />
  )
}
