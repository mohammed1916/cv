import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Powers', description: 'Compute n squared and n cubed.' },
    { id: 'hex', label: 'Hexadecimal', description: 'Write n squared in base 16.' },
    { id: 'base36', label: 'Base 36', description: 'Write n cubed in base 36.' },
    { id: 'done', label: 'Complete', description: 'Join the two strings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n from 1 to 1000, for example {"n":13}',
  url: 'https://leetcode.com/problems/hexadecimal-and-hexatrigesimal-conversion/',
  complexity: 'O(log n) digits for each conversion.',
  examples: [
    { label: 'Example 1', input: '{"n":13}' },
    { label: 'Example 2', input: '{"n":1}' },
  ],
}

export default function HexConversion() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Output characters" length={step.text.length} valueAt={index => step.text[index]} active={step.text.length - 1} />
    <output aria-label="Output">{`Output so far: ${step.text || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Repeated division by the base gives the digits from the last one up, so they are reversed before joining.</p>
    <p>Hexadecimal uses digits 0 to 9 and letters A to F. Base 36 extends that with letters G to Z.</p>
  </>} />
}
