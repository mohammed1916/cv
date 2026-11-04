import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Length (JSON object with n)',
  url: 'https://leetcode.com/problems/generate-a-string-with-characters-that-have-odd-counts/',
  complexity: 'O(n) time and O(n) space for the output. The visualization accepts n up to 500.',
  examples: [
    { label: 'Odd n', input: '{"n":7}' },
    { label: 'Even n', input: '{"n":6}' },
    { label: 'One', input: '{"n":1}' },
  ],
}

export default function OddCountString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Output (target length ${run.input.n})`} length={step.snapshot.out.length}
      valueAt={i => step.snapshot.out[i]} active={step.snapshot.out.length - 1} roleAt={i => (step.snapshot.out[i] === 'b' ? 'single' : '')} />
    <RecordStateTable label="Letters so far" columns={['letter', 'count', 'parity']}
      rows={[...new Set(step.snapshot.out)].map(ch => {
        const count = step.snapshot.out.split(ch).length - 1
        return { letter: ch, count, parity: count % 2 === 1 ? 'odd' : 'even' }
      })} />
    <p>{step.snapshot.rule === 'single' ? 'Odd length: one letter is enough.' : step.snapshot.rule === 'pair' ? 'Even length: a repeated a plus one b.' : 'Choose the rule from the parity of n.'}</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A single letter repeated an odd number of times is valid when n is odd. When n is even, one odd count for a plus one b works because n - 1 is odd.</p>
  </>} />
}
