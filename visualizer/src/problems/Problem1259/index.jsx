import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CircleSplitView from './CircleSplitView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1259',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Even number of people (e.g. 6)',
  url: 'https://leetcode.com/problems/handshakes-that-dont-cross/description/',
  complexity: 'O(n^2) time and O(n) space in the number of pairs, with arithmetic modulo 1000000007. The visualization caps the people at 20; the draft does not state an exact official bound.',
  examples: [
    { label: 'Four people', input: '4' },
    { label: 'Six people', input: '6' },
    { label: 'Two people', input: '2' },
    { label: 'Largest even group', input: '20' },
    { label: 'Eight people', input: '8' },
    { label: 'Long run: 18 people', input: '18' },
  ],
}

export default function Problem1259HandshakesThatDontCross() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CircleSplitView run={run} step={step} />}
      renderReasoning={() => (
        <p>Person 0 must shake hands with someone, and that chord splits the others into two independent groups that cannot cross it. Summing the products of the two group counts over every possible split gives the answer.</p>
      )}
    />
  )
}
