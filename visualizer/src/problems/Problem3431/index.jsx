import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GateBandView from './GateBandView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3431',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (values 1 to 3) and locked (0 or 1, same length)',
  url: 'https://leetcode.com/problems/minimum-unlocked-indices-to-sort-nums/',
  complexity: 'O(n) time and O(1) extra space. The official length reaches 100000; the visualization caps nums at 16 entries.',
  examples: [
    { label: 'Three unlocks', input: '{"nums":[2,1,1,3,2,3,2],"locked":[1,0,1,0,1,1,0]}' },
    { label: 'Locks that do not matter', input: '{"nums":[1,2,2,1,3,3],"locked":[1,0,0,1,1,0]}' },
    { label: 'Impossible', input: '{"nums":[2,3,2,1],"locked":[0,0,0,0]}' },
    { label: 'Already sorted', input: '{"nums":[1,1,3],"locked":[1,1,1]}' },
  ],
}

export default function MinimumUnlockedIndicesToSortNums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <GateBandView run={run} step={step} />} renderReasoning={() => <>
    <p>Allowed swaps only exchange values that differ by one, so a 1 and a 3 can never pass each other. A 3 anywhere before a 1 makes sorting impossible, whatever is unlocked.</p>
    <p>Otherwise, take the first 2 and the last 1. In sorted order that 1 has to end up left of that 2, and everything between them has to settle too, so every gate from the first 2 up to just before the last 1 gets used. The same holds for the first 3 and the last 2.</p>
    <p>Those two bands are exactly the gates needed: gates outside them never have to carry anything. So the answer is simply how many locked gates lie inside a band, and the replay at the end shows those gates are enough.</p>
  </>} />
}
