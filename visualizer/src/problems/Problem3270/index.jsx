import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pad', description: 'Pad each number to four digits.' },
    { id: 'digit', label: 'Position', description: 'Take the smallest digit at this position.' },
    { id: 'done', label: 'Result', description: 'Report the key.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num1, num2 and num3 (integers from 1 to 9999)',
  url: 'https://leetcode.com/problems/find-the-key-of-the-numbers/',
  complexity: 'O(1) time and space, since every number has at most four digits.',
  examples: [
    { label: 'Example', input: '{"num1":987,"num2":879,"num3":798}' },
    { label: 'Leading zeros', input: '{"num1":1,"num2":10,"num3":1000}' },
  ],
}

export default function FindTheKeyOfTheNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="key digits" length={4} valueAt={i => (i < step.key.length ? step.key[i] : '·')} active={step.position} />
    <output aria-label="Key so far">{`padded: ${step.digits.join(' | ')}, key: ${step.key || 'empty'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each number is padded to four digits so that the positions line up.</p>
    <p>At each position the smallest digit among the three numbers is the digit of the key there.</p>
  </>} />
}
