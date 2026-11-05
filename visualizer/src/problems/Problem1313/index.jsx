import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1313', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Encoded list as a JSON array of frequency, value pairs',
  url: 'https://leetcode.com/problems/decompress-run-length-encoded-list/',
  complexity: 'O(output length) time and space, since every output value is written once.',
}

export default function RunLengthVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="Encoded pairs" length={run.input.length} valueAt={i => run.input[i]} active={s.pair ?? -1}
        roleAt={i => (s.pair !== null && s.pair !== undefined && (i === s.pair ? 'freq' : i === s.pair + 1 ? 'value' : ''))} />
      <StackLane title="Decoded output so far" items={s.out.map(String)} note={s.copy ? `copy ${s.copy} of ${s.freq}` : undefined} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Pairs expand in order:</strong> each frequency says how many copies of its value go into the output before the next pair starts.</p>
    <p>{step.message}</p>
  </>} />
}
