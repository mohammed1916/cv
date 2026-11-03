import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Release times and keys (JSON)',
  url: 'https://leetcode.com/problems/slowest-key/',
  complexity: 'O(n) time and O(1) extra state. The visualization accepts up to 20 presses.',
  examples: [
    { label: 'Mixed', input: '{"releaseTimes":[3,5,9,12,14],"keysPressed":"abcdz"}' },
    { label: 'Tie', input: '{"releaseTimes":[3,6],"keysPressed":"bz"}' },
    { label: 'Equal gaps', input: '{"releaseTimes":[2,4,6,8],"keysPressed":"qwer"}' },
  ],
}

export default function SlowestKey() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Presses (key · duration)" length={run.input.keysPressed.length}
      valueAt={i => `${run.input.keysPressed[i]} · ${step.durations[i] ?? '–'}`}
      active={step.index} roleAt={i => (i < step.durations.length ? 'measured' : '')} />
    <StackLane title="Best so far" items={step.bestKey ? [step.bestKey] : []} note={step.bestTime >= 0 ? `duration ${step.bestTime}` : undefined} />
  </>} renderReasoning={({ step }) => <>
    <p>Each duration is the gap from the previous release. Keeping only the best key so far is enough, since later presses are compared against that single value.</p>
    <p>When durations tie, the larger letter wins, so the tie rule is part of the comparison and not a separate pass.</p>
  </>} />
}
