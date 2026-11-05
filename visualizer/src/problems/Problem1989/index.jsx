import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1989',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'team (0 = not it, 1 = it) and dist (JSON)',
  url: 'https://leetcode.com/problems/maximum-number-of-people-that-can-be-caught-in-tag/',
  complexity: 'O(n) time and O(1) extra space: one forward pointer over the line.',
  examples: [
    { label: 'Window of three', input: '{"team":[1,0,0,1,0],"dist":2}' },
    { label: 'Tight distance', input: '{"team":[1,0,0,0,0,1],"dist":1}' },
    { label: 'Alternating', input: '{"team":[0,1,0,1,1,0],"dist":1}' },
  ],
}

export default function MaximumNumberCaughtInTag() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { team, index, l, r, caughtAt, caught, lastCatch } = step.snapshot
    const role = i => {
      const parts = []
      if (team[i] === 1) parts.push('it')
      if (caughtAt.includes(i)) parts.push('caught')
      if (i === l && l >= 0) parts.push('l')
      if (i === r && r >= 0) parts.push('r')
      return parts.join(' · ')
    }
    return <>
      <IndexedSequence label="Line of players (1 = it, 0 = runner)" length={team.length} valueAt={i => team[i]} active={index} roleAt={role} />
      <p>Catcher pointer <strong>index {index >= 0 ? index : '-'}</strong>; reach window from <strong>l</strong> to <strong>r</strong>. Caught: <strong>{caught}</strong>{lastCatch >= 0 ? `, last catch at ${lastCatch}` : ''}.</p>
    </>
  }} renderReasoning={() => <p>Each catcher takes the leftmost runner it can reach. Runners left of the window are out of reach for all later catchers, so the pointer only moves forward.</p>} />
}
