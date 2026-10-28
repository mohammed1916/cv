import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Fields', description: 'Look at the field counts in each direction.' },
    { id: 'count', label: 'Count pairs', description: 'Pair odd fields with even fields in the other direction.' },
    { id: 'done', label: 'Complete', description: 'Report the number of winning pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n and m, each from 1 to 100000, for example {"n":3,"m":2}',
  url: 'https://leetcode.com/problems/alice-and-bob-playing-flower-game/',
  complexity: 'O(1) time. The visualization shows the fields in the first direction.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"m":2}' },
    { label: 'Example 2', input: '{"n":1,"m":1}' },
  ],
}

export default function FlowerGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Fields 1 to n" length={run.input.n} valueAt={index => index + 1} roleAt={index => ((index + 1) % 2 === 1 ? 'odd' : 'even')} active={-1} indexOffset={1} />
    <output aria-label="Parity counts">{`Odd and even in n: ${step.oddN ?? 0} and ${step.evenN ?? 0}. In m: ${step.oddM ?? 0} and ${step.evenM ?? 0}.`}</output>
  </>} renderReasoning={() => <>
    <p>Alice wins when the total number of flowers is odd, so x and y must have different parity.</p>
    <p>Count the odd and even fields in each direction, then add the two ways of pairing odd with even.</p>
  </>} />
}
